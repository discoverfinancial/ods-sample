/**
 * Copyright (c) 2025 Capital One
*/

import { Logger, UserContext } from "dlms-server";
import { Ods, ETL } from "ods-framework";
import { SbomClient } from "../bom";
import { compareVersions, getBasePurl, STATUS } from "ods-framework";
import { DepsdevInfo, GuidanceCreate, depsdevType } from "../../common";
import { CacheDataClient } from "ods-framework";
import { GuidanceProcessor } from "../guidance";
import { AppMgr } from "../../appMgr";
const log = new Logger("DepsdevClient");

const depsdevUrl = `https://api.deps.dev/v3alpha`;
const INVALID_VERSION_ERROR = "Invalid Version: ";
const PACKAGE_NOT_FOUND_ERROR = "Error: Request failed! Status: 404";
const N_MINUS_DEFAULT = 2;  // index of version to use for pci.preferredVersions.minimum
                            // 1 = N-1, 2 = N-2

export enum DepsDevSystem {
    GO = "go",
    NPM = "npm",
    CARGO = "cargo",
    MAVEN = "maven",
    PYPI = "pypi",
    NUGET = "nuget"
}

const depsdevConfig = () => {
    return {
        headers: {
            "Content-Type": "application/json"
        },
        // auth: {
        //     username: process.env["??"] || "",
        //     password: process.env["??"] || "",
        // }
    }
}

interface BadVersionObject {
    name: string,
    purl: string,
    badVersion: string
}

interface GetPageVersionsReturn {
    versions: string[];
    depsdev: DepsdevInfo;
}

/**
 * DepsdevClient class for interacting with the Deps.dev API
 */

export class DepsdevClient implements CacheDataClient {
    etl: ETL;
    mgr: Ods;
    appMgr: AppMgr;
    sbomClient: SbomClient;
    guidanceProcessor: GuidanceProcessor;
    badVersionsList:Map<string, BadVersionObject> = new Map<string, BadVersionObject>();
    packageNotFoundList:string[] = [];

    constructor(etl: ETL) {
        this.etl = etl;
        this.mgr = etl.mgr;
        this.appMgr = AppMgr.getInstance();
        this.sbomClient = new SbomClient(etl);
        this.guidanceProcessor = new GuidanceProcessor(etl);
    }

    /**
     * Get all depsdev docs
     * 
     * @returns Array of depsdev objects
     */
    getDepsdevDocs = async (ctx: UserContext, params={}) => {
        try {
            const data = await this.mgr.getDocs(ctx, depsdevType, params);
            if (data?.length > 0) {
            }
            return data;
        } catch (e: any) {
            console.error("Error getting depsdev: ", e);
            return [];
        }
    }

    /**
     * Get depsdev document for base purl.
     * 
     * @param {string} basePurl
     * @returns {Promise<any>}
     */
    getDepsdevDoc = async (ctx: UserContext, basePurl: string) => {
        log.debug(`getDepsdevDoc(${basePurl})`)
        if (!basePurl) {
            return null;
        }
            try {
                const params = {
                    params: {
                        match: {
                            "package.purl": basePurl,
                        }
                    }
                }
                    const data = await this.mgr.getDocs(ctx, depsdevType, params.params.match);
                        if (data?.length > 0) {
                            // Note: there should only be 1, but if not, return most recent
                            if (data.length > 1) {
                                data.sort((a: any, b: any) => {
                                    if (a.dateUpdated < b.dateUpdated) {
                                        return 1;
                                    }
                                    if (a.dateUpdated > b.dateUpdated) {
                                        return -1;
                                    }
                                    return 0;
                                });
                            }
                            return data[0];
                        }

            } catch (e) {
                log.debug("Error getting depsdev entry for basePurl ",basePurl,": ", e);
            }
        return null;
    }

