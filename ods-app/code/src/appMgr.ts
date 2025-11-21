/**
 * Copyright (c) 2025 Capital One
*/

import { apikeyType, Ods } from "ods-framework";
import { 
    UserContext, 
    Logger, 
    EmailAttachment, 
    Documents, 
    DocType, 
    Config,
    User,
} from "ods-framework";
import {
    sbomType,
    storeType,
    queryType,
} from "ods-framework";
import {
    Role, 
} from "ods-framework";

import {
    guidanceType,
    GuidanceUpdated,
    cdxgenType,
    depsdevType,
    endoflifeType,
    MostUsed,
    GetVersions,
    UsesLibrary,
    OssAnalysis,
} from "./common";
import {
    guidanceStates,
    cdxgenStates,
    depsdevStates,
    endoflifeStates,
} from "./common";
import { MyUserProfileService } from "./myUserProfileService";
import { Bom, STATUS } from 'ods-framework';
import { ObjectId } from 'mongodb';
import { ETL } from "ods-framework";
import express from 'express';
import {
    validateGuidance,
    validateCdxgen,
    validateDepsdev,
    validateEndoflife,
} from "./validate";
import { summaryProjection } from "./common";
import path from "path";
import { CdxgenClient } from "./etl/cdxgen";
import { DepsdevClient } from "./etl/depsdev";
import { EndoflifeClient } from "./etl/endoflife";
import { GuidanceProcessor } from "./etl/guidance";
var fs = require("fs");
var os = require("os");

const log = new Logger("ods-appMgr");
const config = new Config();

const GROUP_ADMIN = "Admin";
const GROUP_EDITOR = "Editor";
const GROUP_TESTER = "Tester";

const emailEnabled = process.env.EMAIL_ENABLED === 'true';
const emailDebug = process.env.EMAIL_DEBUG;
const adminEmail = process.env["ADMIN_EMAIL"] || "";
const enableUtf8Validation = (process.env["enableUtf8Validation"] == "false") ? false : true;
console.log("enableUtf8Validation =", enableUtf8Validation);
const dbApp = process.env["DB_APP"] || "odsapp"; // "surveyor";
const etlEnabled = process.env.ETL_ENABLED === 'true';

let dropDb = 0;
const port = parseInt(process.env["PORT"] || "3000");
const baseUrl = process.env["BASE_URL"] || "http://localhost:" + port;

export const defaultUser: User = {
    id: "employee",
    roles: [
        Role.Employee,
    ],
    name: "User",
    department: "",
    email: "",
    title: "User",
    employeeNumber: "",
};

export interface CollectionDataQuery {
    name: string;
    match?: any;
    options?: any;
}

export type CollectionNamesArray = CollectionDataQuery[];

export type DocumentProcessor = (self: AppMgr, ctx: UserContext, collectionName: string, doc: any, alwaysUpdate: boolean) => Promise<boolean>;


type DocTypeOptional = Partial<DocType>

const historyCommentsOwner: DocTypeOptional = {
    createdState: "created",
    includeDateCreated: true,
    includeDateUpdated: true,
    includeStateHistory: true,
    includeComments: true,
    includeOwner: true,
    extraCreateArgs: {schemaVersion: "1"},
}

const historyComments: DocTypeOptional = {
    createdState: "created",
    includeDateCreated: true,
    includeDateUpdated: true,
    includeStateHistory: true,
    includeComments: true,
    extraCreateArgs: {schemaVersion: "1"},
}


const appDocuments: Documents = {
    [guidanceType]: {
        states: guidanceStates,
        ...historyComments,
        globalReadAccess: true,
        onCreate(mgr, ctx, type, doc) {
            doc.updatedBy = [{
                date: Date.now(),
                user: ctx.user,
            }];
            return doc;
        },
        onUpdate(mgr, ctx, ds, args) {
            const updatedBy: GuidanceUpdated = {
                date: Date.now(),
                user: ctx.user,
            }
            args["$push"].updatedBy = updatedBy;
            return args;
        },
        validate: validateGuidance,
    },
    [cdxgenType]: {
        states: cdxgenStates,
        createdState: "created",
        includeDateCreated: true,
        includeDateUpdated: true,
        extraCreateArgs: {schemaVersion: "1"},
        globalReadAccess: true,
        validate: validateCdxgen,
    },
    [depsdevType]: {
        states: depsdevStates,
        createdState: "created",
        includeDateCreated: true,
        includeDateUpdated: true,
        extraCreateArgs: {schemaVersion: "1"},
        globalReadAccess: true,
        validate: validateDepsdev,
    },
    [endoflifeType]: {
        states: endoflifeStates,
        ...historyComments,
        globalReadAccess: true,
        validate: validateEndoflife,
    },
}

var userProfileService: MyUserProfileService;

export class AppMgr extends Ods {
    public etl: ETL | undefined;
    public serverDocCollection: any;
    public notebookvarCollection: any;

    /**
     * Initialize the AppMgr instance.
     * @param simpleInit Optional flag for simple initialization.
     * @returns {Promise<AppMgr>} The initialized AppMgr instance.
     */
    public static async init(simpleInit?: boolean): Promise<AppMgr> {
        log.debug(`Initializing app manager`);
        const pm = new AppMgr();
        if (etlEnabled) {
            log.debug(`ETL Enabled`)
            pm.etl = ETL.getInstance(pm);
        }
        else {
            log.debug(`ETL Disabled`)
        }
        Ods.setInstance(pm);
        await pm.init(simpleInit);
        log.debug(`Finished initializing app manager`);

        return pm;
    }

    /**
     * Get the singleton instance of AppMgr.
     * @returns {AppMgr} The AppMgr instance.
     */
    public static getInstance(): AppMgr {
        return Ods.getInstance() as AppMgr;
    }

