/**
 * Copyright (c) 2025 Capital One
*/

import { Logger, UserContext } from "ods-framework";
import { Ods, ETL } from "ods-framework";
import axios from "axios";
import { SbomClient } from "../bom";
import { STATUS } from "ods-framework";
import { CacheUpdateDataClient, sbomType } from "ods-framework";
import { AppMgr } from "../../appMgr";
import { CdxgenCreate, CdxgenSummary, cdxgenType } from "../../common";
import { SbomCdxgenStub } from "../bom/SbomClient";
const cdxgenConfig = require('../../../cdxgenConfig.json');
const log = new Logger("CdxgenClient");

const cdxgenUrl = process.env.CDXGEN_SERVER || 'http://localhost:9090';
const cdxgenReqConfig = () => {
    return {
        headers: {
            "Content-Type": "application/json"
        },
    }
}

/**
 * CdxgenClient class for interacting with the Cdxgen API
 */

export class CdxgenClient implements CacheUpdateDataClient {
    etl: ETL;
    mgr: Ods;
    appMgr: AppMgr;
    sbomClient: SbomClient;

    constructor(etl: ETL) {
        this.etl = etl;
        this.mgr = etl.mgr;
        this.appMgr = AppMgr.getInstance();
        this.sbomClient = new SbomClient(etl);
    }

    /**
     * Get list of GitHub repos for Cdxgen to process
     * 
     * @returns Array of CdxgenSummary
     */
    getCdxgenInfo = (ctx: UserContext): CdxgenSummary[] => {
        const gitHubInfo = cdxgenConfig?.gitHubSBOMSources;
        if (!gitHubInfo) return [];
        return gitHubInfo;
    }

    /**
     * Get all cached Cdxgen documents and return only fields specified in keys
     * @param keys
     */
    getCdxgenDocs = async (ctx: UserContext, match: any, keys?: string[]) => {
        log.debug(`getCdxgenDocs(${JSON.stringify(match)}, ${keys?.join(", ")})`)
        let projection: any = {};
        if (keys) {
            projection = {};
            for (const key of keys) {
                projection[key] = 1;
            }
        }
        try {
            const data = await this.mgr.getDocs(ctx, cdxgenType, match, {projection: projection});
            return data;
        } catch (e) {
            console.log("e=", e);
        }
    }

    /**
     * Get cached cdxgen id and Date for all Cdxgen documents.
     * This is used to update our cached Cdxgen database in Surveyor.
     *
     * @returns {Promise<CdxgenSummary[]>}
     */
    getAllCdxgenDocs = async (ctx: UserContext): Promise<CdxgenSummary[]> => {
        log.debug(`getAllCdxgenDocs()`)
        try {
            let params: any = {
                match: {},
                projection: {}
            };
            const data = await this.mgr.getDocs(ctx, cdxgenType, params.match, {projection: params.projection});
            return data as CdxgenSummary[];
        } catch (e) {
            console.log("e=", e);
        }
        return [];
    }

     /**
     * Create Cdxgen document in ODS cached database.
     *
     * @param {any} item - The Cdxgen document
     * @returns {Promise<any>} Cdxgen object or null
     */
    createCdxgen = async (ctx: UserContext, item: CdxgenCreate) => {
        log.debug(`CdxgenClient.createCdxgen(${item.url})`)
        try {
            const data = await this.mgr.createDoc(ctx, cdxgenType, item);
            if (data) {
                return data;
            }
        } catch (e) {
            log.debug("Failed to create Cdxgen document: ", e);
        }
        log.debug("Error trying to create Cdxgen document")
        return null;
    }

    /**
     * Update the ODS cached Cdxgen document.
     *
     * @param {any} item - The Cdxgen object
     * @param {string} id - The Cdxgen id to update
     * @returns {Promise<boolean>}
     */
    rawUpdateCdxgen = async (args: any, id: string) => {
        const pc = await this.mgr.getDocCollection(cdxgenType);
        await pc.updateOne(this.mgr.idFilter(id), this.mgr.toMongoUpdate(args));
        return true;
    }

