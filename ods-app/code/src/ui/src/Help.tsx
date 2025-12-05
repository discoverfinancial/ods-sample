/**
 * Copyright (c) 2025 Capital One
*/

import React, { useState } from 'react';
import { Tooltip } from '@mui/material';
import { AppContext } from './common';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';

let elkey = 1;

type Props = {
    context: AppContext;
    topic?: string;
};

const Help: React.FC<Props> = React.memo(({context, topic}) => {
    const user = context.user;

    const showScriptAdmin = (topic == "adminServerScript" || (topic == "notebookServerScript" && context.isAdministrator));

    const lbrace = '{';
    const rbrace = '}';

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    }

    const renderMethod = (method: string, returns: any, description: any, params?:any) => {
        const copyText = `${method}(${params ? Object.keys(params).join(", ") : ""})`;

        return (<li key={`help_${elkey++}`}>
            <Tooltip title="Copy method to clipboard" placement="bottom-start" enterDelay={500}>
                <ContentCopyOutlinedIcon style={{cursor:"pointer", width:".5em", height:".5em"}} onClick={() => copyToClipboard(copyText)}/>
            </Tooltip> &nbsp;
            <h6 style={{display:"inline"}}>{method}({params ? Object.keys(params).join(", ") : ""})</h6>
             - {description}
            <ul>
                {returns && <li>returns {returns}</li>}
            {params && Object.keys(params)?.map(key => {
                return (
                    <li key={`help_${elkey++}`}>
                        <b>{key}:</b> {params[key]}
                    </li>
                )
            })}
            </ul>
        </li>)
    }
    const renderVariable = (name: string, returns: any, description: any) => {
        return (<li key={`help_${elkey++}`}>
            <h6 style={{display:"inline"}}>{name}</h6> - {description}
            <ul>
                {returns && <li key={`help_${elkey++}`}>type: {returns}</li>}
            </ul>
        </li>)
    }


    return (
        <div className="helpDiv">
            {topic == "databaseQuery" && <div>

                <h4>Query Help</h4>
                    <div>There are two types of queries:
                        <ol><li>MongoDB query</li><li>Javascript code</li></ol>
                    </div>
                    <div>
                        <h6>MongoDB Query:</h6>
                        <div>
                            A JSON query_object specifies the object in the MongoDB <pre>$match: {lbrace}query_object{rbrace}</pre>
                            (Refer to the <a onClick={() => window.open("https://www.mongodb.com/docs/manual/reference/operator/query/", "_blank")}>MongoDB docs</a> for how to define queries)
                            For example, to find all product names that contain the substring "spring", 
                            the query_object would be 
                            <pre>{JSON.stringify({"metadata.component.name": {$regex: ".*spring.*"}},null,4)}</pre>
                        </div>
                        <div>
                            The query_object can also be a MongoDB aggregate query by using the "aggregate" key.  
                            For example, to find all product names that contain "spring" and sort by component type
                            <pre>{JSON.stringify(
                            {
                                aggregate:[
                                    {
                                    $match: { "metadata.component.name": {$regex: ".*spring.*", $options: "i"} }
                                    },
                                    {
                                    $sort: { "metadata.component.type": -1},
                                    },
                                ]
                            },null,2)}</pre>
                        </div>
                        <div>
                            The projection input identifies what properties are returned in the result.  
                            <ul>
                                <li>If empty, then the summary subset of the properties is returned.</li>
                                <li>If an empty object, {lbrace}{rbrace}, then all properties are returned.</li>
                                <li>Otherwise, any MongoDB projection object is accepted.</li>
                            </ul>
                            Note that this is ignored for Javascript code queries.
                        </div>
                    </div>
                    <div>
                        <h6>Javascript Query:</h6>
                        <div>
                            A Javascript query specifies Javascript code that is run inside a sandbox on your browser.
                            <p>If the content of the "Query or Script" starts with something other than a left brace, {lbrace}, then it is run as Javascript.</p>
                        </div>
                        <div>                           
                            <div>Note that all calls made in the sandbox are asynchronous, 
                            so await must be used with each method below.  For example <pre>const r = await query(q, p)</pre>
                            To return a result, use the <pre style={{display:"inline"}}>return</pre> statement.</div>

                            <p>Methods that are available in the sandbox include:</p>

                            <ul>
                                {renderMethod("query", "object", "Queries the specified database for the match parameter.", {
                                    match: "(object) The MongoDB match object.", 
                                    projection: "(object) The MongoDB projection object. If projection is specified then only those fields are returned.", 
                                    limit: "(string) The maximum number of documents to return", 
                                    sort: "(string) The MongoDB sort.", 
                                    database: "The database to query.  The default is SBOM. Other possible database values are Guidance, Cdxgen."})}
                                {renderMethod("aggregate", "object", "Runs an aggregate command on the specified MongoDB database.", 
                                    {a: "(object) The MongoDB aggregate object.", 
                                    projection: "(object) The MongoDB projection object. If projection is specified then the $project stage is added to your aggretgate command.",
                                    limit: "(string) The maximum number of documents to return", 
                                    database: "The database to query.  The default is SBOM. Other possible database values are Guidance, Cdxgen."})}
                                {renderMethod("prompt", "The string the user entered", "Display a prompt dialog.", {message: "(string) The message to display"})}
                                {renderMethod("setDocType", "", 
                                    "This can be called to identify the type of returned results, so that the appropriate data table can be used to display the results.",
                                    {type: `(string) Possible values for type are SBOM, Guidance, json, string.  Use "json" for any JSON object`})}
                            </ul>
                            Variables defined are:
                            <ul>
                                {renderVariable("database", "string", `The selected database from the "Select Table" dropdown`)}
                                {renderVariable("projection", "object", `The projection entered in the "Enter MongoDB Projection" input`)}
                            </ul>
                        </div>
                        <div>
                            Additional methods are available to Editor and Administrators:
                            <ul>
                                {renderMethod("getContext", 
                                    <pre>
                                        Example of the user context:
                                        {JSON.stringify(
                                        {
                                            user: {
                                                "id": "...",
                                                "name": "...",
                                                "roles": [],
                                                "department": "...",
                                                "email": "...s@test.com",
                                                "title": "...",
                                                "employeeNumber": "..."
                                            },
                                            isAdministrator: true,
                                            isEditor: true,
                                            isEmployee: true,
                                        },null,4)} 
                                    </pre>
                                    , "Returns the user context object")}
                                {renderMethod("getDocuments", "object", `Queries the database collection "type".`,
                                    {type: "(string) The valid values for type are sbom, guidance, attestation, attestationDefinition, depsdev, store.",
                                    params: <>
                                        (object) The params object combines the match and projection objects
                                        <pre>
                                            {JSON.stringify({
                                                params: { match: { field: "value"}, projection: {}}
                                            },null,4)}
                                        </pre>
                                    </>})}
                                {renderMethod("createDocument", "object", `Creates a document in the database collection "type".`,
                                    {
                                        type: "(string) The valid values for type are sbom, guidance, attestation, attestationDefinition, depsdev, store.",
                                        args: "(object) The document object."
                                    })}
                                {renderMethod("saveDocument", "object", `Updates an existing document in the database collection "type".`, 
                                    {
                                        type: "(string) The valid values for type are sbom, guidance, attestation, attestationDefinition, depsdev, store.",
                                        args: "(object) The partial document object to update.",
                                        id: "(string) The id of the document to update."
                                    })}
                                {renderMethod("deleteDocument", "object", `Deletes a document in the database collection "type".`,
                                    {
                                        type: "(string) The valid values for type are sbom, guidance, attestation, attestationDefinition, depsdev, store.",
                                        id: "(string) The id of the document to delete."
                                    })}
                                {renderMethod("deleteMany", "object", `Deletes all documents that match query in the database collection "type".`,
                                    {
                                        type: "(string) The valid values for type are sbom, guidance, attestation, attestationDefinition, depsdev, store.",
                                        match: "(object) A MongoDB match object."
                                    })}
                            </ul>
                        </div>
                    </div>

            </div>}

            {(topic == "userServerScript" || topic == "adminServerScript" || topic == "notebookServerScript") && <div>
                <h4>{topic!="notebookServerScript" && <>Server</>} {topic=="notebookServerScript" && <>Notebook</>} Script Help</h4>
                    <div>
                        <p>A server script can be run to queries and process data from any data source.</p>
                        <p>This script runs inside a Javascript sandbox on the server.  
                        All intermediate data remains on the server, with only the data specified in the setResult() method returned
                        to the browser or another application if the script API is called.
                        </p>
                        <p>
                        When the script is saved, it will be created with an id that is used to specify it when calling via the script API.
                        Refer to the "Script endpoint" section for the url to use.  
                        </p>
                        <p>
                        Any parameters passed in to the script are available in the "parameters" variable.
                        </p>
                    </div>
                    <div className='spacer'>
                        The following methods are available:
                    </div>
                    <div className='spacer'>
                    
                        <h5>SBOM methods</h5>
                        <ul>
                            {renderMethod("getAllSboms", "SBOM[]", "Get metadata properties for all Sboms.  Returns only id, metadata, dateUpdated properties.")}
                            
                            {renderMethod("getSboms", "SBOM[]", "Query for SBOM documents.", {params: <>The mongodb query and/or projection with format {JSON.stringify({match: {}, options: {projection: {}}})}</>})}
                            
                            {renderMethod("getSbomId", "id or BomRef", "Get the SBOM ID for the given product name and version, or latest version if not specified.", {productName: "(string) The product name", productVersion: "(string - optional) The product version"})}
                            
                            {renderMethod("getSbomById", "SBOM", "Get an SBOM by its id.", {id: "The id of the Sbom"})}
                            
                            {renderMethod("getSbomByBomRef", "SBOM", "Get an SBOM by its BomRef.  If getIdOnly=true, then just return the id.", {bomRef: "(object) The BomRef object", getIdOnly: "(boolean) T=return id, F=return Sbom object"})}
                            
                            {renderMethod("getSbomForCdxgenId", "SBOM", "Retrieves the SBOM for the Cdxgen id.", {id: "(string) The Cdxgen id"})}
                            
                            {renderMethod("getSbom", "SBOM", "Get the SBOM for the given product name and optionally version.", {productName: "(string) The product name", productVersion: "(string - optional) The product version"})}

                            {renderMethod("getOssAnalysis", "SBOM[]", "Get analysis for all top-level open source software used by product.", {sbomId: "(string) The id of the Sbom"})}

                            {renderMethod("getMetadataProperty", "object", "Get the metadata property from the Sbom.", {sbom: "(object) The Sbom object.", name: "(string) The property name"})}
                            
                            {renderMethod("createBomRef", "BomRef", "Create a BomRef object from an SBOM component object.", {component: "(object) The component object", id: "(string - optional) The id of the Sbom"})}

                            {renderMethod("searchSboms", "SBOM[]", `Search for software.  This is the same search form used for Software List page.`, {
                                searchText: "(string) The search string.  Use * for partial matches.", 
                                searchParam: "(object - optional)", 
                                searchType: "(string[] - optional)", 
                                uses: "(object) - optional", 
                                vulnerabilities: "(boolean - optional)", 
                                usesOrSearch: "(boolean - optional)", 
                                onlyVulnerabilities: "(boolean - optional)", 
                                nonCompliance: "(boolean - optional)"
                            })}

                            {renderMethod("getSoftwareThatUsesLibrary", "SBOM[]", "Get all software applications that use a library.", {searchText: "(string) The library name to look for.  Use * for partial matches."})}


                            {renderMethod("getSbomVersions", "[{id:bomRef, count:number of sboms that use this sbom}]", "Get all versions for a software package. Note that this only returns versions that are used by other SBOMS.  Not all versions in database.", {idOrName: "(string) The id or name of software package"})}

                            {renderMethod("getMostUsed", "SBOM[]", "Get most used Sboms or those that are top-level dependencies.", {directDependency: "T=Get top-level dependencies, F=Get most used Sboms"})}

                        </ul>

                        {showScriptAdmin && <div>

                            <h5>SBOM Methods (Admin)</h5>
                            <ul>
                            
                            {renderMethod("deleteSbom", "", "Delete Sbom by its id.", {id: "(string) The id of the Sbom to delete."})} 
                            
                            {renderMethod("updateSbom", "SBOM", "Update Sbom.", {sbom: "(object) The Sbom object", id: "(string - optional) The id of the Sbom to update.  If not specified, then the id must be in the Sbom object."})} 
                            
                            {renderMethod("createSbom", "SBOM", "Create Sbom", {sbom: "(object) The Sbom object to create."})} 
                            
                            {renderMethod("setMetadataProperty", "", "Sets a metadata property on the given SBOM object.", {sbom: "(object) The SBOM object to set the property on.", name: "(string) The name of the property to set.", value: "(object) The value to set for the property."})} 
                            
                            {renderMethod("setMetadataComponentItem", "", "Set component information in SBOM metadata.", {sbom: "(object) The SBOM object to set the info on.", name: "(string) The name of the key to set.", value: "(string) The value to set for the key."})} 
                            
                            {renderMethod("addAssembly", "", "Add an assembly to the SBOM's compositions array.", {sbom: "(object) The SBOM object to set.", id: "(string) The SBOM id for the assembly to add."})} 
                            
                            </ul>
                        </div>}

                        <h5>Guidance methods</h5>
                        <ul>

                            {renderMethod("getGuidanceDocs", "Array of guidance objects", "Get all guidance documenets.", {params: `(object) The query parameter with {params:{match:{}, options:{projection:{}}}}`})}
                            
                            {renderMethod("getGuidanceVersionInfo", "Array of guidance objects", "Get the guidance docs for all versions of the base purl.", {basePurl: "(string) The base purl."})}

                        </ul>

                        {showScriptAdmin && <div>
                            <h5>Guidance Methods (Admin)</h5>
                            <ul>
                            
                            {renderMethod("createGuidance", "Guidance object", "Create guidance document", {guidance: "(object) The guidance object."})} 
                            
                            {renderMethod("updateGuidance", "Guidance object", "Update guidance document.", {guidance: "(object) The guidance object.", id: "(string) The id of the guidance document to update."})} 
                            
                            {renderMethod("deleteGuidance", "boolean T=successful, F=error", "Delete guidance document.", {id: "The id of the guidance document to delete."})} 
                            
                            {renderMethod("changeGuidanceState", "object", "Change guidance state.", {id: "(string) The id of the guidance.", newState: `(string) The new state.  Valid values are created, active, closed, cancelled.`})} 
                            
                            {renderMethod("retireGuidanceForPurl", "Array of guidance objects that were changed.", "Retire guidance documents for purl.", {purl: "(string) The PURL"})} 

                            {renderMethod("updateTier2Guidance", "", "Update guidance for tier2 components.  Guidance for Tier2 components are generated by looking at deps.dev.")} 
                            </ul>

                        </div>}

                        <h5>Store methods</h5>
                        <ul>
  
                            {renderMethod("getStoreDocs", "Array of store objects", "Get all store documents.", {params: "(object) The query parameter with {params:{match:{}, options:{projection:{}}}}"})}

                        </ul>

                        {showScriptAdmin && <div>
                            <h5>Store Methods (Admin)</h5>
                            <ul>
                            
                            {renderMethod("createStoreDoc", "Store object", "Create store document.", {item: "(object) The store object."})} 
                            
                            {renderMethod("updateStoreDoc", "Store object", "Update store document.", {item: "(object) The store object.", id: "(id) The id of the store document to update."})} 
                            
                            {renderMethod("deleteStoreDoc", "boolean T=successful, F=error", "Delete store document.", {id: "(string) The id of the store document to delete."})} 
                            
                            </ul>
                        </div>}

                        <h5>Github methods</h5>
                        <ul>

                            {renderMethod("getTag", "The matching version, or null if not found", "Retrieves the tag for a specific commit in a GitHub repository.", {org: "(string) The GitHub organization name.", repo: "(string) The GitHub repository name.", commit: "(string) The commit hash to search for.", versions: "(string[]) An array of version strings to search for."})}
                            
                            {renderMethod("getRepositories", "An array of Github repositories, or null if not found", "Searches for GitHub repositories matching a given name.", {repo: "(string) The repository name to search for."})}

                        </ul>

                        {showScriptAdmin && <div>
                        </div>}

                        <h5>Deps.dev and Dependencies methods</h5>
                        <ul>

                            {renderMethod("getDepsdevDocs", "Array of objects", "Get all depsdev docs")}
                            
                            {renderMethod("getDepsdevDoc", "Object", "Get depsdev document for base purl.", {basePurl: "(string) The base purl."})}
                            
                            {renderMethod("getPackageFromBasePurl", "Object containing version and package information", "Retrieve package information associated with the given base purl.", {purl: "(string) The purl of the package to query."})}
                            
                            {renderMethod("getPackageFromPurl", "Object containing version and package information", "Retrieve package information associated with the given purl.", {purl: "(string) The purl of the package to query."})}
                            
                            {renderMethod("getVersionDetails", "{version, project}", "Get the version details.", {purl: "(string) The Deps.dev purl.", system: "(string) The Deps.dev system (go, npm, cargo, maven, pypi, nuget)", name: "(string) The Deps.dev name.", version: "(string) The Deps.dev version."})}
                            
                            {renderMethod("getPackageVersions", "string[] containing up to 5 version numbers in reverse order.  The defaultValue is the first version in the list", "Find the last 5 versions for the package with the given purl.", {purl: "(string) The purl of the package."})}

                        </ul>

                        {showScriptAdmin && <div>
                            <h5>Deps.dev and Dependencies methods (Admin)</h5>
                            <ul>

                            {renderMethod("refreshCachedDepsdev", "", "Retrieve open source product version information from https://deps.dev and cache in ODS App database and update SBOM with latest cached info.")} 

                            </ul>
                        </div>}

                        {/* {showScriptAdmin && <div>
                            <h5>Api Center Methods (Admin)</h5>
                            <ul>

                            {renderMethod("updateApiCenter", "", "Process Api Center data and update SBOMs.", {doRefresh: "true=create new and update existing annotations, false=create new annotations but don't update existing ones."})} 
                            
                            </ul>
                        </div>} */}

                        <h5>Notebook methods</h5>
                        <ul>

                            {renderMethod("setNotebookId", "", "Set the current notebook id.", {id: "(string) The id of the notebook."})}
                            
                            {renderMethod("getNotebookId", "string", "Get the current notebook id.")}
                            
                            {renderMethod("setNotebookVar", "", "Set a notebook variable.  This is saved in the database.", {notebookId: "(string) The notebook id.", name: "(string) The name of the variable.", value: "(object) The value of the variable."})}
                            
                            {renderMethod("getNotebookVar", "object", "Get the value of a notebook variable.", {notebookId: "(string) The notebook id.", name: "(string) The name of the variable."})}
                            
                            {renderMethod("getNotebookVars", "string[]", "Get the names of all notebook variables for the given notebook.", {notebookId: "(string) The notebook id."})}
                            
                            {renderMethod("deleteNotebookVar", "", "Delete a notebook variable.", {notebookId: "(string) The notebook id.", name: "(string) The name of the variable."})}

                        </ul>

                        {showScriptAdmin && <div>
                        </div>}

                        <h5>Axios methods</h5>
                        <ul>

                            {renderMethod("axiosGet", "object", "Axios GET.", {url: "(string) The url.", config: "(object - optional) The Axios config object."})}
                            
                            {renderMethod("axiosPost", "object", "Axios POST.", {url: "(string) The url.", data: "(object) The object to send.", config: "(object - optional) The Axios config object."})}
                            
                            {renderMethod("axiosPut", "object", "Axios PUT.", {url: "(string) The url.", data: "(object) The object to send.", config: "(object - optional) The Axios config object."})}
                            
                            {renderMethod("axiosPatch", "object", "Axios PATCH.", {url: "(string) The url.", data: "(object) The object to send.", config: "(object - optional) The Axios config object."})}
                            
                            {renderMethod("axiosDelete", "object", "Axios DELETE.", {url: "(string) The url.", config: "(object - optional) The Axios config object."})}

                        </ul>

                        {showScriptAdmin && <div>
                        </div>}

                        <h5>Other methods</h5>
                        <ul>
                            
                            {renderMethod("getDocs", "Array of objects", "Retrieves documents based on the specified query.  This method enables any table in the ODS App database to be queried.", {
                                type: "(string) The document type.  The current types are: sbom, depsdev, guidance, notebookvar, query, script, store, logs, apitokens.",
                                match: "(object) The MongoDB match object.",
                                options: "(option) The options object with format {projection: {}, sort: {}, limit: {}}"})}
                            
                            {renderMethod("getDoc", "object", "Gets the document for the id from any table in the ODS App database.", {
                                type: "(string) The document type.  The current types are: sbom, depsdev, guidance, notebookvar, query, script, store, logs, apitokens.", 
                                id: "(string) The document id.",
                                projection: "(object) The MongoDB projection object."})}

                            
                            {renderMethod("getProfile", "object", "Get the user profile from the user directory.", {idOrEmail: "(string) The user email or user id.", details: "(boolean) T=return all details, F=return only id, name, email, businessUnit, manager"})}
                            
                            {renderMethod("getManagementChain", "object", "Get the management chain for a list of users from user directory.  If more than one user is passed in, then all unique managers are returned.", {users: "(string[]) The array of user email or user ids."})}

                        </ul>

                        {showScriptAdmin && <div>
                            <h5>Other Methods (Admin)</h5>
                            <ul>
                            
                            {renderMethod("createDoc", "object", "Create a new document.", {
                                type: "(string) The document type.  The current types are: sbom, depsdev, feedback, guidance, issue, notebookvar, query, script, store, logs, apitokens.",
                                doc: "(object) The document object."})} 
                            
                            {renderMethod("updateDoc", "object", "Update a document.", {
                                type: "(string) The document type.  The current types are: sbom, depsdev, feedback, guidance, issue, notebookvar, query, script, store, logs, apitokens.",
                                id: "(string) The id of the document to update.", 
                                args: "(object) The document object."})} 
                            
                            </ul>
                        </div>}

                        <h5>ETL methods</h5>
                        <ul>
                            
                            {renderMethod("log", "", "Print log message to terminal", {args: "(any) The same args supported by console.log()"})}
                            
                            {renderMethod("getLogs", "Array of log documents", "Get all ETL logs.")}

                            {renderMethod("getStatus", "{status, command, comment}", "Get the ETL status.")}

                        </ul>

                        {showScriptAdmin && <div>
                            <h5>ETL Methods (Admin)</h5>
                            <ul>
                            
                            {renderMethod("writeLog", "", "Write to the ETL log.", {message: "(string) The log text."})} 
                            
                            {renderMethod("deleteLog", "", "Delete a log message from the ETL log.", {id: "(string) The id of the log message to delete."})}

                            {renderMethod("setStatus", "", "Set the ETL status.", {status: "(string) The general status.", command: "(string) The command being executed.", comment: "(string) A comment."})} 
                            
                            {renderMethod("setStatusComment", "", "Set the ETL status comment.", {comment: "(string) A comment."})} 
                            
                            {renderMethod("stop", "", "Stop running the current ETL command.")} 
                            </ul>

                            <h5>ETL Methods Operation (Admin)</h5>
                            <ul>

                            {renderMethod("refreshCachedEndoflife", "", "Refresh cached end of life data from https://endoflife.date", {doRefresh: "(boolean) true=create new and update existing documents, false=create new documents but don't update existing ones"})} 

                            </ul>

                        </div>}


                        <h5>The following variables are available:</h5>

                        <ul>
                            
                            {renderVariable("ctx", "object", "The user context")}
                            
                            {renderVariable("parameters", "object", "The parameters passed in")}

                        </ul>
                    </div>

                    {topic == "notebookServerScript" && <div>
                        <h4>ReactJS Cell</h4>
                        <p>ReactJS code can also be run in a cell to render a UI to collect user input.  The ReactJS code runs in the browser and can interact with other cells using the following methods:</p>
                        <ul>
                            {renderMethod("getVar", "(object) The value of the variable", "Get the notebook variable.", {name: "(string) The name of the variable."})} 
                            {renderMethod("setVar", "", "Set the notebook variable that can be used by other cells.", {name: "(string) The name of the variable.", value: "(object) The value to set."})} 
                            {renderMethod("getCellResult", "(object) The value of the variable", "Get the result of a cell.", {id: "(number) The cell index."})} 
                            {renderMethod("runCell", "", "Run a cell in the notebook.  A variable can be set that is used in another cell and then run that cell.", {id: "(number) The cell to run."})} 

                        </ul>

                        <h5>The following variables are available:</h5>
                        <ul>
                            {renderVariable("React", "object", "The React JS global object.")}
                            {renderVariable("useEffect", "object", "The React JS useEffect function (shortcut for React.useEffect).")}
                            {renderVariable("useState", "object", "The React JS useState function (shortcut for React.useEffect).")}
                            {renderVariable("useRef", "object", "The React JS useRef function (shortcut for React.useRef).")}
                            
                            {renderVariable("mui", "object", <>The Mui UI global object.
<code><pre>{`<mui.Button>
    Mui components can be used
</mui.Button>`}</pre></code>
                            </>)}
                            {renderVariable("mgr", "object", <>The manager classes are available from this object.  For example, to get the GuidanceMgr, use
                                <code><pre>
                                const gmgr = mgr.GuidanceMgr.getInstance();
                                </pre></code></>)}

                            {renderVariable("d3", "object", "The D3.js global object. D3 is a JavaScript graphics library.")}
                        </ul>

                        <h5>The following ODS App components are available:</h5>
                        <ul>

                            {renderVariable("SbomDataGrid", "object", "The SbomDataGrid component.")}
                            {renderVariable("JsonDataGrid", "object", "The JsonDataGrid component.")}
                            {renderVariable("MostUsedDataGrid", "object", "The MostUsedDataGrid component.")}
                            {renderVariable("LibrariesDataGrid", "object", "The LibrariesDataGrid component.")}
                            {renderVariable("VersionsDataGrid", "object", "The VersionsDataGrid component.")}
                            {renderVariable("AgGridReact", "object", "The AgGridReact component.")}

                        </ul>

                        <h5>Sample JSX Component</h5>
                        <code><pre>
{`
// ReactJS component
const [count, setCount] = React.useState(0);
const increment = async () => {
  await setVar("count", {value: (count+1)});
  await setVar("countNum", (count+1));
  setCount(count + 1);
  await runCell(1);    
}
console.log("props=", props);

async function init() {
  console.log("Running INIT")
  const c = await getVar("count");
  if (c) {
    setCount(c.value);
  }
}

useEffect(() => {
  init();
}, []);

const gmgr = mgr.GuidanceMgr.getInstance();

return (
  <div>
    <p>Count: {count}</p>

    <button onClick={increment}>Increment</button>

    <mui.Tabs
        value="oss"
        className="slate"
    >
        <mui.Tab value="metadata" label="Metadata" />
        <mui.Tab value="compositions" label="Compositions" />
        <mui.Tab value="components" label="Components" />
        <mui.Tab value="oss" label="OSS Analysis" />
    </mui.Tabs>

    <mui.Button>Mui components can be used</mui.Button>
    
  </div>
);
`}            
                        </pre></code>
                    </div>}


            </div>}

            {(topic == "pages") && <div>
                <h4>Pages Help</h4>
                <div>
                    <p>A ReactJS component can be created and rendered as a page in ODS App.</p>
                    <p>The page is the content of the ReactJS component with a render() method.
                    </p>
                    <div className='spacer'/>
                    <h5>The following variables are available:</h5>
                    <ul>
                        {renderVariable("React", "object", "The React JS global object.")}
                        {renderVariable("useEffect", "object", "The React JS useEffect function (shortcut for React.useEffect).")}
                        {renderVariable("useState", "object", "The React JS useState function (shortcut for React.useEffect).")}
                        {renderVariable("useRef", "object", "The React JS useRef function (shortcut for React.useRef).")}
                        
                        {renderVariable("mui", "object", <>The Mui UI global object.
<code><pre>{`<mui.Button>
    Mui components can be used
</mui.Button>`}</pre></code>
                        </>)}
                        {renderVariable("mgr", "object", <>The manager classes are available from this object.  For example, to get the GuidanceMgr, use
                            <code><pre>
                            const gmgr = mgr.GuidanceMgr.getInstance();
                            </pre></code></>)}

                        {renderVariable("d3", "object", "The D3.js global object. D3 is a JavaScript graphics library.")}
                    </ul>

                    <h5>The following ODS App components are available:</h5>
                    <ul>

                        {renderVariable("SbomDataGrid", "object", "The SbomDataGrid component.")}
                        {renderVariable("JsonDataGrid", "object", "The JsonDataGrid component.")}
                        {renderVariable("MostUsedDataGrid", "object", "The MostUsedDataGrid component.")}
                        {renderVariable("LibrariesDataGrid", "object", "The LibrariesDataGrid component.")}
                        {renderVariable("VersionsDataGrid", "object", "The VersionsDataGrid component.")}
                        {renderVariable("AgGridReact", "object", "The AgGridReact component.")}

                    </ul>

                    <h5>Sample JSX Component</h5>
                    <code><pre>
{`
// ReactJS component
const [count, setCount] = React.useState(0);

const increment = async () => {
  setCount(count + 1);
}

console.log("props=", props);

useEffect(() => {
  console.log("Count has changed: ", count);
}, [count])

useEffect(() => {
  console.log("Running INIT")
}, []);

return (
  <div>
    <p>Count: {count}</p>
    <mui.Button onClick={increment}>Increment+1234</mui.Button>
  </div>
);
`}            
                    </pre></code>

                </div>
            </div>}
            </div>
        
    );
});
export default Help;
