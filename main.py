# server.py
import os
import requests
import numpy as np
import xarray as xr
from datetime import datetime, timedelta
import earthaccess
import asyncio
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional
import concurrent.futures

# ================================
# 1️⃣ FastAPI app
# ================================
app = FastAPI()

# --- Serve React build ---
frontend_build_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "frontend", "build")
)
app.mount(
    "/static",
    StaticFiles(directory=os.path.join(frontend_build_path, "static")),
    name="static",
)
app.mount(
    "/data",
    StaticFiles(directory=os.path.join(frontend_build_path, "data")),
    name="data",
)  # optional

@app.get("/")
def serve_react():
    return FileResponse(os.path.join(frontend_build_path, "index.html"))

@app.get("/{full_path:path}")
def serve_react_catchall(full_path: str):
    if full_path.startswith("weather"):
        return JSONResponse({"error": "Use POST /api/weather with JSON body"})
    index_file = os.path.join(frontend_build_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"error": "Index file not found"}

# ================================
# 2️⃣ Weather API
# ================================
class WeatherRequest(BaseModel):
    target_date_str: str
    lat: float
    lon: float
    target_hour: int = 12
    years_back: Optional[int] = 5

@app.post("/api/weather")
async def get_weather(data: WeatherRequest):
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        analyze_weather_history,
        data.target_date_str,
        data.lat,
        data.lon,
        data.target_hour,
        data.years_back,
    )
    return JSONResponse(result)

