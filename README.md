

# React + Vite 

Project is built and expanded on the below React and Vite project template

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## NPM Packages 
NPM packages includes all standard npm packages that was installed upon creating template and other npm packages such as React Routes, React icons 

# API Documentation
- [Firebase Authentication](https://firebase.google.com) is used for the best secure authentication methods
- [Firestore](https://firebase.google.com/docs/firestore) is used to store user data interaction with the account Creation and TMDB. Everything that belongs to the user 
- [The Movie Database](https://www.themoviedb.org/?language=en-US) is used to get movie data information

# Limitations and Bugs 
## User Side - Limitation
- Due to limited time, Adding Movies to Favorites and Movie Reommendation based on the movies based on what user likes
- Streaming Navigation will be directed to Google at the moment as we are figuring out how to link the movie straight to the services itself
## Development side - Bugs
- There might some error handling that it's not nicely displayed at the moment such as like the reauthentication in the Profile.jsx since updating email doesn't always requires authentication
-