    /**
     * Update the ODS cached Cdxgen document.
     * This will create the Cdxgen document if it doesn't exist.
     *
     * @param {any} item - The Cdxgen object
     * @param {string} id - The Cdxgen id to update
     * @returns {Promise<any>}
     */
    updateCdxgen = async (ctx: UserContext, item: any, id?: string) => {
        if (!id) {
            id = item.id;
        }
        log.debug(`CdxgenClient.updateCdxgen(${id})`);
        if (!id) {
            const r = await this.createCdxgen(ctx, item);
            return r;
        }
        const _item = { ...item }
        // Remove all keys that aren't allowed to be updated as specified by CdxgenUpdate interface
        delete _item.dateCreated;
        delete _item.dateUpdated;
        delete _item.stateHistory;
        delete _item.comments;
        delete _item.curStateRead;
        delete _item.curStateWrite;

        try {
            const data = await this.mgr.updateDoc(ctx, { type: cdxgenType, id: id }, _item);
            if (data) {
                return data;
            }
            else {
                return await this.createCdxgen(ctx, item);
            }
        } catch (e) {
            log.debug("Failed to update Cdxgen document: ", e);
        }
        log.debug("Error trying to update Cdxgen document - just returning original object")
        return _item;
    }

    /**
     * Delete document from ODS cached Cdxgen document.
     *
     * @param id
     */
    deleteCdxgen = async (ctx: UserContext, id: string) => {
        try {
            const r = await this.mgr.deleteDoc(ctx, { type: cdxgenType, id: id });
            log.debug("App delete status =", r);
            return true;
        } catch (e) {
            log.debug("Failed to delete Cdxgen document: ", e);
        }
        log.debug("Error trying to delete Cdxgen document - just returning")
        return false;
    }

    //------------------------------------------------------------------------------------
    // Cdxgen processing & management methods
    //------------------------------------------------------------------------------------

    /**
     * Perform housekeeping of Cdxgen cached and sbom._cdxgen data to maintain data integrity
     *
     * @param ctx
     */
    cleanup = async (ctx: UserContext): Promise<any> => {
        // There are 5 possibilities:
        //  _cdxgen.id    cdxgen exists cdxgen.sbomId
        //      Y              Y                Y           all good
        //      Y              Y                N           add sbomId
        //      Y              N                -           _cdxgen=null
        //      N              Y                Y           do nothing - should be created on cdxgen.updateData
        //      N              N                -           delete sbom?

        // Y:Y - Ensure sbom._cdxgen.id and cdxgen.sbomId link to each other
        //  all good

        // Y:N - look for match - if found, add sbomId, if not found, _cdxgen=null
        {
            // Get all sboms that have _cdxgen.id
            const sbomsWithCdxgen = await this.mgr.getDocs(ctx, sbomType, {
                "_cdxgen.id": {$exists: true, $ne: null},
            },
            {
                projection: {id:1, "_cdxgen.id":1}
            });
            const sbomsByCdxgenId:{[key:string]:{sbomId:string}} = {};
            sbomsWithCdxgen.forEach((sbom: any) => {
                if (sbom._cdxgen?.id) {
                    sbomsByCdxgenId[sbom._cdxgen.id] = {sbomId: sbom.id || null};
                }
            });
            console.log("Y:N sbomsByCdxgenId =", Object.keys(sbomsByCdxgenId).length);


            // Get all cdxgen docs
            const cdxgenWithSbomId = await this.mgr.getDocs(ctx, cdxgenType, {}, { projection: { id: 1, "sbomId": 1 } });
            const cdxgenByCdxgenId: {[key:string]:{sbomId:string}} = {};
            cdxgenWithSbomId.forEach((cdxgen: any) => {
                if (cdxgen.sbomId) {
                    cdxgenByCdxgenId[cdxgen.id] = {sbomId: cdxgen.sbomId};
                }
            });
            console.log("Y:N cdxgenByCdxgenId =", Object.keys(cdxgenByCdxgenId).length);

            // For each sbom, check if it has a matching cdxgen
            const found = [];
            const deleted = [];
            const cleared = [];
            for (const [cdxgenId, item] of Object.entries(sbomsByCdxgenId)) {
                const cdxgen = cdxgenByCdxgenId[cdxgenId]

                // ?:Y:? - If cdxgen cache entry exists, then check if it has sbomId
                if (cdxgen) {

                    // Y:Y:N - If sbomId not found in cdxgen, then update cdxgen with sbomId
                    if (!cdxgen.sbomId) {
                        console.log("Found cdxgen that matches sbom, but cdxgen is missing sbomId, so set sbomId in cdxgen: ", cdxgenId, item.sbomId);
                        const r = await this.rawUpdateCdxgen({sbomId: item.sbomId}, cdxgenId);
                        console.log("  -- update result =", r);
                        found.push({sbom: item.sbomId, cdxgen: cdxgenId});
                    }

                    // Y:Y:Y
                    else {
                        // console.log("Found existing link for sbom and cdxgen - : ", cdxgenId, sbomId);
                    }
                }

                // ?:N:? - If cdxgen not found
                else {
                    // N:N:? - If cdxgen cache entry, delete sbom
                    console.log("No cdxgen cache entry - so delete sbom", item.sbomId, cdxgenId);
                    deleted.push({sbom: item.sbomId, cdxgen: cdxgenId});
                    const r = await this.sbomClient.deleteSbom(ctx, item.sbomId);
                    console.log("  -- delete result =", r);
                    await this.etl.writeLog(ctx, `CdxgenClient.cleanup() - No Cdxgen cache entry - so delete sbom = ${item.sbomId} cdxgenId = ${cdxgenId}`);
                }
            }

            console.log("Y:Y:N Found missing cdxgen.sbomId =", found);
            console.log("Y:Y:N updated sboms length =", found.length);
            console.log("Y:N:? cleared _cdxgen in sboms length =", cleared.length);
            console.log("N:N:? deleted sboms length =", deleted.length);

            await this.etl.writeLog(ctx, `CdxgenClient.cleanup() - Found missing cdxgen.sbomId = ${found.length}`);
            await this.etl.writeLog(ctx, `CdxgenClient.cleanup() - Cleared _cdxgen in sboms = ${cleared.length}`);
            await this.etl.writeLog(ctx, `CdxgenClient.cleanup() - Deleted sboms = ${deleted.length}`);
        }

        // Delete any sboms._cdxgen that have sbom._cdxgen.id but there isn't a cached cdxgen document
        {

        }

    }

