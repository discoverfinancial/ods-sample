# ODS App

ODS App, as an Operational Data Store, is capable of collecting and processing a large amount of data sourced from a variety of systems.  Because the data is gathered to one location, it provides an opportunity to analyze and report on the data in a myriad of ways.  But ODS App is able to be much more than this.

### The Background

ODS App is part of the [ODS Framework](https://www.github.com/discoverfinancial/ods-framework) family.  ODS App is meant to be a template from which to build and expand your ODS system.  ODS App supports CycloneDX SBOMs by default and has data clients for Cdxgen, Deps.dev and Endoflife.date.  These data clients will augment the information available about the software represented by the SBOMs. 

### The Vision

We envision that early adopters will find this repo as a good place to begin their exploration of operational data stores.  The code is very straight forward, yet demonstrates enough of the power of ODS that you can envision the possibilities for yourself.

When you are ready to get your hands dirty, fork this repo and try your hand at creating a data client that will work with a data source of your choice to help you achieve your goals.  It is a small step from there to building some UI to visualize your data.  The next logical step might be to expose some of your new data client's methods to scripting by creating some new adminSandboxFunctions and composing some impressive reports.  In no time at all you will have a great foundation to build upon as your ODS strategy unfolds.

## Getting Started

### ODS App Capabilities

Visit the [project docs](./docs/README.md) to learn about the features and its template application.

### Using the Application

Interested in exploring ODS App?  Learn how to [install and use](./DEV_GUIDE.md) the system in your own environment.

After you have explored a bit, take a deeper dive into the application by checking out our [user guide](./docs/Guides/User.md).