    /**
     * Update depsdev document.  
     * This will create the Depsdev document if it doesn't exist.
     * 
     * @param {any} item - The depsdev object
     * @param {string} id - The id to update
     * @returns {Promise<any>}
     */
    updateDepsdevDoc = async (ctx: UserContext, item: any, id?: string) => {
        if (!id) {
            id = item.id;
        }
        log.debug(`DepsdevClient.updateDepsdevDoc(${id})`)
        if (!id) {
            const r = await this.createDepsdevDoc(ctx, item);
            return r;
        }
        const _item = {...item}
        // Remove all keys that aren't allowed to be updated as specified by DepsdevUpdate interface
        delete _item.dateCreated;
        delete _item.dateUpdated;
        delete _item.state;
        delete _item.curStateRead;
        delete _item.curStateWrite;
        let err = null;

            try {
                    const data = await this.mgr.updateDoc(ctx, {type: depsdevType, id: id}, _item);
                    if (data) {
                        return data;
                    }
                    else  {
                        return await this.createDepsdevDoc(ctx, item);
                    }
            } catch (e) {
                log.debug("Failed to update Depsdev document: ", e);  
            }
        if (err) {
            throw new Error(err);
        }
        log.debug("Error trying to update Depsdev document - just returning original object")
        return _item;
 
    }

    /**
     * Create depsdev
     * 
     * @returns depsdev objects
     */
    createDepsdevDoc = async (ctx: UserContext, item: any) => {
        log.debug(`DepsdevClient.createDepsdevDoc(${item})`)
        try {
            const data = await this.mgr.createDoc(ctx, depsdevType, item);
            if (data) {
                return data;
            }
        } catch (e) {
            log.debug("Failed to create Depsdev document: ", e);            
        }
        log.debug("Error trying to create Depsdev document")
        return null;
    }

    /**
     * Delete depsdev object
     * 
     * @param id 
     * @returns 
     */
    deleteDepsdevDoc = async (ctx: UserContext, id: string) => {
        log.debug(`DepsdevClient.deleteDepsdevDoc(${id})`)
        try {
            const r = await this.mgr.deleteDoc(ctx, {type: depsdevType, id: id});
            log.debug("Depsdev delete status =", r);
            if (r) {
                return r;
            }
        } catch (e) {
            log.debug("Failed to delete Depsdev document: ", e);            
        }
        log.debug("Failed to delete Depsdev");
    }

    /**
     * Delete depsdev object
     * 
     * @param id 
     * @returns 
     */
    deleteDepsdevMany = async (ctx: UserContext, match:any) => {
        log.debug(`DepsdevClient.deleteDepsdevMany(${match})`)
        if (!match) {
            console.log("deleteDepsdevMany error: match is required");
            return null;
        }
        try {
            const data = await this.mgr.deleteMany(ctx, depsdevType, match);
            return data;
        } catch (e: any) {
            console.error("Error deleting many depsdev: ", e);
            return null;
        }
    }

    //==========

