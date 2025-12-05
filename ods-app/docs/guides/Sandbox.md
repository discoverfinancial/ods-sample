# Sandbox

User scripts and Notebooks can be run in a JavaScript sandbox environment. Code written in the sandbox can retrieve and set data values from the server.

## How to use the Sandbox

Sandbox scripts are writted in JavaScript and can invoke [ODS-specific host functions](#adminSandboxFunctions). Some of these functions are only acessible by admin users. All intermediate data remains on the server, with only the data specified in the setResult() method returned to the browser or another application if the script API is called.

## Where can I write code that utilizes the sandbox

Code can be written utilizing the sandbox in the following:

- Notebooks
- Server Script Editor
- Admin Server Script Editor

## Example usage

<pre>
const id = '1234ab';
const result = getSbomById(id)
setResult({
    value: result
});
</pre>

## adminSandboxFunctions

As mentioned above, the sandbox provides the following host functions that can be invoked. Please refer to the Help button on Notebook and Server Script editor pages for the most accurate list.

The following methods are available:

### SBOM methods

#### getAllSboms()

Get metadata properties for all Sboms. Returns only id, metadata, dateUpdated properties.
*   returns SBOM\[\]

#### getSboms(params)

Query for SBOM documents.
*   returns SBOM\[\]
*   **params:** The mongodb query and/or projection with format {"match":{},"options":{"projection":{}}}

#### getSbomId(productName, productVersion)

Get the SBOM ID for the given product name and version, or latest version if not specified.
*   returns id or BomRef
*   **productName:** (string) The product name
*   **productVersion:** (string - optional) The product version

#### getSbomById(id)

Get an SBOM by its id.
*   returns SBOM
*   **id:** The id of the Sbom

#### getSbomByBomRef(bomRef, getIdOnly)

Get an SBOM by its BomRef. If getIdOnly=true, then just return the id.
*   returns SBOM
*   **bomRef:** (object) The BomRef object
*   **getIdOnly:** (boolean) T=return id, F=return Sbom object

#### getSbomForLeanixId(id)

Retrieves the SBOM for the LeanIX id.
*   returns SBOM
*   **id:** (string) The LeanIX id

#### getSbom(productName, productVersion)

Get the SBOM for the given product name and optionally version.
*   returns SBOM
*   **productName:** (string) The product name
*   **productVersion:** (string - optional) The product version

#### getOssAnalysis(sbomId)

Get analysis for all top-level open source software used by product.
*   returns SBOM\[\]
*   **sbomId:** (string) The id of the Sbom

#### getMetadataProperty(sbom, name)

Get the metadata property from the Sbom.
*   returns object
*   **sbom:** (object) The Sbom object.
*   **name:** (string) The property name

#### createBomRef(component, id)

Create a BomRef object from an SBOM component object.
*   returns BomRef
*   **component:** (object) The component object
*   **id:** (string - optional) The id of the Sbom

#### searchSboms(searchText, searchParam, searchType, uses, vulnerabilities, usesOrSearch, onlyVulnerabilities, nonCompliance)

Search for software. This is the same search form used for Software List page.
*   returns SBOM\[\]
*   **searchText:** (string) The search string. Use \* for partial matches.
*   **searchParam:** (object - optional)
*   **searchType:** (string\[\] - optional)
*   **uses:** (object) - optional
*   **vulnerabilities:** (boolean - optional)
*   **usesOrSearch:** (boolean - optional)
*   **onlyVulnerabilities:** (boolean - optional)
*   **nonCompliance:** (boolean - optional)

#### getSoftwareThatUsesLibrary(searchText)

Get all software applications that use a library.
*   returns SBOM\[\]
*   **searchText:** (string) The library name to look for. Use \* for partial matches.

#### getSbomVersions(idOrName)

Get all versions for a software package. Note that this only returns versions that are used by other SBOMS. Not all versions in database.
*   returns \[{id:bomRef, count:number of sboms that use this sbom}\]
*   **idOrName:** (string) The id or name of software package

#### getMostUsed(directDependency)

Get most used Sboms or those that are top-level dependencies.
*   returns SBOM\[\]
*   **directDependency:** T=Get top-level dependencies, F=Get most used Sboms

### Guidance methods


#### getGuidanceSummary(email)

Get guidance summary for all products under person specify by email.
*   returns Array of guidance objects
*   **email:** (string) The email of the person.

#### getGuidanceDocs(params)

Get all guidance documenets.
*   returns Array of guidance objects
*   **params:** (object) The query parameter with {params:{match:{}, options:{projection:{}}}}

#### getGuidanceVersionInfo(basePurl)

Get the guidance docs for all versions of the base purl.
*   returns Array of guidance objects
*   **basePurl:** (string) The base purl.

### Store methods

#### getStoreDocs(params)

Get all store documents.
*   returns Array of store objects
*   **params:** (object) The query parameter with {params:{match:{}, options:{projection:{}}}}

### Deps.dev and Dependencies methods

#### getDepsdevDocs()

Get all depsdev docs
*   returns Array of objects

#### getDepsdevDoc(basePurl)

Get depsdev document for base purl.
*   returns Object
*   **basePurl:** (string) The base purl.

#### getPackageFromBasePurl(purl)

Retrieve package information associated with the given base purl.
*   returns Object containing version and package information
*   **purl:** (string) The purl of the package to query.

#### getPackageFromPurl(purl)

Retrieve package information associated with the given purl.
*   returns Object containing version and package information
*   **purl:** (string) The purl of the package to query.

#### getVersionDetails(purl, system, name, version)

Get the version details.
*   returns {version, project}
*   **purl:** (string) The Deps.dev purl.
*   **system:** (string) The Deps.dev system (go, npm, cargo, maven, pypi, nuget)
*   **name:** (string) The Deps.dev name.
*   **version:** (string) The Deps.dev version.

#### getPackageVersions(purl)

Find the last 5 versions for the package with the given purl.
*   returns string\[\] containing up to 5 version numbers in reverse order. The defaultValue is the first version in the list
*   **purl:** (string) The purl of the package.

### Notebook methods

#### setNotebookId(id)

Set the current notebook id.
*   **id:** (string) The id of the notebook.

#### getNotebookId()

Get the current notebook id.
*   returns string

#### setNotebookVar(notebookId, name, value)

Set a notebook variable. This is saved in the database.
*   **notebookId:** (string) The notebook id.
*   **name:** (string) The name of the variable.
*   **value:** (object) The value of the variable.

#### getNotebookVar(notebookId, name)

Get the value of a notebook variable.
*   returns object
*   **notebookId:** (string) The notebook id.
*   **name:** (string) The name of the variable.

#### getNotebookVars(notebookId)

Get the names of all notebook variables for the given notebook.
*   returns string\[\]
*   **notebookId:** (string) The notebook id.

#### deleteNotebookVar(notebookId, name)

Delete a notebook variable.
*   **notebookId:** (string) The notebook id.
*   **name:** (string) The name of the variable.

### Axios methods

#### axiosGet(url, config)

Axios GET
*   returns object
*   **url:** (string) The url.
*   **config:** (object - optional) The Axios config object.

#### axiosPost(url, data, config)

Axios POST
*   returns object
*   **url:** (string) The url.
*   **data:** (object) The object to send.
*   **config:** (object - optional) The Axios config object.

#### axiosPut(url, data, config)

Axios PUT
*   returns object
*   **url:** (string) The url.
*   **data:** (object) The object to send.
*   **config:** (object - optional) The Axios config object.

#### axiosPatch(url, data, config)

Axios PATCH
*   returns object
*   **url:** (string) The url.
*   **data:** (object) The object to send.
*   **config:** (object - optional) The Axios config object.

#### axiosDelete(url, config)

Axios DELETE
*   returns object
*   **url:** (string) The url.
*   **config:** (object - optional) The Axios config object.

### Other methods

#### getDocs(type, match, options)

Retrieves documents based on the specified query. This method enables any table in the Ods database to be queried.
*   returns Array of objects
*   **type:** (string) The document type. The current types are: sbom2, leanix, attestation, attestationDefinition, depsdev, feedback, guidance, issue, notebookvar, query, script, sonarqube, store, logs, apitokens.
*   **match:** (object) The MongoDB match object.
*   **options:** (option) The options object with format {projection: {}, sort: {}, limit: {}}

#### getDoc(type, id, projection)

Gets the document for the id from any table in the Ods database.
*   returns object
*   **type:** (string) The document type. The current types are: sbom2, leanix, attestation, attestationDefinition, depsdev, feedback, guidance, issue, notebookvar, query, script, sonarqube, store, logs, apitokens
*   **id:** (string) The document id.
*   **projection:** (object) The MongoDB projection object.

#### getProfile(idOrEmail, details)

Get the user profile from the user directory.
*   returns object
*   **idOrEmail:** (string) The user email or user id.
*   **details:** (boolean) T=return all details, F=return only id, name, email, businessUnit, manager

#### getManagementChain(users)

Get the management chain for a list of users from user directory. If more than one user is passed in, then all unique managers are returned.
*   returns object
*   **users:** (string\[\]) The array of user email or user ids.

### ETL methods

#### log(args)

Print log message to terminal
*   **args:** (any) The same args supported by console.log()

#### getLogs()

Get all ETL logs.
*   returns Array of log documents

#### getStatus()

Get the ETL status.
*   returns {status, command, comment}

### The following variables are available:

#### ctx

The user context
*   type: object

#### parameters

The parameters passed in
*   type: object
