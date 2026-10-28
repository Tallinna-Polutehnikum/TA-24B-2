# Update Log

## 16.09.2026
- Created the project
- Added the project documentation, including the main guide and update log
- Added the first version of the home page

## 24.09.2026
- Updated `App.vue`
- Fixed a bug that prevented movies from appearing on the website
- Fixed a database synchronization issue that prevented changes from appearing on the website

## 26.09.2026
- Renamed the website to 'Bradar Cinema'
- Updated the fonts and made other minor changes
- Centered the buttons in movie lists
- Fixed a database configuration issue that prevented NestJS and npm from accessing the database after changes to `docker-compose.yml`
- Improved performance

## 01.10.2026
- Fixed an issue with navigating between pages
- Updated `README.md`
- Added Faker movie generation, updating, and management
- Added movie ratings, descriptions, and creators
- Added detailed information for each movie
- Improved performance and fixed npm policy issues that prevented npm and Vite from running
- Added the 'Top Movies' category

## 06.10.2026
- Added a 'Manage Faker Movies' chapter to `guide.md`
- Created the first prototype of the seat-selection page; it is still under construction

## 08.10.2026
- Added a feature to display full movie descriptions and trailers
- Updated `App.vue` and brought the description window from b2test into the main project
- Added a movie editor that lets you change movie descriptions in developer mode (`npm run dev`)
- Configured the movie editor to be available in developer mode and hidden or removed in build and regular modes

## 13.10.2026
- Polished `guide.md` and `README.md` to make them easier to read
- Simplified the explanations in `README.md`
- Added the ability to add movies
- Added the ability to delete movies
- Fixed faker movie generation
- Made it easier to delete generated movies using the visual **Movie Editor** (Edit Movie) button
- Added a banner browser for browsing banner files

## 14.10.2026
- Added a 'Buy tickets' option to the header
- Added cinemas to the project
- Added the ability to choose a movie, cinema, time, and seats when booking tickets
- Added a checkout page that displays the user's selections (still under construction)
- Refreshed the cinema website design
- Updated the styles across all pages
- Added a launcher to make it easier to start build or developer mode
- Optimized the code
- Fixed button margins and padding
- Updated the occupied-seat generation logic

## 15.10.2026
- Updated and fixed the movie card design
- Added an option to edit occupied seats on the 'Buy tickets' page
- Updated the header to improve navigation
- Fixed an issue where new movies did not get screenings after running `npm run movies:generate`

## 16.10.2026
- Added an empty 'About Us' page

## 18.10.2026
- Fixed a router issue that prevented links from displaying correctly
- Fixed a bug where more than three roles would break a movie card on the home page
- Fixed fonts and colors on the seat-selection and checkout pages
- Updated `README.md`
- Adjusted the remaining colors and removed the fixed color setting
- Added dark and light modes
- Added banner switching with a 5.5-second transition and banner navigation buttons
- Added information to the 'About Us' page
- Fixed a checkout script
- Fixed launcher timeouts and added support for macOS, Linux, and Windows

## 20.10.2026
- Added the ability to add, edit, and delete banners on the home page in developer mode (`npm run dev`)
- Added database storage for banners and a `banners` folder in the backend
- Added a genre filter for sorting movies
- Changed the movie card layout from `auto-fit` to `auto-fill`
- Updated the launcher interface and added support for the system's dark or light theme

## 21.10.2026
- Added more information about the subscription card to the Club page
- Updated the footer layout
- Added a handmade club card to the Club page
- Fixed an issue with paragraph text alignment

## 22.10.2026
- Turned the 2D club card into a 3D spinning card
- Added favicon icons to the website
- Organized assets in the `assets` folder
- Moved `main.js` and `router.js` into the `services` folder
- Added a Club Card application form
- Added information about Bradar Club card membership levels
- Connected the Club page and application form to `router.js`
- Updated the 'See movies' button and fixed an issue that prevented it from working
- Fixed the 'Join the club and Register' button redirecting to the home page (Bug #1)
- Improved launcher safety by preventing edits in build mode (Bug #2)
- Fixed project routing by moving all routes from `App.vue` to `router.js` (Bug #2)

## 25.10.2026
- Moved all `<style></style>` sections from `.vue` files into separate `.css` files (Improvement #13)
- Fixed an issue where built-in movies were duplicated after their posters were changed by adding a `seedKey` to each built-in movie (Bug #4)
- Fixed overlapping screenings in the same hall by checking time-slot availability (Bug #5)
- Rewrote all screening times to reflect the updated screening logic
- Deleted `guide.md` because it duplicated content from `README.md` (Improvement #16)

## 26.10.2026
- Fixed an issue where past screenings could be displayed and booked by checking screening times and filtering results in **findAll()** (Bug #6)
- Added a clock to `SeatPicker.vue`, shown when choosing a movie and screening
- Added launchers for Linux and macOS (Bug #7)
- Updated and expanded `README.md` with new information and instructions (Bug #7)
- Fixed an issue where the backend started before MySQL was ready by adding a health check to `docker-compose.yml` and making the launchers wait for the database (Bug #7)

## 27.10.2026
- Fixed some grammar mistakes with AI assist in `README.md` and `update-log.md` files (I know, I am lazy)
- Ordered the backend loading at first place, so the frontend loading requires fully loaded backend before
- Restored Build Mode protection in the Windows, Linux, and macOS launchers by explicitly disabling editing
- Hid SQL debug queries in Build Mode while keeping errors and startup messages visible

## 28.10.2026
- Fixed some color issues in the website with the light theme
- Added the Windows launcher feature: when the frontend and backend terminal windows are fully loaded they minimizes after
- Made the Vite link automatically opens the website after the frontend loading
- Improved Linux and macOS launchers (IMPORTANT!!! I don't know if they work properly, because I don't have any devices with the Linux or macOS operating system)