    /**
     * Retrieve open source product version information from https://deps.dev and cache in Surveyor database and update SBOM with latest cached info
     *
     * @param ctx
     */
    refreshCache = async (ctx: UserContext) => {
        let serverStatus = await this.etl.getServerStatus();
        if (serverStatus && ![STATUS.STOPPED, STATUS.IDLE].includes(serverStatus)) { throw "Server is busy"}
        const cmd = "Updating cached Deps.dev entries";
        await this.etl.setStatus(STATUS.UPDATING, cmd, "Getting data from deps.dev");
        await this.etl.writeLog(ctx,`refreshCachedDepsdev() - Start`)
        const now = Date.now();
        
        // Get sboms that are open source libraries
        const sboms = await this.sbomClient.getSboms(ctx, {params: {
            match: {
                "metadata.component.type": "library"
            },
            options: {
                projection: {id:1, "metadata.component.purl":1, _depsdev:1},
            }
        }});
        const len = sboms.length;
        log.debug("Number of sboms =", len)
        log.debug("sboms[0] =", sboms[0])
        let count = 0;
        let processedCount = 0;
        let updatedCount = 0;

        for (const sbom of sboms) {
            let serverStatus = await this.etl.getServerStatus();
            if (!serverStatus) {
                await this.etl.setStatus(STATUS.IDLE, cmd, `Cancelled at refreshCachedDepsdev() - (${count} of ${len})`);
                await this.etl.writeLog(ctx,`refreshCachedDepsdev() - Cancelled at refreshCachedDepsdev() - (${count} of ${len})`)
                return;
            }
            if (!sbom.metadata?.component?.purl) { continue }
            const _purl = sbom.metadata.component.purl;
            const i = _purl.indexOf("?");
            const purl = (i > -1) ? _purl.substring(0, i) : _purl;
            await this.etl.setStatusComment(`Extracting ${count} of ${len}: ${purl}`);
            log.debug(`Extracting ${count} of ${len}: ${purl}`);
    
            let depsdev = await this.getDepsdevDoc(ctx, purl);
            const depsdevId = depsdev ? depsdev.id : null;
            let depsdevDateUpdated = 0;
            if (depsdev?.version?.publishedAt) { 
                depsdevDateUpdated = (new Date(depsdev.version.publishedAt)).getTime();
                console.log("Depsdev dateUpdated=", new Date(depsdevDateUpdated));
            }
            let sbomDepsdevDateUpdated = 0;
            if (sbom?._depsdev?.dateUpdated) { 
                sbomDepsdevDateUpdated = sbom._depsdev.dateUpdated;
                console.log("SBOM Depsdev dateUpdated=", new Date(sbom._depsdev.dateUpdated)); 
            }

            if (depsdev) {
                processedCount++;
            }

            // If not found OR found in cache but not updated in last 7 days, then refresh entry           
            if (!depsdev || 
                !sbom._depsdev || 
                (now - depsdev.dateUpdated) > (7*24*60*60*1000) || 
                depsdevDateUpdated > sbomDepsdevDateUpdated 
            ) {
                depsdev = await this.getPackageFromPurl(purl);
                if (depsdev) {                   
                    const updatedDepsdev = await this.updateDepsdevDoc(ctx, depsdev, depsdevId);
                    const _depsdev:any = {
                        dateUpdated: updatedDepsdev.dateUpdated,
                        package: {
                            packageKey: depsdev.package.packageKey,
                            purl: depsdev.package.purl,
                        },
                        error: depsdev.error,
                    }
                    if (depsdev.version) {
                        _depsdev.version = {
                            versionKey: depsdev.version.versionKey,
                            purl: depsdev.version.purl,
                            publishedAt: depsdev.version.publishedAt,
                            isDefault: depsdev.version.isDefault,
                            isDeprecated: depsdev.version.isDeprecated,
                        }
                    }
                    if (depsdev.project?.scorecard?.checks?.length) {
                        _depsdev.scorecard = {};
                        for (const check of depsdev.project.scorecard.checks) {
                            _depsdev.scorecard[check.name] = check.score;
                        }
                        _depsdev.scorecard.overallScore = depsdev.project.scorecard.overallScore;
                    }
                    const r = await this.sbomClient.updateSbom(ctx, {_depsdev: _depsdev}, sbom.id);
                    updatedCount++;
                }
            }
            count++;
        }

        log.info("Number of DepsDev docs processed =", processedCount);
        log.info("Number of SBOMs updated =", updatedCount);
        await this.etl.writeLog(ctx,`refreshCachedDepsdev() - Number of Deps docs processed = ${processedCount}`);
        await this.etl.writeLog(ctx,`refreshCachedDepsdev() - Number of SBOMs updated = ${updatedCount}`);

        // Also cache base url for all libraries used
        const basePurls:any = {};
        count = 0;
        processedCount = 0;
        updatedCount = 0;
        for (const sbom of sboms) {
            let serverStatus = await this.etl.getServerStatus();
            if (!serverStatus) {
                await this.etl.setStatus(STATUS.IDLE, cmd, `Cancelled at refreshCachedDepsdev() - (${count} of ${len})`);
                await this.etl.writeLog(ctx,`refreshCachedDepsdev() - Cancelled at refreshCachedDepsdev() - (${count} of ${len})`)
                return;
            }
            if (!sbom.metadata?.component?.purl) { continue }
            const purl = getBasePurl(sbom.metadata.component.purl);
            if (basePurls[purl]) { continue }
            basePurls[purl] = true;

            await this.etl.setStatusComment(`Processing base purl ${count} of ${len}: ${purl}`);
            log.debug(`Processing base purl ${count} of ${len}: ${purl}`);
    
            let depsdev = await this.getPackageVersions(ctx, purl);
            processedCount++;

            count++;
        }

        log.info("Number of base purl DepsDev docs processed =", processedCount);
        await this.etl.writeLog(ctx,`refreshCachedDepsdev() - Number of base purl DepsDev docs processed = ${processedCount}`);


        await this.etl.setStatus(STATUS.IDLE, cmd, "Done");
        await this.etl.writeLog(ctx,`refreshCachedDepsdev() - Done`)
    }



