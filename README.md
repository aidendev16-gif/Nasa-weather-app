# Nasa-weather-app

Due to the constraints of funds, we are unable to host a server. This repository merely contains the main working code as proof of work, but it is not functional without it's supporting components. 

The fully working product is a 2GB folder, and anytime a request is made it downloads about 2.5GB of M2T1NXSLV files. (if a request is made for the same date but different location then it doesn't download everything.) 

It can be found here: https://drive.google.com/drive/folders/1AIrb6n3XaZtQw5XHlTOjpTPjUKZ9KO3n

To get it working, one would have to have python installed and have an earthdata login account (userID and Password)
The steps are as follows: 

1) Locate LAUNCH.py and run it (This downloads python libraries, so maybe you would want a venv active)
2) Key in your username and password (It will feel like you're not keying it password, but you are)
3) it should open your browser and redirect you to localhost, where you can start exploring!

Note: all times are Universal Coordinated Time. A query further than 2026 AUG 20 will not work as of today (10/5/2025), the M2T1NXSLV hasn't been updated to the most recent date, and we can only serve requests maximum one year from now. 