    constructor() {
        userProfileService = new MyUserProfileService();
        super({
            appName: dbApp,
            documents: appDocuments,
            adminGroups: [GROUP_ADMIN],
            email: adminEmail,
            userGroups: [
                { id: GROUP_ADMIN, deletable: false },
                { id: GROUP_EDITOR, deletable: false },
                { id: GROUP_TESTER, deletable: false },
            ],
            adminRole: GROUP_ADMIN,
            roles: [Role.Administrator, Role.Editor, Role.Employee],
            userProfileService: userProfileService,
            sandboxFunctions: path.join(__dirname, "adminSandboxFunctions.js"),
            etlConfig: {

                cronJob0Start: async function(ctx: UserContext, etl: ETL, cronJob: string, runAt: string) {

                    try {
                        await etl.writeLog(ctx,`Update cached database and process new or updated Cdxgen documents - Start`)
                        log.info(`Running event "Update cached database and process new or updated Cdxgen documents"`)
                        const cdxgenClient = new CdxgenClient(etl);
                        await cdxgenClient.refreshCache(ctx);
                        await cdxgenClient.updateData(ctx);
                        await etl.writeLog(ctx,`Update cached database and process new or updated Cdxgen documents - Done`)
                    } catch (e) {
                        log.info(`Error running event "Update cached database and process new or updated Cdxgen documents":` + e);
                        await etl.writeLog(ctx,`Update cached database and process new or updated Cdxgen documents - Error: ` + e)
                    }
                    etl.setStatus(STATUS.IDLE, "Cdxgen", "Done");

                    try {
                        await etl.writeLog(ctx,`Refresh DepsDev - Start`)
                        log.info(`Running event "Refresh DepsDev"`);
                        const depsDevClient = new DepsdevClient(etl);
                        await depsDevClient.refreshCache(ctx);
                        await etl.writeLog(ctx,`Refresh DepsDev - Done`)
                    } catch (e) {
                        log.info(`Error running event "Refresh DepsDev":` + e);
                        await etl.writeLog(ctx,`Refresh DepsDev - Error: ` + e)
                    }
                    etl.setStatus(STATUS.IDLE, "DepsDev", "Done");

                },

                cronJob0End: async function(ctx: UserContext, etl: ETL, cronJob: string, runAt: string) {
                },

                cronJob1Start: async function(ctx: UserContext, etl: ETL, cronJob: string, runAt: string) {

                    try {
                        await etl.writeLog(ctx,`Update guidance - Start`)
                        const guidanceProcessor = new GuidanceProcessor(etl);
                        await guidanceProcessor.process(ctx);
                        await etl.writeLog(ctx,`Update guidance - Done`)
                    } catch (e) {
                        log.info(`Error running event "Update guidance":` + e);
                        await etl.writeLog(ctx,`Update guidance - Error: ` + e)
                    }
                    etl.setStatus(STATUS.IDLE, "Guidance", "Done");

                },

                cronJob1End: async function(ctx: UserContext, etl: ETL, cronJob: string, runAt: string) {
                },

                cronJob2Start: async function(ctx: UserContext, etl: ETL, cronJob: string, runAt: string) {

                    try {
                        await etl.writeLog(ctx,`Refresh SBOMs with Endoflife - Start`)
                        log.info(`Running event "Refresh SBOMs with Endoflife"`)
                        const endoflifeClient = new EndoflifeClient(etl);
                        await endoflifeClient.refreshCache(ctx);
                        await etl.writeLog(ctx,`Refresh SBOMs with Endoflife - Done`)
                    } catch (e) {
                        log.info(`Error running event "Refresh SBOMs with Endoflife":` + e);
                        await etl.writeLog(ctx,`Refresh SBOMs with Endoflife - Error: ` + e)
                    }
                    etl.setStatus(STATUS.IDLE, "Endoflife", "Done");

                },

                cronJob2End: async function(ctx: UserContext, etl: ETL, cronJob: string, runAt: string) {
                },
            },
        });
    }

    /**
     * Log out the current user context.
     * @param ctx The user context.
     */
    public logout(ctx: UserContext) {
        userProfileService.logout(ctx);
    }

    /**
     * Called when initialization is completed.
     * Performs migration and cleanup tasks.
     */
    public async onInit() {
        log.debug("AppMgr onInit() called");
        await super.onInit();
        this.sendStartupEmail()

        // Update default projection for sbom documents
        this.documents[sbomType].defaultProjection = summaryProjection;

        if (true) {
            // Convert queries from store to query collection
            const queries = await this.getDocs(this.getAdminContext(), storeType, {key: "query"})
            const qc = await this.getDocCollection(queryType);
            log.debug(`Number of old queries found = ${queries?.length}`)
            let count = 0;
            for (const q of queries) {
                // console.log("convert query ", q);
                const value = q.value;
                for (const key of Object.keys(value)) {
                    q[key] = value[key]; 
                }
                delete q.value;
                delete q.key;
                const id = q.id;
                q._id = new ObjectId(id);
                delete q.id;
                const found = await qc.findOne({_id: new ObjectId(id)});
                if (!found) {
                    const result = await qc.insertOne(q);
                    log.debug(" -- Query insert result =", result);
                    count++;
                }
            }
            log.debug(`Number of queries that were converted = ${count}`)
        }

        // Drop tables
        if (process.env["DROP_TABLE"]) {
            if (dropDb == 0) {
                dropDb = 1;
                const table = process.env["DROP_TABLE"];
                const self = this;
                setTimeout( async function() {
                    try {
                        console.log(`------> DROPPING ${table} TABLE!!!`);
                        const pc = await self.getDocCollection(table);
                        await pc.drop();
                    } catch (e) {
                        console.log(`Error dropping ${table}: `, e);
                    }
                }, 10000);
            }
        }

        // Create sbomClient so database indexes will be created if necessary
        log.debug("Creating database indexes");
        try {

            const sc = await this.getDocCollection(sbomType);
            let scIndexes:any = await sc.getIndexes();
            console.log("scIndexes =", scIndexes);
            if (!scIndexes['metadata.component.name_1']) {
                await sc.createIndex({"metadata.component.name": 1});
            }
            if (!scIndexes['metadata.component.version_1']) {
                await sc.createIndex({"metadata.component.version": 1});
            }
            if (!scIndexes['metadata.component.group_1']) {
                await sc.createIndex({"metadata.component.group": 1});
            }
            if (!scIndexes['metadata.component.type_1']) {
                await sc.createIndex({"metadata.component.type": 1});
            }
            if (!scIndexes['metadata.component.purl_1']) {
                await sc.createIndex({"metadata.component.purl": 1});
            }
            if (!scIndexes['compositions.assemblies.name_1']) {
                await sc.createIndex({"compositions.assemblies.name": 1});
            }
            if (!scIndexes['compositions.assemblies.0.name_1']) {
                await sc.createIndex({"compositions.assemblies.0.name": 1});
            }
            if (!scIndexes['compositions.assemblies.purl_1']) {
                await sc.createIndex({"compositions.assemblies.purl": 1});
            }
            if (!scIndexes['compositions.assemblies.0.purl_1']) {
                await sc.createIndex({"compositions.assemblies.0.purl": 1});
            }
            scIndexes = await sc.getIndexes();
            console.log("scIndexes =", scIndexes);

            // Make sure depsdev collection has indexes
            const dc = await this.getDocCollection(depsdevType);
            let dcIndexes:any = await dc.getIndexes();
            if (!dcIndexes['purl_1']) {
                await dc.createIndex( {"package.purl": 1 })
            }
            dcIndexes = await dc.getIndexes();
            console.log("dcIndexes =", dcIndexes);

        }
        catch (e) {
            //console.log(e);
            console.log("Warning: Could not create database indexes")
        }

        // Add an Api key
        const r = await this.getDocs(this.getAdminContext(), apikeyType, {key: "admin-api-key"});
        if (!r || r.length == 0) {
            await this.createDoc(this.getAdminContext(), apikeyType, {
                key: "admin-api-key",
                role: Role.Administrator,
                app: "ODS Sample App",
                expirationDate: Date.now() + (60*60*24*365)*1000,
            });
        }
        log.debug("AppMgr onInit() finished");
    }

