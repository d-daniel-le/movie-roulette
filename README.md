# Project Setup
## Step 1 - Clone the project
On your terminal or Command Prompt, `git clone https://github.com/d-daniel-le/movie-roulette.git`
## Step 2 - Install Dependencies
- Navigate through terminal to the folder where you store this project
- Run dependencies installation
```bash
npm install
```
## Step 3 - Create .env locally
- At the project folder, run
`touch .env`
- Open the .env in your code editor
- Create all the Variables for your secret key - Below is an example
```.env
VITE_TMDB_API_TOKEN_AUTH=your_secret_tmdb_key
```

## Step 4 - Open CineSpin
- Start the server
```bash
npm run dev
```
- Open your favorite web browser
- Put in URL `localhost:5173`

# Features and Technologies
## Features
- Home Page shows what's popular for the current week and What's coming soon
- Trending page shows what movie is popular right now and who is trending at the moment
- Wheel page - main feature - includes a movie wheel which shows a randomized list of movie either based on the selected filter or not and the user can spin the wheel to help decide which movie to watch. User will be directed to signin before they can spin the wheel. 
- Search shows all the movies that include the keywords that the user has entered
- Login/Create An Account is for users to login or create an account
- Profile - after the user login - contains user information as well as the spin history of the movies that the wheel has landed on and an option for user to logout
## Technologies
- React + Vite
- Firebase (Authentication) and Firestore
- TMDB API
- React Router
- React Icon


# API Documentation
- [Firebase Authentication](https://firebase.google.com) is used for the best secure authentication methods for Login and Create User page
- [Firestore](https://firebase.google.com/docs/firestore) is used to store user data interaction with the account Creation and TMDB. Everything that belongs to the user for Wheel and Profile page
- [The Movie Database](https://www.themoviedb.org/?language=en-US) is used to get movie data information for Home, Trending, Wheel, Profile and Search Result pages

# Limitations and Bugs 
## User Side - Limitation
- Due to limited time, Adding Movies to Favorites and Movie Recommendation based on the movies based on what user likes
- Streaming Navigation will be directed to Google at the moment as we are figuring out how to link the movie straight to the services itself
## Development side - Bugs
- There might some error handling that it's not nicely displayed at the moment such as like the reauthentication in the Profile.jsx since updating email doesn't always requires authentication
- Responsive Design would cover most common screen but not every screen is covered at the moment.
- Overall Design is not perfect at the moment with the sidebar in the profile up top reveal all button but it's not perfect.
- Other potential bugs with reauthentication while updating email information and content display might not be showing right.
- Other bugs that test hasn't revealed