# ================================
# 3️⃣ Weather analysis function
# ================================
def analyze_weather_history(
    target_date_str,
    lat,
    lon,
    target_hour,
    years_back=5,
    window_hours=2,
    pressure_hPa=1000,
    rain_threshold=0.3,
    output_dir="Data",
):
    os.makedirs(output_dir, exist_ok=True)
    target_date = datetime.strptime(target_date_str, "%Y-%m-%d")
    all_results = []

    # 1. Collect granules for past N years ±7 days
    for year_offset in range(1, years_back + 1):
        year = target_date.year - year_offset
        hist_date = target_date.replace(year=year)
        start_date = hist_date - timedelta(days=7)
        end_date = hist_date + timedelta(days=7)
        print(f"[SEARCH] {start_date:%Y-%m-%d} to {end_date:%Y-%m-%d}")

        # Blocking search in executor
        def _blocking_search():
            return earthaccess.search_data(
                short_name="M2T1NXSLV",
                version="5.12.4",
                temporal=(start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")),
                bounding_box=(-180, -90, 180, 90),
            )

        results = _blocking_search()
        all_results.extend(results)

    print(f"[INFO] Found {len(all_results)} granules in total.")

    # 2. Extract OPeNDAP URLs
    od_urls = []
    for item in all_results:
        for u in item.get("umm", {}).get("RelatedUrls", []):
            if "OPENDAP" in u.get("Description", "").upper():
                url = u.get("URL")
                if url:
                    od_urls.append(url)
    print(f"[INFO] Total OPeNDAP URLs: {len(od_urls)}")

    # 3. Download granules (blocking, with threads)
    def download_granule(url):
        base = os.path.basename(url)
        path = os.path.join(output_dir, base + ".dap.nc4")
        if os.path.exists(path):
            return path
        vars_needed = ["T2M", "TQV", "TQL", "QV2M", "lon", "lat", "time"]
        params = {"dap4.ce": ";".join(vars_needed)}
        for attempt in range(3):
            try:
                r = requests.get(url + ".dap.nc4", params=params, timeout=30)
                if r.ok:
                    with open(path, "wb") as f:
                        f.write(r.content)
                    return path
            except Exception as e:
                print(f"[WARN] {base} attempt {attempt+1} failed: {e}")
        return None

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
        files = list(filter(None, ex.map(download_granule, od_urls)))

    print(f"[INFO] Files downloaded: {len(files)}")

    if not files:
        return {"error": "No granules downloaded."}

    files_abs = [os.path.abspath(f) for f in files]
    ds = xr.open_mfdataset(files_abs, combine="by_coords")
    print(f"[INFO] Dataset opened with {len(ds.time)} time points.")
    # 4. Select location & time window
    print(f"[INFO] Selecting data for lat={lat}, lon={lon}, hour={target_hour}±{window_hours}")
    t2m = ds["T2M"].sel(lat=lat, lon=lon, method="nearest")
    qv2m = ds["QV2M"].sel(lat=lat, lon=lon, method="nearest")
    tql = ds["TQL"].sel(lat=lat, lon=lon, method="nearest")
    tqv = ds["TQV"].sel(lat=lat, lon=lon, method="nearest")

    hours = t2m.time.dt.hour
    start_hour = (target_hour - window_hours) % 24
    end_hour = (target_hour + window_hours) % 24
    if start_hour <= end_hour:
        hour_mask = (hours >= start_hour) & (hours <= end_hour)
    else:
        hour_mask = (hours >= start_hour) | (hours <= end_hour)

    t2m, qv2m, tql, tqv = [v.where(hour_mask, drop=True) for v in [t2m, qv2m, tql, tqv]]

    # 5. Compute derived variables
    t2m_c = t2m - 273.15
    p = pressure_hPa * 100
    e = qv2m * p / (0.622 + 0.378 * qv2m)
    es = 611.2 * np.exp(17.67 * (t2m - 273.15) / (t2m - 29.65))
    rh = (100 * e / es).clip(0, 100)
    total = tqv + tql
    lf = xr.where(total > 0, (tql / total) * 100, np.nan)

    daily_temp = t2m_c.groupby(t2m_c.time.dt.date)
    daily_rh = rh.groupby(rh.time.dt.date)
    daily_lf = lf.groupby(lf.time.dt.date)

    mean_T2M, max_T2M, min_T2M = [float(daily_temp.mean().mean()),
                                  float(daily_temp.max().max()),
                                  float(daily_temp.min().min())]
    mean_RH, max_RH, min_RH = [float(daily_rh.mean().mean()),
                               float(daily_rh.max().max()),
                               float(daily_rh.min().min())]

    mean_lf = daily_lf.mean()
    rainy_days = np.sum(mean_lf.values > rain_threshold)
    total_days = len(mean_lf.values)
    rain_pct = float(rainy_days / total_days * 100) if total_days > 0 else np.nan

    # 6. Comfort score
    def weather_comfort_score(temp_c, rh_percent):
        T, RH = temp_c, rh_percent
        if T >= 26:
            HI = (-8.784695 + 1.61139411*T + 2.338549*RH - 0.14611605*T*RH
                  - 0.012308094*(T**2) - 0.016424828*(RH**2)
                  + 0.002211732*(T**2)*RH + 0.00072546*T*(RH**2)
                  - 0.000003582*(T**2)*(RH**2))
        elif T <= 10:
            HI = T - (100 - RH) * 0.05
        else:
            HI = T + (RH - 50) * 0.02
        if HI < 5: score, label = 30, "Cold"
        elif HI < 10: score, label = 50, "Cool"
        elif HI < 20: score, label = 80, "Comfortable"
        elif HI < 27: score, label = 90, "Pleasant"
        elif HI < 32: score, label = 70, "Slightly Warm"
        elif HI < 38: score, label = 50, "Hot"
        elif HI < 45: score, label = 30, "Very Hot"
        else: score, label = 10, "Dangerous Heat"
        return {"heat_index": HI, "comfort_score": score, "comfort_label": label}

    mean_weather_comfort_score = weather_comfort_score(mean_T2M, mean_RH)

    return {
        "mean_T2M": mean_T2M,
        "max_T2M": max_T2M,
        "min_T2M": min_T2M,
        "mean_RH": mean_RH,
        "max_RH": max_RH,
        "min_RH": min_RH,
        "rainy_day_percentage": rain_pct,
        "files_used": len(files),
        "comfort": mean_weather_comfort_score
    }