    /**
     * Send a startup email notification.
     */
    public async sendStartupEmail() {
        if (os.platform().toLowerCase().indexOf("darwin") == -1) {
            const email = "";
            const subject = "ODS App";
            const message = "ODS App has been started on " + baseUrl + ".";
            this.sendEmail({ user: { name: "", department: "", email: "", title: "", employeeNumber: "", id: "", roles: [] } }, email, subject, message, "", [], true);
        }
    }

    /**
     * Express middleware to allow cross-domain requests (CORS).
     * @param _req Express request object.
     * @param res Express response object.
     * @param next Next middleware function.
     */
    public allowCrossDomain(_req: express.Request, res: express.Response, next: express.NextFunction) {
        console.log("SURVEYOR allowCrossDomain()")
        let authRequest = false;
        if (_req.headers?.['access-control-request-headers']?.includes('authorization') || _req.headers?.authorization) {
            authRequest = true;
        }

        const originHeader = _req.headers?.origin || config.corsOrigin;
        res.header('Access-Control-Allow-Origin', originHeader);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
        res.header('Access-Control-Request-Headers', '*');
        if (authRequest) {
            res.header('Access-Control-Allow-Headers', 'authorization,content-type,ctx,no-auth-user');
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Expose-Headers', 'content-type,ctx,no-auth-user');
        }
        else {
            res.header('Access-Control-Allow-Headers', '*');
            res.header('Access-Control-Expose-Headers', '*');
        }

        next();
    }