    //==========

    /**
     * Retrieve package information from the given package system
     * @param {DepsDevSystem} system - The package system hosting the package.  One of GO, NPM, CARGO, MAVEN, PYPI, NUGET
     * @param {string} packageName - The name of the package
     * @param {string} versions - Optional, version of hte package
     * @returns JSON object containing version and package information
     */
    async getPackageByName(system: DepsDevSystem, packageName: string, versions?: string): Promise<any | null> {
        if (!packageName) return null;
        const versionsString = versions ? `/versions/${versions}` : "";
        const response = await fetch(`${depsdevUrl}/systems/${system}/packages/${encodeURIComponent(packageName)}${versionsString}`, { method: 'GET', ...depsdevConfig() });
        if (!response.ok) {
            throw new Error(`Request failed! Status: ${response.status}`);
        }
        return await response.json();
    }

    /**
     * Retrieve package information associated with the given purl
     * @param {string} purl - The purl of the package to query
     * @returns JSON object containing version and package information
     */
    async getPackageFromBasePurl(purl: string): Promise<any | null> {
        log.debug(`getPackageFromBasePurl(${purl})`)
        if (!purl) return null;
        try {
            // Get package for purl
            const r1 = await fetch(`${depsdevUrl}/purl/${encodeURIComponent(purl)}`, { method: 'GET', ...depsdevConfig() });
            if (!r1.ok) {
                if (r1.status === 404) {
                    this.packageNotFoundList.push(`purl: ${purl}`);
                    const ret = {
                        package: {
                            purl: purl,
                        },
                        error: "package not found",
                    }
                    return ret;
                }
                throw new Error(`Request failed! Status: ${r1.status}`);
            }
            const ret = await r1.json();

            // Get default version or last if no default
            const len = ret.package.versions.length;
            let system = ret.package.packageKey.system;
            let name = ret.package.packageKey.name;
            let version = ret.package.versions[len-1].versionKey.version;
            for (const v of ret.package.versions) {
                if (v.isDefault) {
                    version = v.versionKey.version;
                    system = v.versionKey.system;
                    name = v.versionKey.name;
                    break;
                }
            }

            const details = await this.getVersionDetails(purl, system, name, version);
            if (details.version) {
                ret.version = details.version;
            }
            if (details.project) {
                ret.project = details.project
            }
            return ret;
        } catch (e: any) {
            log.warn(`Error getting package from ${purl}:`, e);
            const ret = {
                package: {
                    purl: purl,
                },
                error: ""+e,
            }
            return ret;
        }
    }

    /**
     * Retrieve package information associated with the given purl
     * @param {string} purl - The purl of the package to query
     * @returns JSON object containing version and package information
     */
    async getPackageFromPurl(_purl: string): Promise<any | null> {
        log.debug(`getPackageFromPurl(${_purl})`)
        if (!_purl) return null;
        const i = _purl.indexOf("?");
        const purl = (i > -1) ? _purl.substring(0, i) : _purl;

        try {
            // Get package for purl
            const r1 = await fetch(`${depsdevUrl}/purl/${encodeURIComponent(purl)}`, { method: 'GET', ...depsdevConfig() });
            if (!r1.ok) {
                if (r1.status === 404) {
                    this.packageNotFoundList.push(`purl: ${purl}`);
                    const ret = {
                        package: {
                            purl: purl,
                        },
                        error: "package not found",
                    }
                    return ret;
                }
                throw new Error(`Request failed! Status: ${r1.status}`);
            }
            const pkg = await r1.json();

            let system = pkg.version.versionKey.system;
            let name = pkg.version.versionKey.name;
            let version = pkg.version.versionKey.version;

            const ret = await this.getVersionDetails(purl, system, name, version);
            // Create package object
            ret.package = {
                purl: purl,
                packageKey: {
                    system: system,
                    name: name,
                    version: version,
                },
                // This is a summary but duplicate of the ret.version, so don't really need 
                // but it is included to be consisted with basePurl entries in depsdev database
                versions: [
                    {
                        versionKey: pkg.version.versionKey,
                        purl: pkg.version.purl,
                        publishedAt: pkg.version.publishedAt,
                        isDefault: pkg.version.isDefault,
                        isDeprecated: pkg.version.isDeprecated,
                    }
                ]
            }
            return ret;
        } catch (e: any) {
            log.warn(`Error getting package from ${purl}:`, e);
            const ret = {
                package: {
                    purl: purl,
                },
                error: ""+e,
            }
            return ret;
        }
    }


