# Code Overview

This section provides an overview of the code comprising the [ods-app](../..) application.

## Backend Code Overview

The backend code is structured in a manner that will seem familiar to Node.js+Typescript developers.

The following is an overview of the backend code layout of this project.

* [code/src](../../code/src) - All code for the application is contained under this parent directory.  Files in the root of this folder are largely related to user authentication.  **myUserProfileService.ts** contains a hard coded list of users that the application will authenticate against.  OIDC authentication can be achieved by replacing the profile service with one that can talk to your directory service/identity provider.  Also contains **adminSandboxFunctions.ts** and **adminSandboxFunctions.js**, each of which defines methods that can be run from inside a Notebook and interact with ODS and data clients.  It is worth noting that these two files are intended to be almost identical.  The .js version is what is actually used by the JS sandbox code.  However, we have found that having a .ts version of the file useful for detecting type mismatches at build time.  **appMgr.ts**, which configures the ODS Framework instance used by this application, can also be found here.
* [code/src/common](../../code/src/common) - The directory containing most of the interfaces and data structures used by the application.
* [code/src/controllers](../../code/src/controllers) - All code for the backend APIs is contained under this directory.  Currently this code serves as a proxy, collecting together all of the API calls that need to be made to the ODS Server that the client is paired with.  We are proxying through the backend rather then calling the APIs directly in the front end to better protect the user's ODS Server credentials.
* [code/src/etl](../../code/src/etl) - All of ODS App's data client code for [ETL](./ETL.md) is contained under this directory.  Also contains a script (**cli.ts**) that can be used to invoke methods directly on the ETL data clients.

## User Interface Code Overview

The following is an overview of the UI code layout of this project.

* [code/src/ui/src](../../code/src/ui/src) - All code for the UI is contained under this parent directory.  Also contains the **App.tsx** source file (where UI routes are mapped to pages) and source files for Http requests and the navbar component.  Also contains the application pages (as React components) where the various document types and document details are displayed to the user.
* [code/src/ui/src/common](../../code/src/ui/src/common) - The directory containing most of the interfaces and data structures used by the UI, including those used by the backend APIs.  Copied from the backend **code/src/common** directory when `npm run build` is executed for the UI.
* [code/src/ui/src/components](../../code/src/ui/src/components) - The directory containing all helper/non-page react components.
* [code/src/ui/src/editors](../../code/src/ui/src/editors) - The directory containing react components that are used on pages to gather user input and modify the underlying documents.
* [code/src/ui/src/managers](../../code/src/ui/src/managers) - The directory containing helper classes that wrap the different types of backend APIs.  For example, **SbomMgr.ts** contains methods that wrap the backend APIs related to SBOMs.  There is a roughly 1:1 relationship between managers and the different collections of documents.
* [code/src/ui/src/mui-a11y-tb](../../code/src/ui/src/mui-a11y-tb) - The directory containing the [A11y Theme Builder](https://github.com/finos/a11y-theme-builder) design system and theme files, which improves the application's visual accessibility profile.  TB.css is a generated file and should not be modified outside of the Accessibility Theme Builder tool.
* [code/src/ui/src/Notebooks](../../code/src/ui/src/Notebooks) - The directory containing react components that are used on the Notebook pages to gather user input and modify the underlying documents.
