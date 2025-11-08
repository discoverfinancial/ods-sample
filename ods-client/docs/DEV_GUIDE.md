# ODS client

ODS Client is a simple web application that serves the role of a sample UI application for the ODS Framework.  After it is paired with a running ODS Server, the application leverages the ODS Server APIs to manage the collection of SBOMs contained in the server.

## Dependencies

### NodeJS
The ODS App is a Node.js+React+Typescript application that requires Node to be installed.
- Tested with Node.js v20.3.1

### ODS Server
In order to write SBOMs into a running ODS Server, the ODS Client app will need access to a credential on the ODS Server with write access.  If you have such a credential you may configure ODS Client to use your credentials.  In place of a password, you can create a user token using your account on the ODS Server and use that token value instead.
- Tested with ODS Framework 1.0

## Build App

To build the ODS Client app, run the following command

```
# from ods-sample/ods-client/code
code$ npm run build
```

## Run App

### Setup the Run Environment

| Environment Variable  | Description | Default Value |
| ------------- | ------------- | ------------- |
| PORT | The port that the application will run on.  | 3010 |
| ODS_SERVER  | The address of the running ODS Server through which this application will manage SBOMs.  | http://localhost:3010 |
| ODS_SERVER_USER  | The userid of a user that has write access to the ODS_SERVER.  | |
| ODS_SERVER_PASS  | The password of a user that has write access to the ODS_SERVER.  The ODS_SERVER_PASS value could also be a user token created in the ODS_SERVER_USER account on the ODS server.  | |
| LOG_HTTP_RESPONSE_BODY | Indicates whether logging of http response body is desired.  | false |
| BASIC_AUTH_ENABLED | Indicates whether the application should use basic authentication.  | false |

**Note:** The ods-client app needs to be pointed to a running ODS Server using the ODS_SERVER* environment variables.  Please see the [ods-app setup instructions](../ods-app/DEV_GUIDE.md) to run ods-app as your ODS Server.

**Note:** Also note that the default port for ODS Client is 3010 and the port we specify in the examples below is port 3010.  This is to prevent conflict since ODS App runs on port 3000 by default.

In the `npm run` examples below, it is assumed that all necessary environment variables, such as ODS_SERVER, MONGO_SERVER or MONGO_PASS are already set in the runtime environment.  You may, of course, specify environment variables and their values on the `npm run` commandline before the invocation of `npm run`.

You may find it more convenient to copy the `code/run.template` into a run script and modify its environment variables in order to setup your runtime environment and run ODS Client in different configurations.

### Authentication

This web application can be run using no authentication or basic authentication based on the `BASIC_AUTH_ENABLED` environment variable above.

#### No authentication

If authentication is disabled, the UI of the application will run as a user with the "Employee" role.

To run with no auth

```
# from ods-sample/ods-client/code
code$ npm run debug

# using the run script to load on port 3010
code$ ./run 3010
```

#### Basic authentication

If basic authentication is enabled, the app shows a login page that authenticates using the credentials defined in [MyUserProfileService](../code/src/myUserProfileService.ts).  For example if you login with `uid = admin pwd = pw`, you will be logged in with the "Administrator" role.

```
# from ods-sample/ods-client/code
code$ npm run debug-basic-auth

# using the run script to load on port 3010
code$ ./run 3010 basic
```

### Load the web application and explore!

The web application will load at the port specified in the PORT environment variable at startup.  Please start a web browser and navigate to `http://localhost:<PORT>`.

**Note:** Testing has primarily been run on Apple Safari and Google Chrome browsers.

