

## Available Scripts in UI Directory

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode. Open [http://localhost:8080](http://localhost:8080) to view it in the browser.
The page will reload if you make edits and you will also see any lint errors in the console.<br />

It also uses [Concurrently](https://www.npmjs.com/package/concurrently) to run a mock Kai Rest Api on port 5000 for the 
UI to send requests to. You can edit the example HTTP Responses for each endpoint in [middleware.js](./server/middleware.js).
It runs on an Express server so here are the support [Response docs](http://expressjs.com/en/5x/api.html#res).

#### `npm client`

Runs only the UI app in development without a dev backend and therefore will make via proxy.

#### `npm test`

Runs all tests with a coverage report. 

#### `npm watch`

Jest will launch all tests in watch mode. Every time you save a file, it will re-run the tests.<br />

You can specify a test file to run by using the `-p` option and the name (or directory name) tests you want to run. 

#### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## AWS Integration

The .env file must be configured for the following values for the deployed API and it's User Pool that you want to interface with:

```
REACT_APP_KAI_REST_API_HOST=https://my-example-api-gateway.amazonaws.com 
REACT_APP_COGNITO_USERPOOLID=eu-west-2_example123
REACT_APP_COGNITO_CLIENTID=abc123
```

#### Cognito Integration

The UI App must be authorise a User by retreiving a JWT (JSON Web Token) from Cognito and setting this in the API's request headers as `Authorisation` so that the API returns a successful response. It is configured by supplying the User Pool ID and Client ID created after deployment.

For dev mode it is configured by entering these values in [cognito-config.js](./src/rest/cognito-config.ts) and if production mode it can be configured as in [.env](./.env) file.

#### API Integration

To point this UI app to an Kai's API endpoint, assign the base endpoint for the environment variable `REACT_APP_KAI_REST_API_HOST`
in the [.env](./.env) file. 

The app has to run in Production mode (the build will use `NODE_ENV=production`) to send requests to Kai's API endpoint.
In Dev mode, it will use proxy endpoint which is set up to use localhost:5000 where a Dev mock Kai API can
be served.

## Notes

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
