/**
 * Copyright (c) 2025 Capital One
*/

import createWorkerBox from 'workerboxjs';
import { SbomMgr } from '../managers/SbomMgr';
import { StoreMgr } from '../managers/StoreMgr';
import { AppContext } from "../common";
import { DepsDevMgr } from '../managers/DepsDevMgr';
import { GuidanceMgr } from '../managers/GuidanceMgr';

/**
 * Get the document manager for the document type
 * 
 * @param type Document type
 * @returns Document manager object
 */
export function getManager(type="SBOM") {
    if (type == "SBOM") {
        return SbomMgr.getInstance();
    }
    else if (type == "Store") {
        return StoreMgr.getInstance();
    }
    else if (type == "DepsDev") {
        return DepsDevMgr.getInstance();
    }
    else if (type == "Guidance") {
        return GuidanceMgr.getInstance();
    }
    return {} as any;
}

/**
 * Run Javascript code in sandbox
 * 
 * @param script The javascript code to run
 * @param projection [optional] The projection that user entered in UI
 * @param database [optional] The database that user selected in UI
 * @returns object
 */
export async function runScript(context: AppContext, script: string, projection?: string, limit?: string, sort?: string, database?: string) {

    console.log("RUNNING SCRIPT")
    // Note each `workerbox` instance has it's own sandbox
    const { run, destroy } = await createWorkerBox(undefined);
    let docType = null;
    const err:any = [];

    let callback:any;
    const userScope = {
        database: database,
        projection: projection,
        limit: limit,
        sort: sort,
        query: async function(match: any, projection={}, limit="", sort="", database="SBOM") {
            try {
                const params:any = {
                    match: {
                        // "metadata.component.name": {$regex: ".*spring-boot.*", $options: "i"}, 
                    },
                    options: {},
                }
                if (match) {
                    params.match = match;
                }
                if (projection) {
                    params.options.projection = projection;
                }
                if (limit) {
                    params.options.limit = parseInt(limit);
                }
                if (sort) {
                    params.options.sort = sort;
                }
                const mgr = getManager(database);
                const r = await mgr.getDocuments({params: params});
                return r;
            }
            catch (e) {
                console.log("Error querying document: ", e);
                err.push("Error querying document: " + e)
            }
        },
        aggregate: async function(a: any, projection={}, limit="", database="SBOM") {
            try {
                const params:any = {
                    match: {
                        aggregate: [
                        // "metadata.component.name": {$regex: ".*spring-boot.*", $options: "i"}, 
                        ]
                    },
                    options: {},
                }
                if (a) {
                    params.match = {aggregate: a};
                }
                if (projection) {
                    params.options.projection = projection;
                }
                if (limit) {
                    params.options.limit = parseInt(limit);
                }
                const mgr = getManager(database);
                const r = await mgr.getDocuments({params: params});
                return r;
            }
            catch (e) {
                console.log("Error querying aggregate document: ", e);
                err.push("Error querying aggregate document: " + e)
            }
            
        },
        setCallback: (fn:any) => {
            // You can store arguments, objects, arrays and returned values
            // outside of the scope of your main app, and then call them
            // from anywhere, so long as the worker is not destroyed.
            console.log("*** setCallback: fn=", fn);
            callback = fn;
        },
        prompt: window.prompt,
        // Possible values = <"SBOM" | "Guidance" | "json" | "string" | "">
        setDocType: function(type: string) {
            docType = type;
        },
        getProfile: async function(emailOrUid: string) {
            
        },
    }

    const adminScope = {
        getContext: async function() {
            return context;
        },
        getDocuments: async function(type: string, params:any={}) {
            try {
                const mgr = getManager(type);
                const r = await mgr.getDocuments({params: params})
                return r;
            }
            catch (e) {
                console.log("Error getting document: ", e);
                err.push("Error getting document: " + e)
            }
        },
        createDocument: async function(type: string, args:any) {
            try {
                const mgr = getManager(type);
                const r = await mgr.createDocument(args)
                return r;
            }
            catch (e) {
                console.log("Error creating document: ", e);
                err.push("Error creating document: " + e)
            }
        },
        saveDocument: async function(type: string, args:any, id: string) {
            try {
                const mgr = getManager(type);
                const r = await mgr.saveDocument(args, id)
                return r;
            }
            catch (e) {
                console.log("Error saving document: ", e);
                err.push("Error saving document: " + e)
            }
        },
        deleteDocument: async function(type: string, id: string) {
            try {
                const mgr = getManager(type);
                const r = await mgr.deleteDocument(id)
                return r;
            }
            catch (e) {
                console.log("Error saving document: ", e);
                err.push("Error saving document: " + e)
            }
        },
        deleteMany: async function(type: string, match:any={}) {
            try {
                const mgr = getManager(type);
                const r = await mgr.deleteMany(match)
                return r;
            }
            catch (e) {
                console.log("Error deleting many documents: ", e);
                err.push("Error deleting many documents: " + e)
            }
        },
    };

    // Only admins can do CRUD
    const scope = context.isAdministrator ? {...userScope, ...adminScope} : userScope;

    setInterval(() => {
        if (callback) {
            // This will communicate with the workerbox transparently.
            callback();
        }
    });
    try {
        const r = await run(script, scope);
        if (err.length > 0) {
            return {data: err, docType: "json"}
        }
        return {data: r, docType: docType};

    } catch (e) {
        console.log("Error running script: ", e);
        return {data: "Error running script: " + e, docType: "string"}
    }
}