    /**
     * Retrieve open source product version information from https://deps.dev and cache in Surveyor database and update SBOM with latest cached info
     *
     * @param ctx
     */
    refreshCache = async (ctx: UserContext) => {
        let serverStatus = await this.etl.getServerStatus();
        if (serverStatus && ![STATUS.STOPPED, STATUS.IDLE].includes(serverStatus)) { throw "Server is busy"}

        const cmd = "Updating cached cdxgen entries";
        await this.etl.setStatus(STATUS.RETRIEVING, cmd);
        await this.etl.writeLog(ctx,`refreshCachedCdxgen() - Start`)
        const now = Date.now();

        // 1. Get list of Cdxgen info from application
        const cdxgenInfo = this.getCdxgenInfo(ctx);

        // 2. Get dateUpdated for all cached entries
        //   create map of dates
        //   delete GitHub repos from map so that all that remains are entries that
        //     no longer get processed by cdxgen.  Then these items can be deleted from
        //     the cache
        // Get date updated for all cached Cdxgen documents
        const cachedCdxgenDocs = await this.getAllCdxgenDocs(ctx) || [];
        // console.log("cachedCdxgenDocs =", cachedCdxgenDates);
        log.debug("cachedCdxgenDates length =", cachedCdxgenDocs.length);

        const cachedDateMap = new Map();
        cachedCdxgenDocs.map((doc) => {
            if (doc.id && doc.url && doc.dateUpdated) {
                cachedDateMap.set(doc.url, {id: doc.id, dateUpdated: doc.dateUpdated});
            }
        })

        // 3. If cached entry exists and if cached date is older than a day
        //   set "updated" state on cache entry so that it gets updated
        // 4. If cached entry doesn't exist, create a new cache entry
        let updatedCount = 0;
        let createdCount = 0;
        let deletedCount = 0;
        const aWeekAgo = now - (1000*60*60*24*7);
        for (const cdxgenItem of cdxgenInfo) {
            const dateItem = cachedDateMap.get(cdxgenItem.url);
            try {
                if (dateItem) {
                    // Remove from map so only those not found in Cdxgen cache will remain
                    // This is used to determine which cached Cdxgen documents are no longer in
                    // the Cdxgen list and should be set to deleted
                    cachedDateMap.delete(cdxgenItem.url);

                    // item found in cache, mark it in cache if it needs updating
                    if (dateItem.dateUpdated < aWeekAgo) {
                        const _item = await this.updateCdxgen(ctx, { state: "updated" }, dateItem.id);
                        updatedCount++;
                    }
                } else {
                    log.debug(">>> create cdxgen");
                    const _item = await this.createCdxgen(ctx, cdxgenItem);
                    createdCount++;
                }
            } catch (err) {
                log.debug(`Error ${dateItem ? "updating" : "creating"} Cdxgen cache item for url: ${cdxgenItem.url}`);
            }
        }
        // 5. If no error occurred, if there are any entries left in the map, delete
        //     those from the cache
        if (cachedDateMap.size > 0) {
            console.log("Number of Cdxgen cached documents not found in Cdxgen list: ", cachedDateMap.size);
            let count = 1;
            const len = cachedDateMap.size;
            for (const githubUrl of cachedDateMap.keys()) {
                const dateItem = cachedDateMap.get(githubUrl);
                console.log("Cdxgen cached document not found in Cdxgen list so delete it: ", githubUrl, " - ", dateItem);
                await this.etl.writeLog(ctx, `Cdxgen cached document not found in Cdxgen list so delete it: ${githubUrl} - ${JSON.stringify(dateItem)}`);

                await this.etl.setStatusComment(`Deleting ${count} of ${len}: githubUrl=${githubUrl}}`);
                const r = await this.deleteCdxgen(ctx, dateItem.id);
                if (r) {
                    deletedCount++;
                }
                count++;
            }
        }

        log.info("Number of Cdxgen docs created =", createdCount);
        log.info("Number of Cdxgen docs updated =", updatedCount);
        log.info("Number of Cdxgen docs deleted =", deletedCount);

        await this.etl.setStatus(STATUS.IDLE, cmd, "Done");
        await this.etl.writeLog(ctx, `refreshCachedCdxgen() - Number of Cdxgen docs created = ${createdCount}`);
        await this.etl.writeLog(ctx, `refreshCachedCdxgen() - Number of Cdxgen docs updated = ${updatedCount}`);
        await this.etl.writeLog(ctx, `refreshCachedCdxgen() - Number of Cdxgen docs deleted = ${deletedCount}`);
        await this.etl.writeLog(ctx, `refreshCachedCdxgen() - Done`)
    }

