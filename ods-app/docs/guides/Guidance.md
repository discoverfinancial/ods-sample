# Guidance in ODS Framework

Guidance policies for 3rd party libraries are often required during software development. There may be tens of thousands of libraries used in an enterprise that must be managed as part of the SDLC (software development lifecycle). To ensure software hygiene, policies may specify recently published versions that should be used. This section details an algorithm for automatically setting guidance for these libraries. This guidance may recommend what version to update to, or another action to be taken for those indicated as out-of-guidance.

## Overview

Determination of what constitutes that a library is out-of-guidance varies depending upon the enterprise and policies.  Guidance may consider software library versions, vulnerabilities, scorecards or other internal or community information.  The ODS Framework includes a simple N-2 guidance for versions based upon information from the Open Source Insights service on [deps.dev](https://deps.dev/) website.

## Personas

The following users interact with, contribute to, or receive output from the guidance process:

- Admin: Generates guidance information for a set of components.
- Product Owner: Can view guidance information for the products they own.
- Developer: Updates the product with components recommended by guidance.
- Editor: Can view guidance information and make necessary updates to the guidance.

## Diagram

The guidance process is represented by the following components or steps:

- Component Database containing component specific details including an identifier such as a purl.
- Guidance Spec comprises information on recommended component versions.
- Product is a piece of software consisting of one or many components each with an associated guidance.
- Algorithm provides guidance information for a specific piece of software.

![](images/Guidance%20Algorithm.png)

## Guidance Data Model
```
    item: GuidanceReference;
    tier: string;
    nMinus: string;
    title: string;
    description: string;
    depsdevVersions?: string[];
    pci?: GuidanceVersionOptions;
    nonPci?: GuidanceVersionOptions;
    retireDate?: number;
    documentation?: GuidanceDocumentation[];
    alternatives?: GuidanceAlternative[];
    waivers?: GuidanceWaiver[];
    ...
    id: string;
    state: string;
    dateCreated: number;
    dateUpdated: number;
    ...
    schemaVersion: string;
    curStateRead?: string[];
    curStateWrite?: string[];
    ...
    updatedBy: GuidanceUpdated[];
    stateHistory: StateHistory[];
    comments: CommentInfo[];
    attachments?: AttachmentInfo[];
```

## Guidance UI

![](images/Guidance.png)

The Guidance page for a piece of software can be viewed by opening up the actions menu for a row in the software list and clicking "View Guidance".

On the Guidance page, a user with the appropriate permissions is able to edit various fields, or retire a guidance in the Guidance Summary page. If versions or tier are edited a new guidance will be activated.

Previous versions of a guidance can be seen by clicking "Guidance History", which displays a table of previous guidances.

If a software has no guidance or a retired guidance, there will be a button to "Create Guidance"

In terms of file locations, `GuidanceEditor` contains most of the Guidance UI. A slightly different UI is rendered depending on the state of the Guidance, as well as slightly different components based on whether the user can and is editing the Guidance.