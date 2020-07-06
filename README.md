# SLURP

This is the repo for the SLURP web application. The frontend is built using the React web framework and the Firebase development platform, with the backend built using Google's App Engine computing platform.

## CLI Tools
This project makes use of the `gcloud` SDK for project deployment to Google Cloud, the `npm` and `yarn` package managers for Node.js, and the `nvm` Node.js version manager. Node.js 10 is the specific version required for this project.

Install `gcloud`:
```
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
sudo apt-get install apt-transport-https ca-certificates gnupg
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
sudo apt-get update && sudo apt-get install google-cloud-sdk
```
Then run `gcloud init` to specify that development is being done on the "step53-2020" project.

Install `nvm`:
```
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```

Install `npm`:
```
nvm install node
```

Install `yarn`:
```
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update
sudo apt install yarn
```

Using Node.js 10:
```
nvm install 10
nvm use 10
```

## Project Structure
This project consists of a frontend component and a backend component.

### Frontend
The frontend is built using React.js and makes use of Firebase. It has the following (simplified) directory tree:
```
frontend/
├── package.json
├── public
│   └── ...
├── src
│   ├── index.js
│   ├── components
│   │   └── ...
│   ├── constants
│   │   └── ...
|   ├── styles
│   │   └── ...
│   └──...
└── ...
```
The `package.json` file contains all the dependencies for the frontend component, including React, while the `public` subdirectory contains the `index.html` file as well as other external assets that may be needed, such as images. The `src` subdirectory contains the main bulk of the React code.

#### `src` Directory

##### 'index.js' File
The index.js file contained in the src directory is the main entrypoint for the web application, as it is used to render the `root` div element in index.html. It currently uses whatever is defined by the App component.

##### `components` Subdirectory
The components subdirectory contains all the various components and pages to be used in the web application. Each component should be placed in its own directory, with public facing parts exported in an `index.js` file. For example, if a component named "Navbar" was being developed, it should have at the very least `src/components/Navbar/index.js`. Any other JS files can be placed in the Navbar directory, but public facing parts should be exported in `index.js`. Another component, say "TestComponent", can then access Navbar via `import '../Navbar'`.

###### The `App` Component
The most important component in the components subdirectory, which is ultimately what is fed into `src/index.js`. This component uses React Router (`import 'react-router-dom'`) to specify which pages of the web application can be visited and what component each of these pages uses.

##### 'constants' Subdirectory
Contains any global constants for the projects. Currently contains a [routes.js](frontend/src/constants/routes.js) file that defines and exports the names for URL paths.

##### 'styles' Subdirectory
Although React Bootstrap is the main styling framework used for this project, the styles subdirectory can also store any created stylesheets. It can then be imported from a component via `import ../../styles/example_style.css`.

### Backend
The Backend is runs on the Google App Engine framework and built using Maven. It has the following (simplified) directory tree:
```
backend/
├── pom.xml
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── google
│   │   │           └── slurp
│   │   │               └── servlets
│   │   │                   └── ...
│   │   └── webapp
│   │       └── WEB-INF
│   │           └── appengine-web.xml
│   └── test
│       └── java
│           └── com
│               └── google
│                   └── slurp
|                       └── ...
└── ...
```
This file structure is largely the same as that used during portfolio creation portion of Google's 2020 STEP internship. The appengine-web.xml file was modified to ensure compatibility with the frontend component when deployed.

## Styling
The React Bootstrap tool was imported for use in the frontend. Available components can be found [here](https://react-bootstrap.github.io/components/alerts/).

## Testing

### Frontend:
The Jest testing framework was installed as a dependency. From the command line, run `npm test` to enter Jest in watch mode. It will immediately search for any files ending in `.test.js` in the frontend directory that are related to any files changed since the last commit and run them. Pressing "a" while in this mode will run all tests, and "w" can give more information. See the [SumExample](frontend/src/components/SumExample) component for an example.

### Backend:
JUnit and Maven is used to run backend testing, following the same structure as Week 5 of the Google STEP Internship.

## Running Locally
First, ensure that you have installed and are using Node 10!
```
nvm install 10
nvm use 10
```
The frontend and backend components must be run in two separate terminals,

Frontend (from the frontend directory):
```
yarn local
```

Backend (from the backend directory):
```
mvn package appengine:run
```

When testing in this environment, any changes made to the frontend code will be immediately updated and redployed locally in realtime. Maven must be stopped and rerun when any changes are made to the backend code.

## Deploying
Ensure that you have installed and are using Node 10!
```
nvm install 10
nvm use 10
```

The frontend and backend components must be deployed separately:

Frontend (from the frontend directory):
```
yarn build
gcloud app deploy
```

Backend (from the backend directory):
```
mvn appengine:deploy
```