    /**
     * Change state of all Cdxgen documents to "created" so that updateData will update all documents
     * with latest cdxgen properties in SBOM.
     *
     * @param ctx
     */
    resetCdxgenToCreated = async (ctx: UserContext): Promise<any> => {
        await this.etl.assertIsAdminOrEditor(ctx);
        await this.etl.writeLog(ctx, `resetCdxgenToCreated() - Start`)
        await this.etl.setStatus(STATUS.UPDATING, "Resetting Cdxgen entries to created", "Getting entries...");

        const cdxgenItems = await this.getCdxgenDocs(ctx, { state: { $in: ["updated", "active"] } }, ["id", "state", "data.id"]) || [];
        let count = 0;
        const len = cdxgenItems.length;
        for (const item of cdxgenItems) {
            // console.log("Resetting Cdxgen entry to created: ", item.data.id);
            if (count % 100 == 0) {
                await this.etl.setStatusComment(`Resetting cdxgen doc ${count} of ${len}`);
            }
            const r = await this.rawUpdateCdxgen({ state: "created" }, item.id);
            // console.log("Reset Cdxgen entry to created: ", item.data.id, " - ", r);
            count++;
        }
        await this.etl.setStatus(STATUS.IDLE, "Resetting Cdxgen entries to created", "Done");
        await this.etl.writeLog(ctx, `resetCdxgenToCreated() - Done`)
    }