    /**
     * Search SBOMs with various filters and options.
     * @param ctx User context.
     * @param searchText Text to search.
     * @param searchParam Additional search parameters.
     * @param searchType Types to search.
     * @param uses Usage filter.
     * @param vulnerabilities Whether to filter by vulnerabilities.
     * @param usesOrSearch Use OR logic for uses.
     * @param onlyVulnerabilities Only show vulnerabilities.
     * @param nonCompliance Filter for non-compliance.
     * @param stream Stream object for results.
     * @param response Express response object.
     * @returns {Promise<any[]>} Array of SBOMs or empty if streaming.
     */
    public async searchSboms(ctx: UserContext, 
        searchText: string, 
        searchParam?: any,
        searchType?: string[], 
        uses?: any,
        vulnerabilities?: boolean,
        usesOrSearch?: boolean,
        onlyVulnerabilities?: boolean,
        nonCompliance?: boolean,
        stream?: any,
        response?: any,
    ) {
        console.log("searchSboms()")
        const context = ctx;
        let text = searchText.trim();
        let regExpBegin = "^";
        if (searchText.startsWith("*")) {
            regExpBegin = ".*";
            text = text.substring(1);
        }
        let regExpEnd = "$";
        if (searchText.endsWith("*")) {
            regExpEnd = ".*";
            text = text.substring(0, text.length-1);
        }

        let match:any = {};
        if (searchType?.length && !usesOrSearch) {
            match = {
                        "$or": [
                            {
                                "metadata.component.type": {"$in": searchType}
                            },
                            {
                                "metadata.component.type": searchType.includes("ITComponent") ? "ITComponent" : "_dont_match_this_term_",
                            },
                            {
                               "metadata.component.type": searchType.includes("library") ? "library" : "_dont_match_this_term_",
                            },
                        ]
            };
        }
        if (uses) {
            if (uses.id) {
                match["compositions.assemblies.id"] = uses.id;
            }
            else {
                if (uses.purl) {
                    match["compositions.assemblies.purl"] = { $regex: "^" + uses.purl + (uses.version ? "@"+uses.version : "") + ".*"}
                }
                else if (uses.name && uses.version) {
                    match["compositions.assemblies"] = { $elemMatch: { name: uses.name, version: uses.version} }
                }
                else if (uses.name) {
                    match[ "compositions.assemblies.name"] = uses.name;
                }
            }
        }    
        if (searchParam) {
            if (searchParam.id) {
                match["id"] = searchParam.id;
            }
            else {
                if (searchParam.purl) {
                    match["metadata.component.bom-ref.purl"] = { $regex: "^" + searchParam.purl + (searchParam.version ? "@"+searchParam.version : "") + ".*"}
                }
                else {
                    if (searchParam.version) {
                        match["metadata.component.version"] = searchParam.version;
                    }
                    if (searchParam.name) {
                        match[ "metadata.component.name"] = searchParam.name;
                    }
                }
            }
        }    
        if (vulnerabilities) {
            match["vulnerabilities.0"] = { "$exists": true }
        }
        if (onlyVulnerabilities) {
            if (uses.name) {
                match["vulnerabilities.affects.ref.name"] = uses.name;
            }
        }
        if (text) {
            match["metadata.component.name"] = { "$regex": regExpBegin + text + regExpEnd, "$options": "i" };
        }


        const params = {
            params: {
                match: {
                    aggregate: [
                        { $match: match },
                        {
                            $lookup:
                              {
                                from: (dbApp) + ".guidance.doc",
                                let: { name: "$metadata.component.name", purl: "$metadata.component.purl" },
                                pipeline: [

                                    // Narrow down guidance docs to consider (10 sec for all)
                                    {
                                        $match: {
                                            "state": "active",
                                            $expr: {
                                                $eq: ["$item.name", (uses ? uses.name : "$$name")]
                                            }
                                        },
                                    },

                                    // Only select guidance doc that matches basePurl (adds 2 sec for all)
                                    {
                                        $match: {
                                            $expr: {
                                                ...(!uses && {
                                                    $gt: [ { $indexOfBytes: ["$$purl", "$item.basePurl"] } , -1]
                                                }),
                                            },
                                        }
                                    }

                                ],
                                as: "guidance",
                              }
                         },

                         { $addFields: {

                            // This adds minimal time - maybe about 0.05 sec to query
                            _guidance: {
                                $function: {
                                  body: 
`function(guidance) {
    if (Array.isArray(guidance) && guidance.length > 0) {
        const g = guidance[0];
        return {nonPci: g.nonPci, pci: g.pci, id: ""+g._id, basePurl: g.item.basePurl, name: g.item.name}
    }
}`,
                                  args: [ "$guidance" ],
                                  lang: "js"
                                }
                              },

                            ...(uses && {
                                    _uses: {
                                        $function: {
                                            body: 
`function(compositions, guidance) {
    if (!guidance || guidance.length == 0) {
        const usesPurl = "${uses.purl || ''}";
        const usesName = "${uses.name || ''}";

        if (compositions) {
            for (const v of compositions) {
                if (v && v.assemblies) {
                    const usesList = [];
                    for (const a of v.assemblies) {
                        if (usesPurl) {
                            if (a.purl == usesPurl) {
                                usesList.push(a);
                            }
                        }
                        else if (usesName) {
                            if (a.name == usesName) {
                                usesList.push(a);
                            }
                        }
                    }
                    if (usesList.length > 0) {
                        return usesList;
                    }
                }
            }
        }
        return;
    }
    const g = guidance[0];
    const usesPurl = "${uses.purl || ''}";
    const usesName = "${uses.name || ''}";

    if (compositions) {
        for (const v of compositions) {
            if (v && v.assemblies) {
                const usesList = [];
                for (const a of v.assemblies) {
                    if (usesPurl) {
                        if (a.purl == usesPurl) {
                            usesList.push(a);
                        }
                    }
                    else if (a.purl && a.purl.startsWith(g.item.basePurl+"@")) {
                        usesList.push(a);
                    }
                    else if (a.purl && a.purl.startsWith("pkg:a-name/" + usesName + "@")) {
                        usesList.push(a);
                    }
                }
                if (usesList.length > 0) {
                    return usesList;
                }
            }
        }
    }
}`,
                                            args: [ "$compositions", "$guidance" ],
                                            lang: "js"
                                        }
                                    }
                                })
                         }},
                        { $addFields: {
                                _compositions: {
                                    $function: {
                                        body: 
`function(compositions) {
    if (compositions && compositions[0].assemblies) {
        let c = 0;
        for (const v of compositions[0].assemblies) {
            c++;
        }
        return c;
    }
    return 0;
    }`,
                                        args: [ "$compositions" ],
                                        lang: "js"
                                    }
                                },
                            }},

                        {
                            $addFields: {
                                _vulnerabilities: {
                                    $function: {
                                        body: "function(vulnerabilities) { if (vulnerabilities) return vulnerabilities.length }",
                                        args: ["$vulnerabilities"],
                                        lang: "js"
                                    }
                                }
                            }
                        },
                            
                         // If uses, then only keep those that have _uses
                         {
                            $match: {
                                ...(uses && {
                                    _uses: {$exists: true, $ne: null}
                                })
                            }
                        },

                         // If nonCompliance, then only keep those with _compliance = no
                         {
                            $match: {
                                ...(nonCompliance && {
                                    _compliance: "no"
                                })
                            }
                         },

                         {
                           $project: { ...summaryProjection, _uses:1, _guidance:1, _compliance:1 }
                         },
                    ]
                }
            }
        }

        console.log("aggregate: ", JSON.stringify(params.params.match.aggregate, null, 4));
        const start = Date.now();
        const pc = await this.getDocCollection(sbomType);
        const _docs = await pc.aggregate(params.params.match.aggregate, { enableUtf8Validation: this.enableUtf8Validation, allowDiskUse: true });
        log.debug(`Time for ${sbomType} aggregate query = ${((Date.now() - start)/1000)} seconds`);
        const start2 = Date.now();
        if (stream && response) {
            const count = await this.streamAggregateResults(sbomType, _docs, stream, response, false);
            log.debug(`Time to send ${sbomType} aggregate results = ${((Date.now() - start2)/1000)} seconds`);
            log.debug(`${sbomType} aggregate results length = ${count}`);
            return [];
        }
        // Need to test this
        else {
            const docs = await _docs.toArray();
            log.debug(`Time for ${sbomType} query toArray = ${((Date.now() - start2)/1000)} seconds`);
            log.debug(`${sbomType} aggregate results length = ${docs.length}`);

            // If aggregate, then update id as appropriate and return the data
            // NOTE: There isn't any ACl check done for aggregates
            //       This is fine for those queries that do aggregate since we don't really need to enforce read ACLs for sbom, guidance, store, depsdev
            const rtn: any = [];
            for (let doc of docs) {
                const sId = JSON.stringify(doc._id);
                if (sId.charAt(0) == '"') {
                    doc = this.toInfo(doc, false);
                    delete doc._id;
                }
                rtn.push(doc);
            }
            return rtn;    
        }
    }