    /**
     * Get the version details
     * 
     * @param purl 
     * @param system 
     * @param name 
     * @param version 
     * @returns {version, project}
     */
    async getVersionDetails(purl: string, system: string, name: string, version: string): Promise<any | null> {
        try {
            const ret:any = {};
            // Get version details
            const url = `${depsdevUrl}/query?versionKey.system=${system}&versionKey.name=${encodeURIComponent(name)}&versionKey.version=${version}`;
            const r2 = await fetch(url, { method: 'GET', ...depsdevConfig() });
            const r2Text = await r2.text();
            try {
                const versions = JSON.parse(r2Text);
                ret.version = versions.results[0].version;
            } catch (e) {
                log.warn(`Error getting version details for ${purl}: ${r2Text}`);
            }

            // Get project details
            const id = ret.version?.relatedProjects?.[0]?.projectKey?.id;
            const r3 = await fetch(`${depsdevUrl}/projects/${encodeURIComponent(id)}`, { method: 'GET', ...depsdevConfig() });
            const r3Text = await r3.text()
            // console.log("r3Text =", JSON.stringify(r3Text,null,4));
            try {
                ret.project = JSON.parse(r3Text);
            } catch (e) {
                log.warn(`Error getting project for ${purl}: ${r3Text}`);
            }
            return ret;
        } catch (e: any) {
            log.warn(`Error getting package from ${purl}:`, e);
            const ret = {
                package: {
                    purl: purl,
                },
                error: ""+e,
            }
            return ret;
        }
    }

    /**
     * Find the last 5 versions for the package with the given purl
     * Note: The bulk of this method needs to be kept in sync with VersionsListPage.findDefaultVersion()
     * 
     * @param {string} purl - The purl of the package
     * @returns string[] containing up to 5 version numbers in
     *   reverse order.  The defaultValue is the first version
     *   in the list
     */
    async getPackageVersions(ctx: UserContext, purl: string): Promise<GetPageVersionsReturn | null> {
        if (!purl) return null;

        // Filter out the purl:generic and purl:a-name as they
        //  will never be in deps.dev?  Certainly need special
        //  handling if nothing else.
        const purlPath = purl.indexOf("pkg:") === 0 ? purl.slice(4) : null;
        if (!purlPath) return null;
        const purlPathPieces = purlPath.split("/");
        if (["generic", "a-name"].includes(purlPathPieces[0])) return null;

        try {
            // build a purl w/o specific version information.  This
            //  assumes that the version follows the last '@' in
            //  the purl
            let defaultVersion;
            let generalPackageUrl = purl;
            const versionPos = purl.lastIndexOf(`@`);
            generalPackageUrl = versionPos > 0 ? purl.substring(0, versionPos) : purl;
            let depsdev = await this.getDepsdevDoc(ctx, generalPackageUrl);
            let id = depsdev?.id;
            if (depsdev?.dateUpdated) { console.log("dateUpdated=", new Date(depsdev.dateUpdated)); }

            // If not found OR found in cache but not updated in last day, then refresh entry           
            if (!depsdev || (Date.now() - depsdev.dateUpdated) > (24*60*60*1000)) {
                depsdev = await this.getPackageFromBasePurl(generalPackageUrl);
                if (depsdev) {
                    await this.updateDepsdevDoc(ctx, depsdev, id);
                }
            }
            if (depsdev) {
                if (depsdev && depsdev.package && depsdev.package.versions && depsdev.package.versions.length > 0) {
                    for (const version of depsdev.package.versions) {
                        if (version.isDefault) {
                            if (version.versionKey.version) {
                                defaultVersion = version.versionKey.version;
                                break;
                            }
                        }
                    }
                    if (defaultVersion) {
                        // If defaultVersion has major, then only return major & minor
                        // If defaultVersion has minor, then return minor & sub
                        const defaultVersionParts = defaultVersion.split(".")
                        const index = parseInt(defaultVersionParts[0]) > 0 ? 0 : 1
                        const _versions2:any = {};
                        const _versions3:any = {};
                        for (const version of depsdev.package.versions) {
                            const parts = version.versionKey.version.split(".")
                            parts[0] = parseInt("0"+parts[0]);
                            parts[1] = parseInt("0"+parts[1]);
                            parts[2] = parseInt("0"+parts[2]);
                            const _version = parts[index] + "." + parts[index+1];
                            _versions2[(index > 0) ? "0."+_version : _version] = version;
                            _versions3[parts.join(".")] = version;
                        }

                        // _versions2 will hold map of major.minor keys
                        //  with a value being the version object that
                        //  holds the most recent version that starts
                        //  with that major.minor.  For example:
                        //    3.0 {..., version: 3.0.9}
                        //    3.1 {..., version: 3.1.7}
                        // _version3 will hold a map of the full version
                        //  number as the key and the version object that
                        //  holds that version as the value.
                        //    3.0.9 {..., version: 3.0.9}
                        //    3.1.7 {..., version: 3.1.7}
                        const lenVersions2 = Object.keys(_versions2).length;
                        const allVersions = Object.keys((lenVersions2 > 5) ? _versions2 : _versions3).sort(function(v1, v2) {
                            return compareVersions(v1, v2);
                        },)

                        // Return 5 recent versions from default version
                        const versions:any = [];
                        for (var i=0; i<allVersions.length; i++) {
                            const version = allVersions[i];
                            if (compareVersions(version, defaultVersion) == 0) {
                                for (var j=0; j<5; j++) {
                                    if (i-j > 0) {
                                        versions.push(allVersions[i-j]);
                                    }
                                }
                                break;
                            }
                        }

                        // If only 1 version, then add to versions array
                        if (versions.length == 0) {
                            versions.push(defaultVersion);
                        }

                        // Need to return 5 versions, so dup lowest version to fill up array
                        while (versions.length < 5) {
                            versions.push(versions[versions.length-1]);
                        }

                        return {versions:versions, depsdev: depsdev}
                    }
                    // TODO: need to handle this somehow.  Should we
                    //  just return the 5 most recent versions?
                    console.debug("no default version found for: ", purl);
                }
            }
        } catch (e: any) {
            console.error(`Error getting versions from purl: ${purl}, `, e);
            return null;
        }
        return null;
    }

