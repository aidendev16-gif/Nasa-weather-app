// App.jsx (single-file, keeps your original features + fixes)
import React, { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import Globe from "three-globe";
import * as THREE from "three";


/* -------------------------- WeatherOverlay -------------------------- */

function WeatherOverlay({ type }) {
  if (!type) return null;

  if (type === "rain") {
    const dropletCount = 60;
    const droplets = Array.from({ length: dropletCount }, (_, i) => {
      const x = Math.random() * window.innerWidth;
      const delay = Math.random() * 2;
      const duration = 1.5 + Math.random();
      return (
        <circle
          key={i}
          cx={x}
          cy={-20}
          r={6}
          fill="url(#rainGradient)"
          style={{
            animation: `drop-fall ${duration}s linear ${delay}s infinite`
          }}
        />
      );
    });
    return (
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1000 }}>
        <svg width={window.innerWidth} height={window.innerHeight} style={{ position: "absolute", width: "100vw", height: "100vh" }}>
          <defs>
            <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b3e0ff" />
              <stop offset="100%" stopColor="#3399ff" />
            </linearGradient>
          </defs>
          {droplets}
        </svg>
        <style>{`
          @keyframes drop-fall {
            0% { transform: translateY(0); opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(${window.innerHeight + 40}px); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  if (type === "thunder") {
    const scale = 3;
    // Center the lightning horizontally
    const lightningWidth = 130 * scale;
    const offsetX = window.innerWidth / 2 - lightningWidth ;
    const offsetY = 60;
    const points = [
      [100, 0], [120, 60], [110, 60], [130, 120], [90, 80], [100, 80], [80, 0]
    ].map(([x, y]) => `${x * scale + offsetX},${y * scale + offsetY}`).join(' ');

    const dropletCount = 120;
    const droplets = Array.from({ length: dropletCount }, (_, i) => {
      const x = Math.random() * window.innerWidth;
      const delay = Math.random() * 2;
      const duration = 1 + Math.random();
      return (
        <circle
          key={i}
          cx={x}
          cy={-20}
          r={7}
          fill="url(#rainGradient)"
          style={{
            animation: `drop-fall ${duration}s linear ${delay}s infinite`
          }}
        />
      );
    });

    return (
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1000 }}>
        <svg width={window.innerWidth} height={window.innerHeight} style={{ position: "absolute", width: "100vw", height: "100vh" }}>
          <defs>
            <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b3e0ff" />
              <stop offset="100%" stopColor="#3399ff" />
            </linearGradient>
          </defs>
          {droplets}
          <polygon points={points} fill="yellow" stroke="gold" strokeWidth="12" style={{ animation: "bolt-flash-burst 3.7s linear infinite", opacity: 0 }} />
        </svg>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(255,255,200,0.2)", animation: "flash-burst 3.7s linear infinite" }} />
        <style>{`
          @keyframes flash-burst {
            0%{opacity:1;}
            5%{opacity:0;}
            8%{opacity:1;}
            13%{opacity:0;}
            16%{opacity:1;}
            22%{opacity:0;}
            100%{opacity:0;}
          }
          @keyframes bolt-flash-burst {
            0%{opacity:1;}
            5%{opacity:0;}
            8%{opacity:1;}
            13%{opacity:0;}
            16%{opacity:1;}
            22%{opacity:0;}
            100%{opacity:0;}
          }
          @keyframes drop-fall {
            0% { transform: translateY(0); opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(${window.innerHeight + 40}px); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  if (type === "dusty") {
    return (
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1000, background: "rgba(194,178,128,0.35)" }} />
    );
  }

  if (type === "snow") {
    const snowCount = 40;
    const snowflakes = Array.from({ length: snowCount }, (_, i) => {
      const x = Math.random() * window.innerWidth;
      const delay = Math.random() * 2;
      const duration = 2 + Math.random() * 1.5;
      const r = 12 + Math.random() * 8;
      return (
        <circle
          key={i}
          cx={x}
          cy={-30}
          r={r}
          fill="white"
          opacity="0.85"
          style={{
            animation: `snow-fall ${duration}s linear ${delay}s infinite`
          }}
        />
      );
    });
    return (
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1000 }}>
        <svg width={window.innerWidth} height={window.innerHeight} style={{ position: "absolute", width: "100vw", height: "100vh" }}>
          {snowflakes}
        </svg>
        <style>{`
          @keyframes snow-fall {
            0% { transform: translateY(0); opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(${window.innerHeight + 60}px); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  if (type === "sunny") {
    const sunX = window.innerWidth / 2;
    const sunY = 120;
    const sunR = 70;
    const rayCount = 16;
    const rays = Array.from({ length: rayCount }, (_, i) => {
      const angle = (2 * Math.PI * i) / rayCount;
      const x1 = sunX + Math.cos(angle) * (sunR + 10);
      const y1 = sunY + Math.sin(angle) * (sunR + 10);
      const x2 = sunX + Math.cos(angle) * (sunR + 40);
      const y2 = sunY + Math.sin(angle) * (sunR + 40);
      return (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="gold"
          strokeWidth="8"
          opacity="0.7"
        />
      );
    });
    return (
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1000 }}>
        <svg width={window.innerWidth} height={window.innerHeight} style={{ position: "absolute", width: "100vw", height: "100vh" }}>
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="yellow" stopOpacity="1" />
              <stop offset="70%" stopColor="gold" stopOpacity="0.7" />
              <stop offset="100%" stopColor="gold" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={sunX} cy={sunY} r={sunR + 40} fill="url(#sunGlow)" opacity="0.5" />
          <circle cx={sunX} cy={sunY} r={sunR} fill="yellow" stroke="gold" strokeWidth="8" />
          {rays}
        </svg>
      </div>
    );
  }

  return null;
}

/* -------------------------- Utility: toCartesian -------------------------- */
function toCartesian([lat, lng], radius = 100, height = 0) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = -(lng - 90) * (Math.PI / 180);
  const r = radius + height;
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

/* -------------------------- BillboardText -------------------------- */
function BillboardText({ position, children, ...props }) {
  const ref = useRef();
  const { camera } = useThree();

  useFrame(() => {
    if (ref.current) ref.current.lookAt(camera.position);
  });

  return (
    <Text ref={ref} position={position} {...props}>
      {children}
    </Text>
  );
}

/* -------------------------- Earth component (kept structure) -------------------------- */
function Earth({ animatedPin, onPinClick }) {
  const [globeObj, setGlobeObj] = useState(null);
  const [cityLabels, setCityLabels] = useState([]);
  const [pins, setPins] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("/data/world-countries.geojson").then((r) => r.json()),
      fetch("/data/ne_110m_populated_places.json").then((r) => r.json())
    ])
      .then(([countries, cities]) => {
        const globe = new Globe()
          .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-dark.jpg")
          .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
          .polygonsData(countries.features)
          .polygonCapColor(() => "rgba(60,140,180,0.15)")
          .polygonSideColor(() => "rgba(0,0,0,0)")
          .polygonStrokeColor(() => "#ffffff");

        const group = new THREE.Group();
        const labels = [];
        const pinData = [];

        (cities.features || []).forEach((f) => {
          const [lng, lat] = f.geometry.coordinates;
          const name = f.properties.NAMEASCII;
          const pop = f.properties.POP_MAX || 1000;

          const height = Math.log(pop + 1) * 0.5;
          const surfacePosition = toCartesian([lat, lng], 100, height / 2);
          // Calculate rotation so cone points toward earth core
          const direction = new THREE.Vector3().copy(surfacePosition).normalize().negate();
          const up = new THREE.Vector3(0, 1, 0);
          const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
          const euler = new THREE.Euler().setFromQuaternion(quaternion);

          pinData.push({
            name,
            pop,
            position: [surfacePosition.x, surfacePosition.y, surfacePosition.z],
            rotation: [euler.x, euler.y, euler.z],
            coords: [lat, lng],
            height
          });

          const labelPosition = toCartesian([lat, lng], 100, height + 2);
          labels.push({
            name,
            position: [labelPosition.x, labelPosition.y, labelPosition.z],
            population: pop,
            coords: [lat, lng]
          });
        });

        // Equator line
        const equatorGeometry = new THREE.RingGeometry(100, 101, 128);
        const equatorMaterial = new THREE.MeshBasicMaterial({ color: "cyan", side: THREE.DoubleSide });
        const equatorRing = new THREE.Mesh(equatorGeometry, equatorMaterial);
        equatorRing.rotation.x = Math.PI / 2;
        group.add(equatorRing);

        globe.add(group);
        setGlobeObj(globe);
        setCityLabels(labels);
        setPins(pinData);
      })
      .catch((err) => console.error("Failed to load geojson:", err));
  }, []);

  return (
    <>
      {globeObj && <primitive object={globeObj} />}
      {/* Pins */}
      {pins.map((pin, idx) => {
        const isAnimated = animatedPin === pin.coords.join(",");
        // Hide other pins if one is selected
        if (animatedPin && !isAnimated) return null;
        return (
          <mesh
            key={idx}
            position={pin.position}
            rotation={pin.rotation}
            onPointerDown={() => onPinClick && onPinClick(pin)}
            castShadow
          >
            <coneGeometry args={[0.3, pin.height, 6]} />
            <meshStandardMaterial color={isAnimated ? "gold" : "orange"} emissive="orange" />
          </mesh>
        );
      })}
      {/* Labels */}
      {cityLabels.map((label, index) => {
        const isAnimated = animatedPin === label.coords.join(",");
        if (animatedPin && !isAnimated) return null;
        return (
          <BillboardText
            key={"label-" + index}
            position={label.position}
            fontSize={isAnimated ? 2 : 1}
            color={isAnimated ? "gold" : "white"}
            anchorX="center"
            anchorY="middle"
          >
            {label.name}
          </BillboardText>
        );
      })}
    </>
  );
}

/* -------------------------- Smooth flyTo (kept) -------------------------- */
function flyTo(camera, controls, [lat, lng], onComplete) {
  const minRadius = 120;
  const maxRadius = 350;
  const startTarget = controls.target.clone();
  const endTarget = toCartesian([lat, lng], 0);

  function zoomOut() {
    const zoomRadius = maxRadius;
    const zoomTarget = camera.position.clone().setLength(zoomRadius);
    const zoomDuration = 400;
    const zoomStart = camera.position.clone();
    const zoomEnd = zoomTarget;
    const zoomStartTime = performance.now();

    function zoomAnimate() {
      const elapsed = performance.now() - zoomStartTime;
      const t = Math.min(elapsed / zoomDuration, 1);
      camera.position.lerpVectors(zoomStart, zoomEnd, t);
      controls.target.copy(startTarget);
      if (t < 1) {
        requestAnimationFrame(zoomAnimate);
      } else {
        rotateToCity();
      }
    }
    zoomAnimate();
  }

  function slerp(a, b, t) {
    const angle = a.angleTo(b);
    if (angle === 0) return a.clone();
    const sinA = Math.sin((1 - t) * angle) / Math.sin(angle);
    const sinB = Math.sin(t * angle) / Math.sin(angle);
    return a.clone().multiplyScalar(sinA).add(b.clone().multiplyScalar(sinB));
  }

  function rotateToCity() {
    const initialRadius = maxRadius;
    const startPos = camera.position.clone();
    const endPos = toCartesian([lat, lng], initialRadius);
    const angle = startPos.angleTo(endPos);
    const rotateDuration = Math.max(250, angle * 600);
    const rotateStartTime = performance.now();

    function rotateAnimate() {
      const elapsed = performance.now() - rotateStartTime;
      const t = Math.min(elapsed / rotateDuration, 1);
      camera.position.copy(slerp(startPos, endPos, t));
      controls.target.lerpVectors(startTarget, endTarget, t);
      if (t < 1) {
        requestAnimationFrame(rotateAnimate);
      } else {
        zoomIn();
      }
    }
    rotateAnimate();
  }

  function zoomIn() {
    const zoomRadius = minRadius;
    const zoomTarget = toCartesian([lat, lng], zoomRadius);
    const zoomDuration = 400;
    const zoomStart = camera.position.clone();
    const zoomEnd = zoomTarget;
    const zoomStartTime = performance.now();

      function zoomAnimate() {
      const elapsed = performance.now() - zoomStartTime;
      const t = Math.min(elapsed / zoomDuration, 1);
      camera.position.lerpVectors(zoomStart, zoomEnd, t);
      controls.target.copy(endTarget);
      if (t < 1) {
        requestAnimationFrame(zoomAnimate);
      } else {
        if (window.animatePin) window.animatePin([lat, lng]);
        if (typeof onComplete === 'function') onComplete();
      }
    }
    zoomAnimate();
  }

  zoomOut();
}

/* -------------------------- SearchPanel (kept) -------------------------- */
function SearchPanel({ onSelectCity }) {
  const [query, setQuery] = useState("");
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetch("/data/ne_110m_populated_places.json")
      .then((r) => r.json())
      .then((data) => {
        const features = data.features || [];
        const cityList = features.map((f) => ({
          name: f.properties.NAMEASCII,
          country: f.properties.ADM0NAME,
          coords: [f.geometry.coordinates[1], f.geometry.coordinates[0]]
        }));
        setCities(cityList);
      })
      .catch((err) => {
        console.error("Failed to load cities JSON:", err);
      });
  }, []);

  const results = query.length
    ? cities.filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.country.toLowerCase().includes(query.toLowerCase())
    )
    : [];

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "8px",
        width: "220px",
        fontSize: "14px",
        zIndex: 1002
      }}
    >
      <input
        type="text"
        placeholder="Search city..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "6px",
          borderRadius: "4px",
          border: "none",
          outline: "none",
          marginBottom: "6px",
        }}
      />
      <div style={{ maxHeight: 260, overflowY: "auto" }}>
        {results.map((c, i) => (
          <div
            key={i}
            onClick={() => onSelectCity(c)}
            style={{
              padding: "6px",
              borderBottom: "1px solid rgba(255,255,255,0.2)",
              cursor: "pointer",
            }}
          >
            {c.name}, {c.country}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------- MAIN App -------------------------- */
export default function App() {
  const cameraRef = useRef();
  const controlsRef = useRef();
  const [selectedLocation, setSelectedLocation] = useState(null); // {lat, lng} or null

  const [animatedPin, setAnimatedPin] = useState(null);
  const [weatherType, setWeatherType] = useState(null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  // <-- Add these two
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState({
    avgTemp: 0,
    maxTemp: 0,
    minTemp: 0,
    humidity: 0,
    rainPercentage: 0,
    comfort: "—",
    wind: 0,
    temperature: 0
  });

  // Date slider state (dayjs)
  const [currentDate, setCurrentDate] = useState(dayjs());

  // Data type toggle
  const [dataType, setDataType] = useState("temperature");

  // Weather data collector placeholder (you will replace with your backend call)
  // Inside your App component, replace your fetch effect with this:

  // Centralized weather fetch helper (returns a Promise)
  function fetchWeather(loc = selectedLocation, date = currentDate) {
    if (!loc) {
      return Promise.resolve();
    }

    setLoading(true);

    const payload = {
      target_date_str: date.format("YYYY-MM-DD"),
      lat: loc.lat,
      lon: loc.lng,
      target_hour: date.hour(),
      years_back: 5
    };

    return fetch("/api/weather", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then(data => {
        console.log("Weather data from backend:", data);

        setWeatherData({
          avgTemp: data.mean_T2M,
          maxTemp: data.max_T2M,
          minTemp: data.min_T2M,
          humidity: data.mean_RH,
          rainPercentage: data.rainy_day_percentage ?? (data.mean_PRECTOT ?? data.precipitation) ?? 0,
          comfort: data.comfort ?? "—",
          wind: data.mean_WIND ?? 0,
          temperature: data.mean_T2M
        });

        // Choose overlay using requested thresholds:
        // 0-50% -> sunny, 50-75% -> rain, 75-100% -> thunder
        const rainPct = Number(data.rainy_day_percentage ?? 0);
        if ((data.mean_T2M ?? 0) < 5) {
          setWeatherType("snow");
        } else if (rainPct >= 75) {
          setWeatherType("thunder");
        } else if (rainPct >= 50) {
          setWeatherType("rain");
        } else if (rainPct < 50) {
          // Sunny if no significant rain
          setWeatherType("sunny");
        } else {
          setWeatherType(null);
        }
      })
      .catch(err => {
        console.error("Failed to fetch weather data:", err);
        throw err;
      })
      .finally(() => setLoading(false));
  }
  // NOTE: do NOT auto-fetch when user selects a city or changes time.
  // Weather is fetched only when the user clicks the "Check Weather" button.


  // Expose global helpers (kept as in your code)
  useEffect(() => {
    window.animatePin = (coords) => {
      setAnimatedPin(coords.join(","));
    };
    window.showRain = () => setWeatherType("rain");
    window.showThunder = () => setWeatherType("thunder");
    window.showDusty = () => setWeatherType("dusty");
    window.showSnow = () => setWeatherType("snow");
    window.showSunny = () => setWeatherType("sunny");
    window.hideWeather = () => setWeatherType(null);
    return () => {
      window.animatePin = null;
      window.showRain = null;
      window.showThunder = null;
      window.showDusty = null;
      window.showSnow = null;
      window.showSunny = null;
      window.hideWeather = null;
    };
  }, []);

  // Weather types list & randomizer
  const weatherOptions = ["rain", "thunder", "dusty", "snow", "sunny"];
  function showRandomWeather() {
    const type = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
    setWeatherType(type);
  }
  useEffect(() => {
    window.showRandomWeather = showRandomWeather;
    return () => { window.showRandomWeather = null; };
  }, []);

  // City handlers
  function handleSelectCity(city) {
    const loc = { lat: city.coords[0], lng: city.coords[1] };
    setSelectedLocation(loc);

    setAnimatedPin(null);
    setWeatherType(null);

    // Only fly to the city. Do NOT auto-fetch. User must click "Check Weather".
    if (cameraRef.current && controlsRef.current) {
      flyTo(cameraRef.current, controlsRef.current, city.coords, () => {
        // keep zoom state false until user requests weather
      });
    }
  }
  function handlePinClick(pin) {
    const loc = { lat: pin.coords[0], lng: pin.coords[1] };
    setSelectedLocation(loc);
    setAnimatedPin(null);
    setWeatherType(null);
    // Only fly to the pin; don't auto-fetch.
    if (cameraRef.current && controlsRef.current) {
      flyTo(cameraRef.current, controlsRef.current, pin.coords, () => {});
    }
  }

  /* --------------------- CoordSearchPanel (kept inside App) --------------------- */
  function CoordSearchPanel() {
    const [lat, setLat] = useState(0);
    const [lng, setLng] = useState(0);

    function handleLatChange(e) {
      let v = Number(e.target.value);
      if (isNaN(v)) v = 0;
      if (v > 90) v = 90;
      if (v < -90) v = -90;
      setLat(v);
    }
    function handleLngChange(e) {
      let v = Number(e.target.value);
      if (isNaN(v)) v = 0;
      if (v > 180) v = 180;
      if (v < -180) v = -180;
      setLng(v);
    }
    
    return (
      <div style={{
        position: "fixed", top: 16, left: 16, background: "rgba(0,0,0,0.8)", color: "white", padding: 10, borderRadius: 8, width: 200, zIndex: 1002
      }}>
        <div style={{ marginBottom: 6, fontWeight: "bold" }}>Coordinates</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <label htmlFor="lat-input" style={{ fontSize: 12, marginBottom: 2 }}>Latitude</label>
            <input id="lat-input" type="number" value={lat} onChange={handleLatChange} placeholder="Latitude" min={-90} max={90} style={{ width: "80px", padding: 6 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <label htmlFor="lng-input" style={{ fontSize: 12, marginBottom: 2 }}>Longitude</label>
            <input id="lng-input" type="number" value={lng} onChange={handleLngChange} placeholder="Longitude" min={-180} max={180} style={{ width: "80px", padding: 6 }} />
          </div>
        </div>
        <button style={{ marginTop: 6, width: "100%", padding: 8 }} onClick={() => {
          const loc = { lat, lng };
          setAnimatedPin(null);
          setSelectedLocation(loc);
          setWeatherType(null);
          // fetch weather immediately
          fetchWeather(loc, currentDate).catch(() => {});
          if (cameraRef.current && controlsRef.current) {
            flyTo(cameraRef.current, controlsRef.current, [lat, lng], () => setIsZoomedIn(true));
          } else {
            setIsZoomedIn(true);
          }
        }}>Go</button>
      </div>
    );
  }

  // Date selector logic
  const today = dayjs();
  const minDate = today.subtract(365, "day");
  const maxDate = today.add(365, "day");

  // UI state for search mode
  const [searchMode, setSearchMode] = useState("name"); // "name" or "coords"

  return (
    <>
      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,
          background: "rgba(0,0,0,0.6)",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 24,
          fontWeight: "bold"
        }}>
          Loading weather data...
        </div>
      )}

      {/* Date & time selector + search mode */}
      <div style={{ position: "fixed", left: 16, bottom: 50, zIndex: 1003, background: "rgba(0,0,0,0.7)", color: "white", padding: 8, borderRadius: 8 }}>
        <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: "6px" }}>
          <input
            type="date"
            value={currentDate.format("YYYY-MM-DD")}
            min={minDate.format("YYYY-MM-DD")}
            max={maxDate.format("YYYY-MM-DD")}
            onChange={e => setCurrentDate(dayjs(e.target.value).hour(currentDate.hour()))}
            style={{ fontSize: 16, padding: 6, borderRadius: 4, border: "none", background: "#222", color: "white" }}
          />
          <select
            value={currentDate.hour()}
            onChange={e => setCurrentDate(currentDate.hour(Number(e.target.value)))}
            style={{ fontSize: 16, padding: 6, borderRadius: 4, border: "none", background: "#222", color: "white" }}
          >
            {[...Array(24).keys()].map(h => (
              <option key={h} value={h}>{h}:00</option>
            ))}
          </select>

          {/* Search mode toggle */}
          <button
            style={{ background: searchMode === "name" ? "#ffd700" : "#333", color: searchMode === "name" ? "black" : "white", border: "none", borderRadius: 4, padding: "6px 12px", cursor: "pointer" }}
            onClick={() => setSearchMode("name")}
          >
            Search by Name
          </button>
          <button
            style={{ background: searchMode === "coords" ? "#ffd700" : "#333", color: searchMode === "coords" ? "black" : "white", border: "none", borderRadius: 4, padding: "6px 12px", cursor: "pointer" }}
            onClick={() => setSearchMode("coords")}
          >
            Search by Coords
          </button>

          {/* Manual weather check button */}
          <button
            style={{ background: "#28a745", color: "white", border: "none", borderRadius: 4, padding: "6px 14px", cursor: "pointer" }}
            onClick={() => {
              if (!selectedLocation) {
                alert("Please select a location first.");
                return;
              }

              // Validate date within allowed range
              if (currentDate.isBefore(minDate) || currentDate.isAfter(maxDate)) {
                alert("Please select a valid date within one year from today.");
                return;
              }

              console.log("📡 Check Weather requested for:", selectedLocation, currentDate.format());

              // Prepare to zoom and show only the selected pin
              const pinCoordsStr = `${selectedLocation.lat},${selectedLocation.lng}`;

              function onZoomed() {
                // Hide other pins by marking this as the animated pin
                setAnimatedPin(pinCoordsStr);
                setIsZoomedIn(true);
                fetchWeather().catch(err => {
                  console.error("❌ Failed to fetch weather:", err);
                  alert("Failed to fetch weather data.");
                });
              }

              // If camera exists, ensure it's zoomed in by flying to the selected location
              if (cameraRef.current && controlsRef.current) {
                // Decide if camera is already near enough by checking distance
                const dist = cameraRef.current.position.length();
                const needFly = dist > 140; // threshold slightly above minRadius
                if (needFly) {
                  flyTo(cameraRef.current, controlsRef.current, [selectedLocation.lat, selectedLocation.lng], onZoomed);
                } else {
                  // Already close enough — just set state and fetch
                  onZoomed();
                }
              } else {
                // No camera available — just fetch and show
                onZoomed();
              }
            }}
          >
            🌤 Check Weather
          </button>
        </div>
      </div>

      {!loading && selectedLocation && weatherData && isZoomedIn && (
        <div
          style={{
            position: "fixed",
            right: 50,
            bottom: 50,
            zIndex: 1003,
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: 10,
            borderRadius: 8,
            fontSize: "14px",
            lineHeight: "1.6em",
            minWidth: "180px"
          }}
        >
          <div>🌡️ <b>AVG Temperature:</b> {weatherData.avgTemp?.toFixed(1) ?? "N/A"}°C</div>
          <div>🌡️ <b>MAX Temperature:</b> {weatherData.maxTemp?.toFixed(1) ?? "N/A"}°C</div>
          <div>🌡️ <b>MIN Temperature:</b> {weatherData.minTemp?.toFixed(1) ?? "N/A"}°C</div>
          <div>💧 <b>Humidity:</b> {weatherData.humidity?.toFixed(0) ?? "N/A"}%</div>
          <div>🌧️ <b>Rain %:</b> {weatherData.rainPercentage?.toFixed(1) ?? "N/A"}%</div>
          <div>🌿 <b>Comfort:</b> {weatherData.comfort && typeof weatherData.comfort === 'object'
            ? `${weatherData.comfort.comfort_label} (${Number(weatherData.comfort.heat_index).toFixed(1)}°C)`
            : (weatherData.comfort || "—")}
          </div>
        </div>
      )}

      <Canvas
        style={{ background: "#000" }}
        camera={{ position: [300, 0, 0], fov: 45 }}
        onCreated={({ camera }) => (cameraRef.current = camera)}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 3, 5]} intensity={0.2} />
        <Earth animatedPin={animatedPin} onPinClick={handlePinClick} />
        <OrbitControls
          ref={controlsRef}
          minDistance={120}
          maxDistance={350}
          onStart={() => {
            setAnimatedPin(null);
            setWeatherType(null);
            setIsZoomedIn(false);
          }}
          enablePan={false}
          enableRotate={!loading}
          mouseButtons={{ LEFT: 0 }}
        />
      </Canvas>

      {searchMode === "name" && <SearchPanel onSelectCity={handleSelectCity} />}
      {searchMode === "coords" && <CoordSearchPanel />}
      <WeatherOverlay type={weatherType} />
    </>
  );

}