    /**
     * Get all versions for a software package.  
     * Note that this only returns versions that are used by other SBOMS.  Not all versions in database.
     * 
     * @param idOrName The id or name of software package
     * @returns {id:bomRef, count:number of sboms that use this sbom}
     */
    public async getVersions(idOrName: any): Promise<GetVersions[]> {
        log.debug(`getVersions(${idOrName})`);
        const pc = await this.getDocCollection(sbomType);
        const start = Date.now();

        if (idOrName) {
            console.log("Get versions for library " + idOrName)

            const r = await pc.aggregate([
                {
                    $project: {compositions:1, metadata:1, id:1, "_depsdev":1} //@TODO: This isn't returning _depsdev data - WHY?
                },
                {
                    $unwind: "$compositions",
                },
                {
                    $unwind: "$compositions.assemblies",
                },

                {
                    $addFields: {
                        basePurl: {
                            $substrBytes: [
                                "$compositions.assemblies.purl", 0, {
                                    $max: [0, 
                                        {"$indexOfBytes": ["$compositions.assemblies.purl", "@"]}
                                    ]
                                }
                            ]
                        },
                        scorecard: "$_depsdev.scorecard.overallScore",
                    }
                },

                {
                    $match: {
                        "compositions.assemblies.purl": { $regex: "^" + idOrName + "@.*", $options: "i" },
                    }
                },

                {
                    $group: {
                        _id: {
                            name: "$compositions.assemblies.name",
                            version: "$compositions.assemblies.version",
                            group: "$compositions.assemblies.group",
                            basePurl: "$basePurl",
                            scorecard: "$scorecard",
                        },
                        count: { $sum: 1 }
                    }
                },

                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 1000
                }
            ], { enableUtf8Validation: enableUtf8Validation, allowDiskUse: true }).toArray();
            log.debug(`Time to query getVersions = ${(Date.now()-start)/1000}`);
            log.debug("libraries length =", r.length);

            const rtn: any = [];
            if (r && r.length > 0) {

                const pcdd = await this.getDocCollection(depsdevType);
                const p = {"package.purl":1, "package.versions.isDeprecated":1, "package.versions.isDefault":1, "package.versions.publishedAt":1, "project.scorecard.overallScore": 1, "project.scorecard.checks.name":1, "project.scorecard.checks.score":1, "project.scorecard.checks.reason":1};
                const q = [];
                for (const doc of r) {
                    q.push({"package.purl": doc._id.basePurl + "@" + doc._id.version});
                }
                const depsdev = await pcdd.find({$or: q}, { projection: p, enableUtf8Validation: enableUtf8Validation, allowDiskUse: true }).toArray();
                console.log("depsdev=", JSON.stringify(depsdev,null,4));
                const scorecard:any = {};
                if (depsdev && depsdev.length > 0) {
                    for (const doc of depsdev) {
                        const _scorecard:any = {
                            overallScore: doc.project?.scorecard?.overallScore,
                        };
                        const checks = doc.project?.scorecard?.checks;
                        _scorecard.isArchived = null;
                        if (checks) {
                            for (const check of checks) {
                                _scorecard[check.name] = check.score;
                                if (check.name == "Maintained") {
                                    _scorecard.isArchived = check.reason.includes("archived");
                                }
                            }
                        } 
                        _scorecard.isDeprecated = false;
                        _scorecard.publishedAt = null;
                        const v = doc.package.versions?.[0];
                        if (v?.isDeprecated) {
                            _scorecard.isDeprecated = v.isDeprecated;
                        }
                        if (v?.publishedAt) {
                            _scorecard.publishedAt = new Date(v.publishedAt).getTime();
                        }
                        scorecard[doc.package.purl] = _scorecard;
                    }
                }

                for (const doc of r) {
                    const q = doc._id.basePurl + "@" + doc._id.version;
                    rtn.push({name: doc._id.name, version: doc._id.version, group: doc._id.group, basePurl: doc._id.basePurl, count: doc.count, scorecard: scorecard[q]})
                }
            }
            return rtn;
        }
        return [];
    }

    /**
     * Get the top 1000 most used SBOMs that are used by other SBOMs.
     * 
     * @param directDependency true=Only include SBOM if it is a direct dependency of an SBOM.
     * @returns 
     */
    public async getMostUsed(directDependency: boolean): Promise<MostUsed[]> {
        log.debug(`getMostUsed(${directDependency})`);

        let guidances:any = [];
        try {
            const pcg = await this.getDocCollection(guidanceType);
            const _guidances = await pcg.find({  }, { projection: { item:1, pci:1, nonPci:1, state:1 }, enableUtf8Validation: enableUtf8Validation, allowDiskUse: true }).toArray();
            for (const guidance of _guidances) {
                guidances[guidance.item.basePurl] = guidance
            }
        } catch (e) {
        }

        const pc = await this.getDocCollection(sbomType);

        if (directDependency) {
            log.debug("Start query")
            // @TODO: This assumes top level dependencies is the first element of dependencies array.
            //        This appears to be the case but we need to ensure this is true.
            const r: any = await pc.aggregate([
                {
                    $addFields: { firstDependency: { $first:"$dependencies"}}
                },
                { 
                    $match: {
                        "dependencies.ref.name": { $exists: true }
                    }
                },
                {
                    $project: {id:1, firstDependency:1, "metadata.component.name":1, "_depsdev.scorecard":1}
                },
            ], {enableUtf8Validation: enableUtf8Validation, allowDiskUse: true }).toArray();

            log.debug("Done with query - r.length=", r.length)
            log.debug("Done with query - r[0]=", JSON.stringify(r[0],null,4))

            const deps: any = {};
            const _ids: any = {};
            for (const value of r) {
                const dependencies = [value.firstDependency];
                if (dependencies) {
                    for (const d of dependencies) {
                        if (value.metadata.component.name == d.ref.name) {
                        if (d.dependsOn) {
                                for (const n of d.dependsOn) {
                                    let basePurl = n.purl;
                                    const i = n.purl.indexOf("@")
                                    if (i > 0) {
                                        basePurl = n.purl.substring(0, i);
                                    }
                                    deps[basePurl] = (deps[basePurl] || 0) + 1
                                    _ids[basePurl] = n;
                                }
                            }
                        }
                    }
                }
            }
            log.debug("Done with getting deps")
            const res = []
            const pcdd = await this.getDocCollection(depsdevType);
            const p = {"package.purl":1, "package.versions.isDeprecated":1, "package.versions.isDefault":1, "package.versions.publishedAt":1, "project.scorecard.overallScore": 1, "project.scorecard.checks.name":1, "project.scorecard.checks.score":1, "project.scorecard.checks.reason":1};
            const q = [];
            for (const basePurl of Object.keys(deps)) {
                q.push({"package.purl": basePurl});
            }
            const depsdev = await pcdd.find({$or: q}, { projection: p, enableUtf8Validation: enableUtf8Validation, allowDiskUse: true }).toArray();
            const scorecard:any = {};
            if (depsdev && depsdev.length > 0) {
                for (const doc of depsdev) {
                    const _scorecard:any = {
                        overallScore: doc.project?.scorecard?.overallScore,
                    };
                    const checks = doc.project?.scorecard?.checks;
                    _scorecard.isArchived = null;
                    if (checks) {
                        for (const check of checks) {
                            _scorecard[check.name] = check.score;
                            if (check.name == "Maintained") {
                                _scorecard.isArchived = check.reason.includes("archived");
                            }
                        }
                    }
                    // Look for default version & check if deprecated
                    _scorecard.isDeprecated = null;
                    _scorecard.publishedAt = null;
                    if (doc.package.versions && doc.package.versions.length > 0) {
                        for (const v of doc.package.versions) {
                            if (v.isDefault) {
                                _scorecard.isDeprecated = v.isDeprecated;
                                if (v.publishedAt) {
                                    _scorecard.publishedAt = new Date(v.publishedAt).getTime();
                                }
                                break;
                            }
                        }
                    }
                    scorecard[doc.package.purl] = _scorecard;
                }
            }

            for (const basePurl of Object.keys(deps)) {
                res.push({ 
                    name: _ids[basePurl].name, 
                    group: _ids[basePurl].group, 
                    basePurl: basePurl, 
                    count: deps[basePurl], 
                    scorecard: scorecard[basePurl], 
                    guidance: guidances[basePurl],
                })
            }
            const sorted = res.sort((o1:any, o2:any) => {
                return (o2.count - o1.count);
            });
            log.debug("Done with converting to array")
            console.log("lib1=", JSON.stringify(sorted[0], null, 4));
            console.log("lib2=", JSON.stringify(sorted[1], null, 4));
            return sorted;
        }

        // This gets top 1000 SBOMs used (regardless of version or where they are in the depdency tree)
        else {
            const r: any = await pc.aggregate([
                {
                    $unwind: "$components",
                },
                {
                    $addFields: {
                        purl: {
                            $substrBytes: [
                                "$components.purl", 0, {
                                    $max: [0, 
                                        {"$indexOfBytes": ["$components.purl", "@"]}
                                    ]
                                }
                            ]
                        }
                    }
                },
                {   $match: {
                    purl: {$ne: ""}
                }},
                {
                    $group: {
                        // _id: "$purl",
                        _id: {
                            name: "$components.name",
                            group: "$components.group",
                            basePurl: "$purl",
                        },
                        count: { $sum: 1 },
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 1000
                }
            ], { enableUtf8Validation: enableUtf8Validation, allowDiskUse: true }).toArray();
            log.debug("libraries[0] =", r[0]);
            log.debug("number of libraries returned =", r.length);
            const res = []

            const pcdd = await this.getDocCollection(depsdevType);
            const p = {"package.purl":1, "package.versions.isDeprecated":1, "package.versions.isDefault":1, "package.versions.publishedAt":1, "project.scorecard.overallScore": 1, "project.scorecard.checks.name":1, "project.scorecard.checks.score":1, "project.scorecard.checks.reason":1};
            const q = [];
            for (const _r of r) {
                q.push({"package.purl": _r._id.basePurl});
            }
            const depsdev = await pcdd.find({$or: q}, { projection: p, enableUtf8Validation: enableUtf8Validation, allowDiskUse: true }).toArray();
            const scorecard:any = {};
            if (depsdev && depsdev.length > 0) {
                for (const doc of depsdev) {
                    const _scorecard:any = {
                        overallScore: doc.project?.scorecard?.overallScore,
                    };
                    const checks = doc.project?.scorecard?.checks;
                    _scorecard.isArchived = null;
                    if (checks) {
                        for (const check of checks) {
                            _scorecard[check.name] = check.score;
                            if (check.name == "Maintained") {
                                _scorecard.isArchived = check.reason.includes("archived");
                            }
                        }
                    } 
                    // Look for default version & check if deprecated
                    _scorecard.isDeprecated = null;
                    _scorecard.publishedAt = null;
                    if (doc.package.versions && doc.package.versions.length > 0) {
                        for (const v of doc.package.versions) {
                            if (v.isDefault) {
                                _scorecard.isDeprecated = v.isDeprecated;
                                if (v.publishedAt) {
                                    _scorecard.publishedAt = new Date(v.publishedAt).getTime();
                                }
                                break;
                            }
                        }
                    }
                    scorecard[doc.package.purl] = _scorecard;
                }
            }

            for (const _r of r) {
                const basePurl = _r._id.basePurl;
                res.push({ name: _r._id.name, group: _r._id.group, basePurl: basePurl, count: _r.count, scorecard: scorecard[basePurl], guidance: guidances[basePurl]})
            }
            return res;
        }
    }

    /**
     * Get analysis for all top-level open source software used by product.
     * 
     * @param sbomId The id of the sbom
     * @returns 
     */
    public async getOssAnalysis(sbomId: string): Promise<OssAnalysis[]> {
        log.debug(`getOssAnalysis(${sbomId})`);

        let guidances:any = [];
        try {
            const pcg = await this.getDocCollection(guidanceType);
            const _guidances = await pcg.find({  }, { projection: { item:1, pci:1, nonPci:1, state:1 }, enableUtf8Validation: enableUtf8Validation, allowDiskUse: true }).toArray();
            for (const guidance of _guidances) {
                guidances[guidance.item.basePurl] = guidance
            }
        } catch (e) {
        }

        const pc = await this.getDocCollection(sbomType);

        if (true) {
            log.debug("Start query")
            const r: any = await pc.aggregate([
                {
                    $match: {
                        id: sbomId,
                    }
                },
                {
                    $addFields: { firstDependency: { $first:"$dependencies"}}
                },
                { 
                    $match: {
                        "dependencies.ref.name": { $exists: true }
                    }
                },
                {
                    $project: {id:1, firstDependency:1, "metadata.component.name":1, "_depsdev.scorecard":1}
                },
            ], {enableUtf8Validation: enableUtf8Validation, allowDiskUse: true }).toArray();

            log.debug("Done with query - r.length=", r.length)
            log.debug("Done with query - r[0]=", JSON.stringify(r[0],null,4))

            const deps: any = {};
            const _ids: any = {};
            if (r && r.length > 0 && r[0].firstDependency) {
                const value = r[0];
                const dependencies = [value.firstDependency];
                if (dependencies) {
                    for (const d of dependencies) {
                        if (value.metadata.component.name == d.ref.name) {
                        if (d.dependsOn) {
                                for (const n of d.dependsOn) {
                                    let basePurl = n.purl;
                                    console.log(">>> looking at n.purl =", basePurl);
                                    const i = n.purl.indexOf("@")
                                    if (i > 0) {
                                        basePurl = n.purl.substring(0, i);
                                    }
                                    deps[basePurl] = (deps[basePurl] || 0) + 1
                                    _ids[basePurl] = n;
                                }
                            }
                        }
                    }
                }
            }
            if (Object.keys(deps).length == 0) {
                return [];
            }

            log.debug("Done with getting deps =", deps)
            const res = []
            const pcdd = await this.getDocCollection(depsdevType);
            const p = {};
            const q = [];
            for (const basePurl of Object.keys(deps)) {
                q.push({"package.purl": basePurl});
            }
            const depsdev = await pcdd.find({$or: q}, { projection: p, enableUtf8Validation: enableUtf8Validation, allowDiskUse: true }).toArray();
            console.log("depsdev=", JSON.stringify(depsdev[0],null,4));
            const depsdevInfo:any = {};
            if (depsdev && depsdev.length > 0) {
                for (const doc of depsdev) {
                    const key = doc.package.purl;
                    depsdevInfo[key] = {};

                    depsdevInfo[key].packageKey = doc.package?.packageKey;
                    if (doc.package?.versions) {
                        for (const v of doc.package?.versions) {
                            if (v.isDefault) {
                                depsdevInfo[key].latestVersion = v.versionKey.version;
                            }
                        }
                    }
                    const _scorecard:any = {
                        overallScore: doc.project?.scorecard?.overallScore,
                    };
                    const checks = doc.project?.scorecard?.checks;
                    _scorecard.isArchived = null;
                    if (checks) {
                        for (const check of checks) {
                            _scorecard[check.name] = {score: check.score, reason: check.reason};
                            if (check.name == "Maintained") {
                                _scorecard.isArchived = check.reason.includes("archived");
                            }
                        }
                    } 
                    // Look for latest version  & check if deprecated
                    _scorecard.isDeprecated = null
                    _scorecard.publishedAt = null;
                    if (doc.package.versions && doc.package.versions.length > 0) {
                        for (const v of doc.package.versions) {
                            if (v.isDefault) {
                                _scorecard.isDeprecated = v.isDeprecated;
                                if (v.publishedAt) {
                                    _scorecard.publishedAt = new Date(v.publishedAt).getTime();
                                }
                                break;
                            }
                        }
                    }
                    depsdevInfo[doc.package.purl].scorecard = _scorecard;
                    if (doc.version?.links) {
                        depsdevInfo[doc.package.purl].links = doc.version.links;
                    }
                    _scorecard.doc = doc
                }
            }

            for (const basePurl of Object.keys(deps)) {
                res.push({ 
                    name: _ids[basePurl]?.name, 
                    version: _ids[basePurl]?.version, 
                    purl: _ids[basePurl]?.purl,
                    basePurl: basePurl,
                    latestVersion: depsdevInfo[basePurl]?.latestVersion,
                    scorecard: depsdevInfo[basePurl]?.scorecard, 
                    guidance: guidances[basePurl],
                    links: depsdevInfo[basePurl]?.links,
                    packageKey: depsdevInfo[basePurl]?.packageKey,
                })
            }
            const sorted = res.sort((o1:any, o2:any) => {
                return (o2.count - o1.count);
            });
            log.debug("Done with converting to array")
            console.log("oss1=", JSON.stringify(sorted[0], null, 4));
            console.log("oss2=", JSON.stringify(sorted[1], null, 4));
            return sorted;
        }

    }

    cache1:any = {};

    protected async getDepsDevForPurl(purl: string, basePurl: string) {
        if (this.cache1[purl]) {
            return this.cache1[purl]
        }
        const ddpc = await this.getDocCollection(depsdevType);

        const r = await ddpc.find({"package.purl": {$regex: ".*"+basePurl+".*", $options: "i"}}, {projection: {package:1, project:1}}).toArray();
        for (const d of r) {
            this.cache1[d.package.purl] = d;
        }
        return this.cache1[purl];
    }

    cache2:any = {};

    /**
     * Get all software applications that use a library
     * 
     * @param library The library to look for
     */
    public async getSoftwareThatUsesLibrary(ctx: UserContext, library: UsesLibrary, stream: string, response: any) : Promise<any> {
        const pc = await this.getDocCollection(sbomType);
        const ddpc = await this.getDocCollection(depsdevType);
        console.log(`getSoftwareThatUsesLibrary(${JSON.stringify(library)}, stream=${stream})`)

        let libraryName = library.name;
        if (libraryName) {
            let regExpBegin = "^";
            if (libraryName.startsWith("*")) {
                regExpBegin = ".*";
                libraryName = libraryName.substring(1);
            }
            let regExpEnd = "$";
            if (libraryName.endsWith("*")) {
                regExpEnd = ".*";
                libraryName = libraryName.substring(0, libraryName.length-1);
            }
            libraryName = regExpBegin + libraryName + regExpEnd;
        }
        console.log("libraryName =", libraryName);

        let libraryVersion = library.version;
        if (libraryVersion) {
            let regExpBegin = "^";
            if (libraryVersion.startsWith("*")) {
                regExpBegin = ".*";
                libraryVersion = libraryVersion.substring(1);
            }
            let regExpEnd = "$";
            if (libraryVersion.endsWith("*")) {
                regExpEnd = ".*";
                libraryVersion = libraryVersion.substring(0, libraryVersion.length-1);
            }
            libraryVersion = regExpBegin + libraryVersion + regExpEnd;
        }
        console.log("libraryVersion =", libraryVersion);

        const match:any = {
            "compositions.assemblies.purl": {$ne: null}
        };
        if (library.id) {
            match["compositions.assemblies.id"] = library.id;
        }
        else if (library.purl) {
            match["compositions.assemblies.purl"] = { $regex: "^" + library.purl + (library.version ? "@"+library.version : "") + ".*"}
        }
        else if (library.name && library.version) {
            match[ "compositions.assemblies.name"] = {$regex: libraryName, $options:"i"};
            match["compositions.assemblies.version"] = {$regex: libraryVersion, $options:"i"}
        }
        else if (library.name) {
            match[ "compositions.assemblies.name"] = {$regex: libraryName, $options:"i"};
        }
        console.log("match =", JSON.stringify(match,null,4));
        const query = [

            // Make a document for each assembly
            { $unwind: "$compositions"},
            { $unwind: "$compositions.assemblies"},

            // Get only those assemblies that match library name
            { $match: match},

            { $sort: {"compositions.assemblies.name": 1}},

            // Return library
            {
                $project: { 
                    library: "$compositions.assemblies", 
                    purl:1, 
                    basePurl:1, 
                    compositions: 1,
                    usedby: {
                        "metadata.component.type": "$metadata.component.type",
                        "metadata.component.bom-ref": "$metadata.component.bom-ref",
                        id: "$id"
                    } 
                }
            },
        ]
        if (stream && response) {
            response.write(("").padStart(16, "0"))
            log.debug("---> initial response sent")
        }
        const cursor = pc.aggregate(query, { enableUtf8Validation: enableUtf8Validation, allowDiskUse: true });

        const self = this;
        async function processDoc (doc: any) {

            const c = doc.compositions.assemblies;
            const regexName = new RegExp(""+libraryName, "i")
            if (c && c.name && c.purl) {
                if (c.name.match(regexName)) {
                    let basePurl = c.purl;
                    const i = c.purl.indexOf("@")
                    if (i > 0) {
                        basePurl = c.purl.substring(0, i);
                    }
                    doc.basePurl = basePurl;

                    let purl = c.purl;
                    const j = c.purl.indexOf("?")
                    if (j > 0) {
                        purl = c.purl.substring(0, j);
                    }
                    doc.purl = purl;
                }
            }
            else {
                doc.basePurl = "NO_PURL";
                doc.purl = "NO_PURL";

            }

            const depsdev = await self.getDepsDevForPurl(doc.purl, doc.basePurl);
            if (depsdev?.project?.scorecard?.overallScore) {
                const scorecard:any = {overallScore: depsdev.project.scorecard.overallScore};
                const checks = [];
                for (const check of depsdev.project.scorecard.checks) {
                    checks.push({name: check.name, score: check.score});
                }
                scorecard.checks = checks;
                doc.depsdev = [{project: {scorecard: scorecard}}];
            }
            else {
                doc.depsdev = [];
            }

            //AKRTODO: doc.compliant originally relied on guidance
            doc.compliant = true;

            return doc;
        }

        if (stream && response) {
            return await this.streamAggregateResults(null, cursor, stream, response, false, processDoc);
        }
        console.log("Returning non-streaming array")

        let count = 0;
        const start = Date.now();
        const r = [];
        console.log("cursor=", await cursor.hasNext());
        while (await cursor.hasNext()) {
            console.log("getting next doc...")
            if (count % 100 == 0) {
                log.debug(`Time to process  document ${count}= ${((Date.now() - start)/1000)} seconds`);
            }
            let doc = await cursor.next();
            if (doc) {
                let doc2 = await processDoc(doc);
                const sId = JSON.stringify(doc2._id);
                if (sId?.charAt(0) == '"') {
                    doc2 = this.toInfo(doc2, false);
                    // delete doc?._id;
                }
                if (count == 0) {
                    console.log("doc2=", doc2);
                }
                r.push(doc2);
            }
            count++;
        }
        return r;
    }


    /**
     * Override send emails if EMAIL_ENABLED=false to save locally for debugging if necessary
     * 
     * @param ctx 
     * @param toEmail 
     * @param subject 
     * @param message 
     * @param fromEmail 
     * @param attachments 
     * @param force 
     * @returns 
     */
    public async sendEmail(
        ctx: UserContext,
        toEmail: string,
        subject: string,
        message: string,
        fromEmail: string = '',
        attachments: EmailAttachment[] = [],
        force: boolean = false
    ) {
        const from = fromEmail || adminEmail;
        if (!emailEnabled && !force) {
            log.info(
                `Email notification is disabled.  Not sending notification email to ${toEmail}: subject=${subject}, message=${message}, from=${from}`
            );

            var dir = "./tmp/email/" + toEmail;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {recursive: true});
            }

            // Save email file as "timestamp.html"
            fs.writeFileSync(dir + "/" + Date.now() + "_" + Math.round(Math.random()*1000) + ".html", 
`
<div><b>Recipient:</b> ${toEmail}</div>
<div><b>From:</b> ${fromEmail}</div>
<div><b>Subject:</b> ${subject}</div>
<div>${message}</div>
`
            )

            return;
        }
        if (emailDebug) {
            log.info(`Email debug is set.  Sending emails to ${emailDebug}`)
            for (const emailAddr of emailDebug.split(",")) {
                const _toEmail = emailAddr.trim();
                if (_toEmail) {
                    super.sendEmail(ctx, _toEmail, subject, "<div><b>Email debug: Original recipient is " + toEmail+ "</b></div><br/> " + message, fromEmail, attachments, force);
                }
            }
        }
        else {
            //@TODO: Uncomment to send to actual users
            // super.sendEmail(ctx, toEmail, subject, message, fromEmail, attachments, force);
        }
    }

}

const vulnerabilitiesCache: any = {};

