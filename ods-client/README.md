# ODS Client

ODS Client is a simple web application that serves the role of a sample UI application for the ODS Framework.  After it is paired with a running ODS Server, the application leverages the ODS Server APIs to manage the collection of SBOMs contained in the server.

### The Background

ODS Client is part of the [ODS Surveyor](https://www.github.com/discoverfinancial/ods-surveyor) family.  This simple Node.js + React based web application consumes the ODS Server APIs in order to produce rich user experiences.

### The Vision

Because so many different organizations might want their own view into the data that is available in an Operational Data Store, it was decided to produce an example of what such an application might do.

When you are ready to get your hands dirty, fork this repo and try your hand at creating your own ODS client that will work with the ODS Server of your choice to help you achieve your goals.

## Getting Started

### Compatible ODS Servers
The ODS Surveyor family has two flavors of ODS Servers:
* ODS Surveyor is an enterprise-level ODS Server that is capable of pulling data from a growing list of potential data sources including LeanIX, Nexus and SonarQube.
* ODS App is a minimal ODS Server that only supports SBOMs and uses Cdxgen to generate SBOMs from GitHub repositories to populate the data store.  This is a great foundation upon which to build an ODS Server application.

It is recommended to use ODS Server with ODS Client, particularly for users new to ODS.  It has a simple setup and is still able to demonstrate most of the ODS Surveyor features.

Visit the [ODS App docs](../ods-app/docs/README.md) to learn about the features shared by ODS Surveyor and its template application.

### Using the Application

Interested in exploring ODS Client?  Learn how to [install and use](./DEV_GUIDE.md) the application in your own environment.

Consult our [user guide](./docs/Guides/User.md) to get a better understanding of how to use the client application and the components upon which it is built.