    /**
     * Process any new Cdxgen information and create or update SBOM.
     *
     * @param ctx The user context
     * @param doRefresh [optional] T=do full refresh
     * @param processItems [optional] The list of sbom names or ids to process instead of all SBOMs
     * @returns
     */
    updateData = async (ctx: UserContext, doRefresh=false, processItems?: string[]): Promise<any> => {
        await this.etl.assertIsAdminOrEditor(ctx);
        const serverStatus = await this.etl.getServerStatus();
        if (serverStatus && ![STATUS.STOPPED, STATUS.IDLE].includes(serverStatus)) { throw "Server is busy" }
        await this.etl.writeLog(ctx, `cdxgen updateData() - Start`)
        const cmd = "Process Cdxgen entries";

        // Do data integrity checks
        await this.etl.setStatus(STATUS.UPDATING, cmd, `Cleaning up cached Cdxgen entries`);
        await this.cleanup(ctx);

        // If doRefresh is true, then reset all Cdxgen entries to created
        if (doRefresh) {
            await this.resetCdxgenToCreated(ctx);
        }

        // Get Cdxgen documents
        await this.etl.setStatus(STATUS.UPDATING, cmd, "Testing Cdxgen connection");
        await this.etl.writeLog(ctx, "updateData() - Testing Cdxgen connection");

        // test to make sure cdxgen server running
        let r = await axios.get(cdxgenUrl + "/health", { ...cdxgenReqConfig(), auth: undefined, proxy: false })
        if (!r.data || !r.data.status || r.data.status !== "OK") {
            await this.etl.setStatus(STATUS.IDLE, cmd, "Error connecting to Cdxgen");
            await this.etl.writeLog(ctx, `updateData() - Error connecting to Cdxgen, status: ${r.data?.status}`);
            throw new Error("Could not connect to CDXGEN server: " + cdxgenUrl);
        }

        // Get Cdxgen documents
        await this.etl.setStatusComment("Processing cached Cdxgen entries");

        //-------------------------------------------------------------------------------
        // Process each Cdxgen doc that is in cached database
        //-------------------------------------------------------------------------------
        {
            log.info("Processing cached cdxgen entries...")

            // Get matching properties for all cached Cdxgen docs
            const cdxgenItems = await this.getAllCdxgenDocs(ctx);
            const cdxgenItemsByKey: { [key: string]: CdxgenSummary } = {};
            for (const item of cdxgenItems) {
                cdxgenItemsByKey[item.id] = item;
            }

            // Get all SBOMs that have a Cdxgen entry
            const sbomsWithCdxgen = await this.sbomClient.getSbomsWithCdxgen(ctx);
            const sbomsByCdxgen: {[key:string]: SbomCdxgenStub} = {};
            for (const sbom of sbomsWithCdxgen) {
                sbomsByCdxgen[sbom.cdxgenId] = sbom;
            }

            let processedCount = 0;
            let createdCount = 0;
            let invalidCount = 0;
            let count = 0;
            const len = cdxgenItems.length;
            for (const item of cdxgenItems) {
                count++;

                // Check everytime since generating a sbom can take a while
                const serverStatus = await this.etl.getServerStatus();
                if (!serverStatus) {
                    await this.etl.setStatus(STATUS.IDLE, cmd, `Cancelled processing Cdxgen entry - (${count} of ${len})`);
                    await this.etl.writeLog(ctx, `updateData() - Cancelled processing Cdxgen entry - (${count} of ${len})`)
                    return;
                }
                await this.etl.setStatusComment(`Processing Cdxgen entry: ${count} of ${len}`);

                let sbom = null;
                const existingSbom = sbomsByCdxgen[item.id];

                // Throw away ms part of dates
                const cdxgenDate = item.dateUpdated ? Math.floor((new Date(item.dateUpdated).getTime())/1000) : 0;
                const sbomDate = Math.floor((existingSbom?.cdxgenUpdatedAt || 0) / 1000);

                // Only process if cdxgen more recent than sbom._cdxgen, or if state = created or updated
                if (!existingSbom || !cdxgenDate || !sbomDate || (cdxgenDate != sbomDate || item.state == "created" || item.state == "updated")) {

                    // generate SBOM for cdxgen item to get most recent information from the
                    //  github repo, store it if it doesn't already exist, update it if it does
                    //  exist and update Cdxgen cache entry with sbomId
                    sbom = await this.generateSbomForCdxgen(ctx, item);
                    console.log("created sbom=", sbom);

                    if (sbom) {
                        createdCount++;

                        // Build bom-ref array for substitution later
                        const bomRefs: any = {};

                        let id = this.sbomClient.createBomRef(sbom.metadata.component);

                        // Replace metadata bom-ref with id
                        bomRefs[sbom.metadata.component["bom-ref"]] = id;
                        sbom.metadata.component["bom-ref"] = id;

                        // Build list of all bom-ref for components
                        if (sbom.components) {
                            for (const component of sbom.components) {
                                let cid = this.sbomClient.createBomRef(component);
                                bomRefs[component["bom-ref"]] = cid;
                                component["bom-ref"] = cid;
                            }
                        }

                        // Replace all bom-ref with id in vulnerabilities
                        if (sbom.vulnerabilities) {
                            for (const v of sbom.vulnerabilities) {
                                for (const affect of v.affects) {
                                    const bomRef = affect.ref;
                                    affect.ref = bomRefs[bomRef];
                                }
                            }
                        }

                        // Replace all bom-ref with id in dependencies
                        const sbomDeps: number[] = [];
                        let depsIndex = 0;
                        if (sbom.dependencies) {
                            for (const d of sbom.dependencies) {
                                let dIsSbomComponent = false;
                                if (!bomRefs[d.ref]) {
                                    // bomRefs contains all of the bomRefs that were built
                                    //  from the sbom.components.  Cdxgen seems to put the
                                    //  application package itself as the last dependency
                                    //  in the list of dependencies.  Since that is not in
                                    //  the sbom.components, it won't be found in bomRefs.
                                    //  So we'll ignore it.
                                    //
                                    // In multiProject repos, there is more than one
                                    //  package file and thus more than one application
                                    //  so it is possible that there are multiple times
                                    //  that this will happen in one sbom.dependencies list.
                                    //if (d.ref === sbom.metadata.component.purl) {
                                        dIsSbomComponent = true;
                                        sbomDeps.push(depsIndex);
                                    //}
                                }
                                d.ref = dIsSbomComponent ? {...sbom.metadata.component["bom-ref"]} : bomRefs[d.ref];
                                const dependsOn = [];
                                for (const dep of d.dependsOn) {
                                    dependsOn.push(bomRefs[dep]);
                                }
                                d.dependsOn = dependsOn;
                                depsIndex++;
                            }

                            if (sbomDeps && sbomDeps.length > 0) {
                                // Assume the first item in the sbomDeps array to be the sbom
                                //  representative top-level dependency list.  ODS assumes
                                //  that the first item in the sbom.dependencies list is
                                //  a bomref for the sbom with the dependsOn array holding
                                //  all of the sbom's top-level dependencies.
                                //TODO: what if sbomDeps holds more than one item?
                                //const delIndex = sbomDeps.pop();
                                const sbomDep = sbom.dependencies.splice(sbomDeps[0], 1);
                                sbom.dependencies.splice(0, 0, sbomDep[0]);
                            }
                        }

                        // If no dependencies, but there are components, then add all components as top-level dependencies
                        if (!sbom.dependencies && sbom.components) {
                            log.debug(`No dependencies found for product ${sbom.metadata.component.name}, so adding components as top-level dependencies`);
                            await this.etl.writeLog(ctx,`No dependencies found for product ${sbom.metadata.component.name} but there are components, so adding components as top-level dependencies`)

                            const dependsOn:any = [];
                            for (const component of sbom.components) {
                                dependsOn.push(component["bom-ref"]);
                            }
                            if (!sbom.metadata.component["bom-ref"]) {
                                debugger;
                            }
                            sbom.dependencies = [{
                                ref: sbom.metadata.component["bom-ref"],
                                dependsOn: dependsOn, 
                            }]
                        }

                        // Keep list of assemblies
                        const assemblies = [];
                        const purlToBomRef:any = {};

                        // Create new SBOM documents for components
                        if (sbom.components) {
                            const ckeys = ["bomFormat", "specVersion", "serialNumber", "version"];
                            for (const component of sbom.components) {
                                log.debug("component=", JSON.stringify(component, null, 4));
                                const c: any = {};
                                for (const key of ckeys) {
                                    c[key] = sbom[key];
                                }
                                c.metadata = {
                                    timeStamp: sbom.metadata.timestamp,
                                    tools: sbom.metadata.tools,
                                };
                                c.metadata.component = component;

                                // Update component with vulnerabilities
                                const bomRef = component["bom-ref"];
                                const appVulnerabilities = []
                                if (sbom.vulnerabilities) {
                                    for (const vulnerability of sbom.vulnerabilities) {
                                        const affects = vulnerability.affects;
                                        for (const affect of affects) {
                                            if (this.isBomRefEqual(affect.ref, bomRef)) {
                                                // @TODO: Spec says affects = [{ref, versions}] but we are replacing array with bomRef string
                                                const _vulnerability = {...vulnerability, affects: [ {ref: bomRef } ]}; // make new copy
                                                appVulnerabilities.push(_vulnerability);
                                                break;
                                            }
                                        }
                                    }
                                }
                                c.vulnerabilities = appVulnerabilities;

                                let cid = this.sbomClient.createBomRef(component); 
                                log.debug("cid =", cid);
                                log.debug("c =", JSON.stringify(c, null, 4));
                                const _comp = await this.sbomClient.getSbomById(ctx, cid);

                                // Determine if the library sbom stub already exists.
                                //  If not, create it.
                                if (_comp) {
                                    log.debug("Component exists");
                                    cid.id = _comp.id;
                                }
                                else {
                                    log.debug("Component does not exist - creating");
                                    const newComp = await this.sbomClient.createSbom(ctx, c);

                                    // Get bomRef of new component
                                    cid = this.sbomClient.createBomRef(newComp.metadata.component["bom-ref"]);
                                }
                                log.debug("cid =", cid);

                                // Add component to assemblies array
                                assemblies.push(cid);

                                // Save to map, so dependencies, vulnerabilities, components can be updated with id in BomRef
                                purlToBomRef[cid.purl] = cid.id;
                            }
                        }

                        sbom.compositions = [
                            {
                                aggregate: "not_specified",
                                assemblies: assemblies
                            }
                        ]

                        if (sbom.components) {
                            for (const _component of sbom.components) {
                                _component["bom-ref"].id = purlToBomRef[_component["bom-ref"].purl]
                            }
                        }

                        if (sbom.dependencies) {
                            for (const _dependency of sbom.dependencies) {
                                _dependency.ref.id = purlToBomRef[_dependency.ref.purl]
                                for (const _dependsOn of _dependency.dependsOn) {
                                    _dependsOn.id = purlToBomRef[_dependsOn.purl]
                                }
                            }
                        }

                        // capture all of the dependency changes that have been made
                        await this.sbomClient.updateSbom(ctx, sbom, sbom.id);
                    }
                    else {
                        log.debug("Error: This should not happen - sbomId is not set");
                        invalidCount++;
                    }
                    try {
                        // Set active if not already set
                        if (item.state != "active") {
                            const r = await this.updateCdxgen(ctx, { state: "active" }, item.id);
                            // console.log("Updated Cdxgen entry to active:", r);
                        }
                    } catch (e) {
                        log.debug("Error processing SBOM:", e)
                        invalidCount++
                    }
                }

                // Process cdxgen entry if existing sbom
                if (existingSbom || sbom) {
                    processedCount++;
                }
            }

            log.info("Number of Cdxgen docs processed =", processedCount);
            log.info("Number of Cdxgen docs created =", createdCount);
            log.info("Number of Cdxgen docs invalid =", invalidCount);
            await this.etl.writeLog(ctx, `updateData() - Number of Cdxgen docs processed = ${processedCount}`);
            await this.etl.writeLog(ctx, `updateData() - Number of Cdxgen docs created = ${createdCount}`);
            await this.etl.writeLog(ctx, `updateData() - Number of Cdxgen docs invalid = ${invalidCount}`);
        }

        await this.etl.setStatus(STATUS.IDLE, cmd, "Done");
        await this.etl.writeLog(ctx, `updateData() - Done`)
    }

