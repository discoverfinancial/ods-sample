# Code Overview

This section provides an overview of the code comprising the [ods-client](../..) application.

## Backend Code Overview

The backend code is structured in a manner that will seem familiar to Node.js+Typescript developers.

The following is an overview of the backend code layout of this project.

* [code/src](../../code/src/src) - All code for the application is contained under this parent directory.  Files in the root of this folder are largely related to user authentication.  `myUserProfileService.ts` contains a hard coded list of users that the application will authenticate against.  OIDC authentication can be achieved by using the `authOidc.ts` code and replacing the profile service with one that can talk to your directory service/identity provider.
* [code/src/controllers](../../code/src/src/controllers) - All code for the backend APIs is contained under this directory.  Currently this code serves as a proxy, collecting together all of the API calls that need to be made to the ODS Server that the client is paired with.  We are proxying through the backend rather then calling the APIs directly in the front end to better protect the user's ODS Server credentials.

## User Interface Code Overview

The following is an overview of the UI code layout of this project.

* [code/src/ui/src](../../code/src/src/ui/src) - All code for the UI is contained under this parent directory.  Also contains the App source file (where UI routes are mapped to pages) and source files for Http requests and the navbar component.  Also contains the page where the list of SBOMs is displayed (SbomListPage) and the page where individual SBOM details are displayed (SbomDetailsPage).
* [code/src/ui/src/components](../../code/src/src/ui/src/components) - The directory containing all helper/non-page react components.
* [code/src/ui/src/common](../../code/src/src/ui/src/common) - The directory containing most of the interfaces and data structures used by the UI, including those used by the backend APIs.
* [code/src/ui/src/models](../../code/src/src/ui/src/models) - The directory containing helper classes that wrap the different types of backend APIs.  For example, SbomMgr.ts contains methods that wrap the backend APIs related to SBOMs.
* [code/src/ui/src/mui-a11y-tb](../../code/src/src/ui/src/mui-a11y-tb) - The directory containing the [A11y Theme Builder](https://github.com/finos/a11y-theme-builder) design system and theme files, which improves the application's visual accessibility profile.  TB.css is a generated file and should not be modified outside of the Accessibility Theme Builder tool.