    /**
     * Get the guidance docs for all versions of the base purl.
     * 
     * @param ctx - The user context
     * @param basePurl - The base purl
     * @returns Array of guidance documents
     */
    async getGuidanceVersionInfo(ctx: UserContext, basePurl: string): Promise<any | null> {
        if (!basePurl) return null;
        const params = {
            params: {
                match: {
                    aggregate: [
                        {$match: { "item.basePurl": basePurl, tier: "2", state: {$in: ["created", "active"]}}},
                        {$sort: { dateUpdated: -1 }},
                        {$limit: 1},
                    ]
                },
                projection: {depsdevVersions:1, item:1, tier:1, id: 1, state: 1, documentation: 1}
            }
        }
        try {
            const guidanceInfo = await this.guidanceProcessor.getGuidanceDocs(ctx, params);
            if (guidanceInfo.length > 0) {
                return guidanceInfo[0];
            }
        } catch (e: any) {
            console.log("didn't find guidance for name: ", name);
        }
        return null;
    }

    clearDebugInformation = () => {
        this.badVersionsList.clear();
        this.packageNotFoundList = [];
    }
    
    test = async () => {
        log.debug(`test()`);
        let retry = 0;
        let lastError = null;

        while (retry < 3) {
            try {
                const response = await fetch(`${depsdevUrl}/query?hash.type=SHA1&hash.value=ulXBPXrC%2FUTfnMgHRFVxmjPzdbk%3D`, { method: 'GET', ...depsdevConfig() });
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
    
    deleteOldDepsdev = async (ctx: UserContext) => {
        {
        const match = {
            package: {$exists: false},
        }
        const docs = await this.deleteDepsdevMany(ctx, match);
        console.log("deleted old docs =",docs);
        }
    }

    updateTier2Guidance = async (ctx: UserContext) => {
        log.debug(`updateTier2Guidance()`);
        const setOfDependencies = new Map<string, {name:string, versions:string[], depsdev: DepsdevInfo | null}>(); //string[]>();
        this.clearDebugInformation();
        // await this.deleteOldDepsdev();
        const cmd = "Update Tier 2 Guidance";

        try {
            const startTime = Date.now();

            const topLevelDependencies = await this.appMgr.getMostUsed(true);
            if (!topLevelDependencies || !Array.isArray(topLevelDependencies) || topLevelDependencies.length === 0) {
                throw Error("unexpected results from getting dependencies");
            }
            console.log("topLevelDependencies=", topLevelDependencies[0]);
            
            // process list of dependencies
            let len = topLevelDependencies.length;
            let count = 0;
            for (const d of topLevelDependencies) {
                const serverStatus = await this.etl.getServerStatus();
                if (!serverStatus) {
                  await this.etl.setStatus(STATUS.IDLE, cmd, `Cancelled at updateTier2Guidance() - (${count} of ${len})`);
                    await this.etl.writeLog(ctx,`updateTier2Guidance() - Cancelled at updateTier2Guidance() - updating SBOMs - (${count} of ${len})`)
                    return;
                }
    
                console.log(`Getting Deps.dev versions for ${d.name} - (${count} of ${len})`);
                await this.etl.setStatusComment(`Getting Deps.dev versions for ${d.name} - (${count} of ${len})`);
                const depsdevReturn = await this.getPackageVersions(ctx, d.basePurl) || {versions:[], depsdev:null};
                const versions = depsdevReturn.versions;
                const depsdev = depsdevReturn.depsdev;
                console.log("versions =", versions)
                if (versions && versions.length > 0) {
                    setOfDependencies.set(d.basePurl, {name: d.name, versions: versions, depsdev: depsdev});
                }
                count++;
            }

            // begin - collect and report on metrics of the search for dependencies and versions
            const arrayOfBadVersions = [];
            for (const [key, value] of this.badVersionsList) {
                arrayOfBadVersions.push({"name": key, "purl": value.purl, "badVersion": value.badVersion});
            }
            const strBadVersionsList = JSON.stringify(arrayOfBadVersions);
            log.debug("test guidance list of versions, number of dependencies: " +setOfDependencies.size); //+" versions =", setOfDependencies);
            log.debug("test guidance list of troublesome versions, number of versions: " +this.badVersionsList.size+" bad versions =", JSON.stringify(strBadVersionsList));
            log.debug("test guidance list of unfound packages, number of dependencies: " +this.packageNotFoundList.length+" not found =", JSON.stringify(this.packageNotFoundList));
            const endTime = Date.now();
            log.debug("testDepsdevGuidance took: "+(endTime-startTime)+"ms");
            // end - collect and report on metrics

            // look for existing guidance for dependency
            len = setOfDependencies.size;
            count = 0;
            for (const [basePurl, value] of setOfDependencies) {
                const name = value.name;
                const versions = value.versions;
                const depsdev = value.depsdev;

                const serverStatus = await this.etl.getServerStatus();
                if (!serverStatus) {
                  await this.etl.setStatus(STATUS.IDLE, cmd, `Cancelled at updateTier2Guidance() - (${count} of ${len})`);
                    await this.etl.writeLog(ctx,`updateTier2Guidance() - Cancelled at updateTier2Guidance() - Processing Tier 2 Guidance - (${count} of ${len})`)
                    return;
                }

                await this.etl.setStatusComment(`Processing Tier 2 Guidance for ${basePurl} - (${count} of ${len})`);
                count++;
                log.debug(`Processing Tier 2 Guidance for ${basePurl} - (${count} of ${len})`)
                const newlyGeneratedVersionList = versions.join(",");
                const guidanceInfo = await this.getGuidanceVersionInfo(ctx, basePurl);
                if (guidanceInfo) {
                    if (guidanceInfo.tier === "1") {

                        // Add depsdev links to guidance if not already exists
                        const needToSave = this.addLinksToGuidance(depsdev, guidanceInfo);
                        if (needToSave) {
                            console.log("Tier1: Updated guidance =", JSON.stringify(guidanceInfo,null,4));
                            await this.guidanceProcessor.updateGuidance(ctx, {documentation: guidanceInfo.documentation}, guidanceInfo.id);
                        }

                        // do not generate new guidance if the current
                        //  guidance is tier1, which is maintained manually
                        continue;
                    }

                    // see if current guidance matches newly generated version lists
                    if (newlyGeneratedVersionList === guidanceInfo.depsdevVersions?.join(",") && guidanceInfo.state == "active") {

                        // Add depsdev links to guidance if not already exists
                        const needToSave = this.addLinksToGuidance(depsdev, guidanceInfo);
                        if (needToSave) {
                            console.log("Only links changed: Updated guidance =", JSON.stringify(guidanceInfo,null,4));
                            await this.guidanceProcessor.updateGuidance(ctx, {documentation: guidanceInfo.documentation}, guidanceInfo.id);
                        }

                        continue;
                    } 

                    // If guidance state = "created", then fix it and make it active
                    // This occurred due to bug, which has been fixed - however, keep it in just in case an error happens when activating
                    else if (guidanceInfo.state == "created") {
                        const activated = await this.guidanceProcessor.activateGuidanceDoc(ctx, guidanceInfo.id);
                        if (activated) {
                            console.debug("activated existing tier2 guidance, status: ", guidanceInfo.state);
                        } else {
                            console.debug("failed to activate existing tier2 guidance");
                        }
                        continue;
                    }

                    else {
                        // update the tier2 guidance with the newer guidance.  First
                        //  retire the previous guidance
                        const succeeded = await this.guidanceProcessor.retireGuidanceForPurl(ctx, guidanceInfo.item.basePurl);
                        console.log("succeeded in retiring guidance for: ", basePurl);
                    }
                }
                log.debug(`Need to create guidance for ${basePurl}`)
                log.debug(`Tier2: Need to create guidance for ${basePurl} depsdev versions=${newlyGeneratedVersionList} existing guidance versions=${guidanceInfo?.depsdevVersions?.join(",")}`)

                // No guidance currently exists OR existing guidance has been retired
                //  due to being stale so create new guidance.  By
                //  default the pci and nonPci minimums should be set
                //  to the minimum value in the versions array.
                const newGuidance:GuidanceCreate = {
                    item: { name: name, basePurl: basePurl },
                    tier: "2",
                    title: "Guidance for " + basePurl,
                    depsdevVersions: versions,
                    pci: {preferredVersion: {minimum: versions[N_MINUS_DEFAULT]}},
                    nonPci: {preferredVersion: {minimum: versions[N_MINUS_DEFAULT]}}
                }
                // Add links to doc
                this.addLinksToGuidance(depsdev, newGuidance);

                // create the new tier2 guidance
                let guidanceDoc = await this.guidanceProcessor.createGuidance(ctx, newGuidance);
                console.debug("create tier2 guidance status: ", guidanceDoc.item.name);
                // Make the new guidance active.  Since it is automated,
                //  requires no review.
                const activated = await this.guidanceProcessor.activateGuidanceDoc(ctx, guidanceDoc.id);
                if (activated) {
                    console.debug("activated tier2 guidance, status: ", guidanceDoc.state);
                } else {
                    console.debug("failed to activate tier2 guidance");
                }
            }

            console.debug("updating tier2 guidance succeeded");
        } catch (e:any) {
            console.debug("updating tier2 guidance failed, error: ", e.message);
        }
    }

    /**
     * Add deps.dev links to guidance.document[] if they don't already exist
     * 
     * @param depsdev 
     * @param guidance 
     * 
     * @returns boolean T=links were added, F=no links added
     */
    addLinksToGuidance = (depsdev: DepsdevInfo | null, guidance: GuidanceCreate) => {
        let added = false;
        if (depsdev && guidance) {
            if (!guidance.documentation) {
                guidance.documentation = [];
            }
            if (depsdev.version?.links) {

                // Add deps.dev website if not in doc link
                {
                    let found = false;
                    for (const docEntry of guidance.documentation) {
                        if (docEntry.title == "Deps.dev") {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        const depsDevURL = "https://deps.dev/" + depsdev?.version?.versionKey.system.toLowerCase() + "/" + encodeURIComponent(depsdev?.version?.versionKey.name);
                        guidance.documentation.push({ title: "Deps.dev", details: "Deps.dev website", url: depsDevURL })
                        added = true;
                    }
                }

                for (const entry of depsdev.version?.links) {
                    let found = false;
                    for (const docEntry of guidance.documentation) {
                        if (docEntry.title == entry.label) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        guidance.documentation.push({ title: entry.label, details: "From Deps.dev", url: entry.url })
                        added = true;
                    }
                }

            }

        }
        return added;
    }


}