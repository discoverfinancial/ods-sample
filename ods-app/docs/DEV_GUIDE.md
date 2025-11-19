# ODS App

ODS App can serve the role of a demo application for the ODS Framework or as a template upon which to build an enhanced ODS application.  After it runs and is populated with SBOMs (e.g. using CDX Generator), you'll be able to experience the potential of an ODS for yourself.

## Dependencies

### NodeJS
The ODS App is a NodeJS/ReactJS application that requires Node to be installed.
- Tested with NodeJS v20.3.1

### Mongo

ODS App uses MongoDB to store the SBOMs.
- [Install MongoDB on the Mac](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/)
- Tested with mongodb-community@7.0
- Default installation doesn't set a password, but if you need to specify one, set environment variables `MONGO_USER` and `MONGO_PASS`.

### CDX Generator
As an optional feature, the application can also be paired with a running CDXGen server in order to create SBOMs and store them in the ODS Server.  More information on this feature [below](#create-sboms).
- Tested with CDXGen v11.5.0

## Local Environment Setup

1. Clone the following repositories into the same directory:
   * [ods-framework](https://github.com/discoverfinancial/ods-framework)
   * [ods-sample](https://github.com/fdiscoverfinancial/ods-sample)

## Build App

1. Build and install the ods-framework:
```
 ods-sample$ cd ../ods-framework
 ods-framework$ npm run build
```

2. Run the reimport-ods script to import the latest ods-framework after it has built:
```
ods-framework$ cd ../ods-sample/ods-app/code
 ./reimport-ods
```

3. Build and install the ods-app:
```
# from ods-sample/ods-app/code
code$ npm run build
```

Steps #1 and #2 can be ignored if you are satisfied with building the ods-framework that is currently committed to ods-sample/ods-app.

## Run App

### Setup the Run Environment

| Environment Variable  | Description | Default Value |
| ------------- | ------------- | ------------- |
| PORT | The port that the application will run on.  | 3000 |
| CDXGEN_SERVER  | The address of the running CDX Generator Server through which this application will create SBOMs.  | http://localhost:9090 |
| LOG_HTTP_RESPONSE_BODY | Indicates whether logging of http response body is desired.  | false |
| BASIC_AUTH_ENABLED | Indicates whether the application should use basic authentication.  | false |

Because ODS App is a [DLMS](https://github.com/discoverfinancial/dlms-server)-based application, it can be further configured using the [DLMS environment variables](https://github.com/discoverfinancial/dlms-server?tab=readme-ov-file#setup-the-runtime-environment)

In the `npm run` examples below, it is assumed that all necessary environment variables, such as CDXGEN_SERVER, MONGO_SERVER or MONGO_PASS are already set in the runtime environment.  You may, of course, specify environment variables and their values on the `npm run` commandline before the invocation of `npm run`.

You may find it more convenient to copy the `code/run.template` into a run script and modify its environment variables in order to setup your runtime environment and run ODS App in different configurations.

### Authentication

This web application can be run using no authentication or basic authentication based on the `BASIC_AUTH_ENABLED` environment variable above.

#### No authentication

If authentication is disabled, the UI of the application will run as a user with the "Employee" role.

To run with no auth

```
# from ods-sample/ods-app/code
code$ npm run debug

# using the run script to load on port 3000
code$ ./run 3000
```

#### Basic authentication

If basic authentication is enabled, the app shows a login page that authenticates using the credentials defined in [MyUserProfile](./code/src/myUserProfileService.ts).  For example if you login with `uid = admin pwd = pw`, you will be logged in with the "Administrator" role.

```
# from ods-sample/ods-app/code
ods-app/code$ npm run debug-basic-auth

# using the run script to load on port 3000
code$ ./run 3000 basic
```

### Load the web application and explore!

The UI for the ODS Server will load at the port specified in the PORT environment variable at startup.  Please start a web browser and navigate to `http://localhost:<PORT>`.

**Note:** Testing has primarily been run on Apple Safari and Google Chrome browsers.

**NOTE:** Until there are SBOMs in the data store, the lists shown in the UI will appear empty.

## Initializing the data store

### Existing SBOMs

If you have access to CycloneDX SBOMs, you can populate the ODS App data store using the ODS Server APIs.  For example, `curl -u <ods_server_userid> -X POST ${odsServerUrl:port}/api/docs/sbom -H "Content-Type: application/json --data-binary "@path/to/json_file`.  As mentioned elsewhere in this document, a user token from the ODS Server could be used in place of a password in the ODS Server credential.

### Create SBOMs

If you do not already have SBOMs available to you, it is pretty easy to create SBOMs from public GitHub repos using [CycloneDX Generator (cdxgen)](https://cyclonedx.github.io/cdxgen/#/).  CDXGEN can be run from the root of a GitHub project, gather the dependencies of the project, and from that information generate an SBOM.

If you start a CDXGEN server and point to it with ODS App using the `CDXGEN_SERVER` environment variable, you can use ODS App to create SBOMs.  The file `ods-app/cdxgenConfig.json` is loaded and processed when the server starts up. After the server starts up, you can navigate to `<ods_server_url:port>/etl`.  You will be presented with a list of potential actions that can be performed on the data clients known to ETL.  Because ODS App has a CdxgenClient, you'll have CDXGEN options available to you.  If you click on the `Update Cached Cdxgen` button, the triggered action will store the information from the cdxgenConfig file into the data store if it doesn't already exist.  If you then click on the `Update Cdxgen Sboms` button, the corresponding action will, if a healthy CDXGEN server is detected, ask that server to build an SBOM from each of the public GitHub repositories stored in the Cdxgen cached data in the data store.

**NOTE:** The repositories are currently processed synchronously and some may take CDXGEN as long as 30s to process.

#### CycloneDX Generator Server

When CycloneDX Generator is run as a server, it is possible to ask it to create
SBOMs from GitHub repos.  Under the covers the server will clone the repo to a
/tmp directory, process the project to generate an SBOM, and then delete the
repo.

An example request could look like:

```
curl "http://127.0.0.1:9090/sbom?url=https://github.com/finos/a11y-theme-builder&multiProject=true&type=js"
```

**Command Line**

CycloneDX Generator can be installed to your system to allow you to run it
from the command line:


```
# install CDXGEN
sudo npm install -g @cyclonedx/cdxgen

# run the CDXGEN server.  Runs on port 9090 by default.
cdxgen --server

# uninstall CDXGEN
sudo npm uninstall -g @cyclonedx/cdxgen
```

**Docker Container**

If you would prefer to run CDXGEN in a Docker container, that would be possible
using:

```
# create tmp directory where git repos can be cloned temporarily
mkdir $HOME/tmp
cd $HOME/tmp
git clone https://github.com/discoverfinancial/ods-sample.git
cd ods-sample/ods-app/code

# build the container
docker build -t testcdxserver:latest -f ./Dockerfile.cdxgen .

# run the container
docker run -d -v $HOME/tmp:/tmp -p 9090:9090 -v $(pwd):/app:rw --name test-cdxgen-container testcdxserver:latest
```

