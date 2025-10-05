# Nasa-weather-app

Due to the constraints of funds, we are unable to host a server. This repository merely contains the main working code as proof of work, but it is not functional without it's supporting components. 

The fully working product is a 2GB folder, and anytime a request is made it downloads about 2.5GB of M2T1NXSLV files. (if a request is made for the same date but different location then it doesn't download everything.) 

It can be found here: https://drive.google.com/drive/folders/1AIrb6n3XaZtQw5XHlTOjpTPjUKZ9KO3n

To get it working, one would have to have python installed, have an earthdata login account, be familiar with the terminal, and be able to debug (We're sorry) 
The steps are as follows: 

0) locate the requirements.txt and add 'xarray', 'earthaccess', 'dask' to the list.
1) open command prompt and execute LAUNCH.py (The purpose is only to install the python dependencies and to authenticate with earthdata login) . It might be a good idea to activate a virtual environment)
3) cd C:\Users\PC\Documents\weather-globe\frontend
4) then run: npm run build
5) locate the 'build' folder, create a folder "Data" and put 'ne_110m_populated_places.json' and 'world-countries.geojson' into the 'Data' folder
6) cd C:\Users\PC\Documents\weather-globe\backend 
python -m uvicorn main:app
7) Folllow the link and things should work! (don't request data past 2026 Aug 20th, As of the time of writing M2T1NXSLV is limited to that date) 

notes: 
2)  If authentication fails, setting up the credential environment through this guide may work: https://github.com/nasa/gesdisc-tutorials/blob/main/notebooks/How_to_Generate_Earthdata_Prerequisite_Files.ipynb