    isBomRefEqual = (ref1: any, ref2: any) => {
        if (ref1.name != ref2.name) { return false }
        if (ref1.version != ref2.version) { return false }
        if (ref1.group != ref2.group) { return false }
        if (ref1.type != ref2.type) { return false }
        if (ref1.purl != ref2.purl) { return false }
        return true;
    }

    /**
     * Generate an SBOM with Cdxgen using information from the Cdxgen cache item.  If there
     * is already a SBOM in ODS associated with cdxgenItem, then update the existing SBOM in
     * ODS with the new information.  Otherwise add the new SBOM to ODS.
     *
     * @param ctx
     * @param cdxgenItem CdxgenSummary object
     * @returns SBOM
     */
    generateSbomForCdxgen = async (ctx: UserContext, cdxgenItem: CdxgenSummary): Promise<any> => {
        const cdxgenId = cdxgenItem.id;
        log.debug(`CdxgenSbomClient.generateSbomForCdxgen(${cdxgenId})`)

        // Get entire Cdxgen document
        const item = cdxgenItem;

        // See if SBOM already exists for this cache item
        let _sbom = await this.sbomClient.getSbomForCdxgenId(ctx, item.id);

        // generate sbom from GitHub repo using Cdxgen
        const sbomUrl = `${cdxgenUrl}/sbom?url=${cdxgenItem.url}&multiProject=${cdxgenItem.multiProject}&type=${cdxgenItem.type}`;
        console.log("generating sbom using: " + sbomUrl);
        const r = await axios.get(sbomUrl, { ...cdxgenReqConfig(), auth: undefined, proxy: false });
        if (r.status !== 200 || !r.data || typeof r.data !== "object") {
            console.log("could not create SBOM using cdxgen for: ", cdxgenItem.url);
            return null;
        }
        const sbom = r.data;
        sbom._cdxgen = {
            id: cdxgenItem.id,
            url: cdxgenItem.url,
            dateUpdated: cdxgenItem.dateUpdated
        }
        if (!_sbom) {
            _sbom = await this.sbomClient.createSbom(ctx, sbom);
        } else {
            // update existing SBOM with new information
            // NOTE: this will replace almost all of the previous SBOM data
            _sbom = await this.sbomClient.updateSbom(ctx, sbom, _sbom.id);
        }
        if (_sbom && _sbom?.metadata?.component) {
            const sbomId = _sbom.id;

            // Update cdxgen with sbomId
            const _item = await this.updateCdxgen(ctx, { sbomId: sbomId }, item.id);
        }
        return _sbom;
    }

    /**
     * Test connection to Cdxgen server and generate SBOM for test GitHub repo
     * 
     * @returns
     */
    test = async () => {
        log.debug(`test()`);
        let retry = 0;
        let lastError = null;

        // test to make sure cdxgen server running
        let r = await axios.get(cdxgenUrl + "/health", { ...cdxgenReqConfig(), auth: undefined, proxy: false })
        if (!r.data || !r.data.status || r.data.status !== "OK") {
            throw new Error("Could not connect to CDXGEN server: " + cdxgenUrl);
        }

        const cdxgenItem = {
            "url": "https://github.com/finos/a11y-theme-builder",
            "type": "js",
            "multiProject": true
        }

        while (retry < 3) {
            try {
                const response = await fetch(`${cdxgenUrl}/sbom?url=${cdxgenItem.url}&multiProject=${cdxgenItem.multiProject}&type=${cdxgenItem.type}`, { method: 'GET', ...cdxgenReqConfig() });
                if (!response.ok) {
                    throw new Error(`Request failed! Status: ${response.status}`);
                }
                const data = await response.json();
                log.debug("test =", data);
                return data;
            } catch (e) {
                lastError = e;
                retry++;
            }
        }

        throw lastError;
    }

}