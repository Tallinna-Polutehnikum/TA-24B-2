# Update Log

## 16.09.2026
- Project has been created
- Added the documentary (main, guide and update log)
- Added the first main page version

## 24.09.2026
- Updated `App.vue` file
- Fixed a bug with films not appending on the website
- Fixed the database sync problem (Changes didn't apply on the website)

## 26.09.2026
- Renamed the whole website to 'Bradar Cinema'
- Changed fonts and made some small changes
- Changed buttons in movie lists to have them in the centre of field
- Fixed the problem with databases that you didn't have an access to run the databases Nest.js and npm because of renames inside `docker-compose.yml`
- Made a better optimization

## 01.10.2026
- Fixed a problem with switching pages on the website
- Made some changes in the `README.md` file
- Added faker generation, movie updater and generator
- Added ratings, decription and creators of the movie
- Added a full info to each movie
- Made a better optimization: now you can run npm and vite without an error with npm policies
- Added a new category 'Top Movies'

## 06.10.2026
- Extended the guide in `guide.md` with 'Manage Faker movies' chapter
- The first prototype of seat selection page was created, but is still in under construction

## 08.10.2026
- Made a function that shows you a full description of the movies and trailers
- Updated `App.vue` and optimized a description window from b2test to main project
- Made a movie editor that provides you changing movie description in the dev mode (npm run dev)
- Made a movie editor to work in developer mode, in build and regular sites movie editor will be removed or hidden

# 13.10.2026
- Polished `guide.md` and `README.md` files for better reading
- Edited `README.md` for simple explation
- Added add movie function
- Added delete movie function
- Fixed faker movie generation
- Made simplier delete faked movie by using visual MOVIE EDITOR (Edit Movie) button 
- Added banner browser function (for browsing banner files)

# 14.10.2026
- Added 'Buy tickets' option on the header
- Added cinemas in the project
- Added option to choose a film, cinema, time and seats to buy a ticket
- Added a checkout, which shows user's picks (It's still under construction)
- Refreshed the cinema website desing
- Updated style in all pages
- Added a launcher for better usage and to run build or developer mode in one click
- Optimized the code
- Fixed margins and paddings in buttons
- Updated occupied seats generation logic

# 15.10.2026
- Updated asnd fixed film cards design
- Added edit oppucied seats option in 'Buy tickets' page
- Updated header for better navigation
- Fixed a problem new films didn't get sessions after writing `npm run movies:generate`

# 16.10.2026
- Added empty 'About Us' page

# 18.10.2026
- Fixed router issue not showing link properly
- Fixed a bug, where more than 3 roles are breaking a movie card in the main page
- Fixed fonts and colors in seat selection and in checkout page
- Update README.MD
- Made an optimization to other colors (denied the color fixation)
- Added dark/light mode
- Added banner switch with 5.5s transition and switch banners buttons
- Filled 'About Us' page with info
- Fixed a checkout script
- Fixed loading timeouts in launcher and made a full support for every operating systems (macOS, Linux and Windows)

# 20.10.2026
- Added options to edit, add and delete banners on the main page in the developer mode (npm run dev)
- Added the database storage for banners (Added a banners folder in the backend)
- Added movie genres filter to sort movies by movie genre

Bradar, what it this?