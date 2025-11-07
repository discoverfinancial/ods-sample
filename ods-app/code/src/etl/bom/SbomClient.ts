/**
 * Copyright (c) 2025 Capital One
*/

import { Logger, UserContext } from "dlms-server";
import { Ods, ETL } from "ods-framework";
import { SbomDocumentInfo, storeType, SbomDocumentList, sbomType, normalizeGithubUrl } from "ods-framework";
const log = new Logger("SbomClient");
export interface SbomCdxgenStub {
    type: "sbom";
    id: string;
    cdxgenId: string;
    cdxgenGithub: string;
    cdxgenUpdatedAt: number;
    state: string;
    dateUpdated: number;
}

/**
 * Provides methods for interacting with the ODS SBOM and Cdxgen APIs.
 */
export class SbomClient {
    etl: ETL;
    mgr: Ods;
    constructor(etl: ETL) {
        this.etl = etl;
        this.mgr = etl.mgr;
    }

    /**
     * Create a BomRef object from an SBOM component
     * 
     * @param component The SBOM component object
     * @returns 
     */
    createBomRef = (component: any, id?: string) => {
        const bomRef:any = {name: component.name, version: component.version, type: component.type, purl: component.purl, group: component.group};
        if (id) {
            bomRef.id = id;
        }
        return bomRef;
    }

    //======================================================================================================================
    // SBOM
    //======================================================================================================================

    /**
     * Get metadata properties for all SBOMs
     * 
     * @returns Array of SBOM objects
     */
    getAllSboms = async (ctx: UserContext) => {
        try {
            const data = await this.mgr.getDocs(ctx, sbomType, {}, {id:1, "metadata": 1, dateUpdated:1});
            if (data?.length > 0) {
            }
            return data;
        } catch (e: any) {
            console.error("Error getting SBOMS: ", e);
            return [];
        }
    }

    /**
     * Get SBOMS for query
     * 
     * @param {any} params The search query with match and/or projection
     * @returns Array of SBOM objects
     */
    getSboms = async (ctx: UserContext, params:any) => {
        try {
            const data = await this.mgr.getDocs(ctx, sbomType, params.params.match, params.params.options) as SbomDocumentInfo[];
            if (data?.length > 0) {
                log.debug("getDocuments[0] =", JSON.stringify(data?.[0],null,4));
            }
            return data;
        } catch (e: any) {
            console.error("Error getting SBOMS: ", e);
            return [];
        }
    }

    /**
     * Retrieves the SBOM ID for the given product name and version, or latest version if not specified.
     * 
     * @param {string} productName - The name of the product.
     * @param {string} [productVersion] - The version of the product (optional).
     * @returns {Promise<string>} A Promise that resolves with the SBOM ID or bomRef.
     */
    getSbomId = async (ctx: UserContext, productName: string, productVersion?: string) => {
        log.debug(`SbomClient.getSbomId(${JSON.stringify(productName)}, ${productVersion})`)
        if ((typeof productName != "string")) {
            const r = await this.getSbomByBomRef(productName, true);
            return r;
        }

        // If no version, then query to get latest
        if (!productVersion) {
            const match = {"metadata.component.name":{"$in":["${encodeURIComponent(productName)}"]}};
                try {
                    const r = await this.mgr.getDocs(ctx, sbomType, match);
                    if (!r || r.length < 1) {
                        log.debug("No SBOMs found for product " + productName);
                        return null;
                    }
                    // Sort decending by version
                    r.sort((a: any, b: any) => {
                        log.debug("a=", a.metadata.component.version, "b=", b.metadata.component.version);
                        if (a.metadata.component.version < b.metadata.component.version) {
                            return 1;
                        }
                        if (a.metadata.component.version > b.metadata.component.version) {
                            return -1;
                        }
                        return 0;
                    });
                    const sbom = r[0];
                        const bomRef = this.createBomRef(sbom.metadata.component, sbom.id)
                        log.debug("Return sbom id (bomRef) =", bomRef);
                        return r[0].id;
                } catch (e) {
                    log.debug("No SBOMs found for product " + productName + " (Error caught)");
                }
            return null            
        }

        else {
            const _q = {
                "metadata.component.name":{$in:[`${encodeURIComponent(productName)}`]},
                "metadata.component.version": {$in:[`${encodeURIComponent(productVersion)}`]}
            };
            const q = `?match=${JSON.stringify(_q)}`
                try {
                    const r = await this.mgr.getDocs(ctx, sbomType, _q);
                    if (!r || r.length < 1) {
                        log.debug("No SBOMs found for product " + productName);
                        return null;
                    }
                    const sbom = r[0];
                        const bomRef = this.createBomRef(sbom.metadata.component, sbom.id)
                        log.debug("Return sbom id (bomRef) =", bomRef);
                        return r[0].id;
                } catch (e) {
                    log.debug("No SBOMs found for product " + productName + " (Error caught)");
                }
            return null
        }
    }

    /**
     * Retrieves an SBOM by its ID.
     * 
     * @param {string} id - The ID of the SBOM to retrieve.
     * @returns {Promise<any>} A Promise that resolves with the SBOM data.
     */
    getSbomById = async (ctx: UserContext, id: any) => {
        log.debug(`SbomClient.getSbomById(${JSON.stringify(id)})`)
        if (!id) { 
            return null; 
        }
        if (typeof id == "string") {
            try {
                const data = await this.mgr.getDoc(ctx, {type: sbomType, id: id});
                return data;
            } catch (e) {
            }
        }
        else {
            const r = await this.getSbomByBomRef(ctx, id);
            if (r) {
                return r;
            }
        }
        return null;
    }

    
    /**
     * Retrieves an SBOM by its bomRef.
     * 
     * @param {object} bomRef - The bomRef of the SBOM to retrieve.
     * @returns {Promise<any>} A Promise that resolves with the SBOM data.
     */
    getSbomByBomRef = async (ctx: UserContext, bomRef: any, getIdOnly=false) => {
        if (!bomRef) { 
            return null; 
        }
        
        const match:any = {};
        if (bomRef.name) {
            match["metadata.component.name"] = bomRef.name;
        }
        if (bomRef.version) {
            match["metadata.component.version"] = bomRef.version;
        }
        if (bomRef.group) {
            match["metadata.component.group"] =  bomRef.group;
        }
        if (bomRef.type) {
            match["metadata.component.type"] = bomRef.type;
        }
        if (bomRef.purl) {
            match["metadata.component.purl"] = bomRef.purl;
        }
        try {
            const data = await this.mgr.getDocs(ctx, sbomType, match);
                if (data?.length > 0) {
                    let r = data[0];
                    if (getIdOnly) {
                        r = r.id;
                    }
                    return r;
                }
        } catch (e) {
        }
        return null;
    }

    /**
     * Retrieves the SBOM for the given Cdxgen id.
     * 
     * @param {object} ctx - The user context
     * @param {string} id - The Cdxgen id
     * @returns {Promise<any>} A Promise that resolves with the SBOM data.
     */
    getSbomForCdxgenId = async (ctx: UserContext, id: string):Promise<SbomDocumentInfo|null> => {
        log.debug(`getSbomForCdxgenId(${id})`)
        if (!id) { 
            return null; 
        }
        const params = {
            "params": {
                "match": {
                    "_cdxgen.id": id
                }
            }
        }
        try {
            const data = await this.mgr.getDocs(ctx, sbomType, params.params.match);
                if (data?.length > 0) {
                    let r = data[0];
                    return r;
            }
        } catch (e) {
        }
        return null;
    }

    /**
     * Retrieves the SBOM for the given product name and version.
     * 
     * @param {string} productName - The name of the product.
     * @param {string} productVersion - The version of the product.
     * @returns {Promise<any>} A Promise that resolves with the SBOM data.
     */
    getSbom = async (ctx: UserContext, productName: string, productVersion: string) => {
        log.debug(`SbomClient.getSbom(${JSON.stringify(productName)}, ${productVersion})`)
            return await this.getSbomByBomRef(ctx, {name: productName, version: productVersion});
    }


    /**
     * Deletes an SBOM by its ID.
     * 
     * @param {string} id - The ID of the SBOM to delete.
     * @returns {Promise<void>} A Promise that resolves when the deletion is complete.
     */
    deleteSbom = async (ctx: UserContext, id: string) => {
        log.debug(`SbomClient.deleteSbom(${id})`)
        try {
            const r = await this.mgr.deleteDoc(ctx, {type: sbomType, id: id});
            if (r) {
                return r;
            }
            else {
                throw new Error("SBOM not found");
            }
        } catch (e) {

        }
        log.debug("Failed to delete SBOM");
    }

    /**
     * Updates an SBOM.

     * @param {any} sbom - The updated SBOM data.
     * @param {string} id - The ID of the SBOM to update.  If not specified, then the id is in the sbom object.
     * @returns {Promise<any>} A Promise that resolves with the updated SBOM data.
     */
    updateSbom = async (ctx: UserContext, sbom: any, id?: any) => {
        // If no id, but sbom has one, use it
        if (!id && sbom.id) {
            id = sbom.id;
        }
        log.debug(`SbomClient.updateSbom(${id ? JSON.stringify(id) : ""})`)

        // If no id yet or migrated, then get id
        if (!id) {

            // If migrated, then either id needs to be specified or sbom needs metadata
                if (!id) {
                    if (!sbom.metadata || !sbom.metadata.component ||!sbom.metadata.component.name) {
                        throw new Error("failed to update SBOM since it is empty");
                    }
                }
                // Use id from sbom if it exists, even if id was passed in
                if (sbom.id) {
                    id = sbom.id;
                }
                // Use id passed in if it's string
                else if (typeof id == "string") {
                    
                }
                // If not, then get sbom id from database
                else {
                    let __id = id;
                    // If no id, then get id from metadata
                    if (!id) {
                        __id = this.createBomRef(sbom.metadata.component);
                    }
                    const _id = await this.getSbomId(ctx, __id);
                    if (_id) {
                        id = _id;
                    }
                }
        }
        if (!id && (!sbom.metadata || !sbom.metadata.component ||!sbom.metadata.component.name)) {
            log.debug("ID not specified or not in SBOM");
            throw new Error("ID not specified or not in SBOM");
        }
        // log.debug("id=", id);
        const _sbom = {...sbom}
        delete _sbom.bomFormat;
        delete _sbom.specVersion;
        delete _sbom.dateCreated;
        delete _sbom.dateUpdated;
        delete _sbom.state;
        delete _sbom.stateHistory;
        delete _sbom.comments;
        delete _sbom.curStateRead;
        delete _sbom.curStateWrite;
        delete _sbom.serialNumber;
        delete _sbom.version;

            try {
                if (!id) {
                    const r = await this.createSbom(ctx, sbom);
                    return r;
                }
                else {
                        const data = await this.mgr.updateDoc(ctx, {type: sbomType, id: id}, _sbom);
                        if (data) {
                            return data;
                        }
                        else  {
                            return await this.createSbom(sbom, id);
                        }
                }
            } catch (e) {
                log.debug("Failed to update SBOM: ", e);  
            }
        log.debug("Error trying to update SBOM - just returning original SBOM object")
        return _sbom;
    }

    /**
     * Creates a new SBOM.

     * @param {any} sbom - The SBOM data to be created.
     * @returns {Promise<any>} A Promise that resolves with the created SBOM data.
     */
    createSbom = async (ctx: UserContext, sbom: any, id?: string) => {

        log.debug(`SbomClient.createSbom()`)
        try {
            const r = await this.mgr.createDoc(ctx, sbomType, sbom);
            if (r) {
                return r;
            }
        } catch (e) {
            log.debug("Failed to create SBOM: ", e);            
        }
        throw new Error("Failed to create SBOM: " + sbom?.metadata?.component?.name);
    }

    /**
     * Get a metadata property from the given SBOM object.
     * 
     * @param {object} sbom - The SBOM object to set the property on.
     * @param {string} name - The name of the property to set.
     * @returns
     */
    getMetadataProperty = (sbom: any, name: string) => {
        const parts = name.split(".");
        const key = "_" + parts[0];
        const prop = parts[1];
        if (sbom && sbom[key] && sbom[key][prop]) {
            return sbom[key][prop]
        }

        return undefined;
    }

    /**
     * Sets a metadata property on the given SBOM object.
     *
     * @param {object} sbom - The SBOM object to set the property on.
     * @param {string} name - The name of the property to set.
     * @param {string} value - The value to set for the property.
     * @returns {void}
     */
    setMetadataProperty = (sbom: any, name: string, value: string) => {
        const parts = name.split(".");
        const key = "_" + parts[0];
        const prop = parts[1];
        if (!sbom[key]) {
            sbom[key] = {};
        }
        sbom[key][prop] = value;
    }

    /**
     * Set component information in SBOM.
     * 
     * @param {object} sbom - The SBOM object to set the info on.
     * @param {string} name - The name of the key to set.
     * @param {string} value - The value to set for the key.
     * @returns {void}
     */
    setMetadataComponentItem = (sbom: any, name: string, value: any) => {
        if (!sbom.metadata) {
            sbom.metadata = {};
        }
        if (!sbom.metadata.component) {
            sbom.metadata.component = {};
        }
        sbom.metadata.component[name] = value;
    }

    /**
     * Add an assembly to the SBOM's compositions array.
     * 
     * @param {object} sbom - The SBOM object to set.
     * @param {string} id - The SBOM id for the assembly to add.
     * @returns {void}
     */
    addAssembly = (sbom: any, id: any) => {
        log.debug(`addAssembly(${id})`);
        if (!sbom.compositions) {
            sbom.compositions = [];
        }
        if (sbom.compositions.length < 1) {
            sbom.compositions.push({
                aggregate: "not_specified",
                assemblies: [],
            });
        }

        const isStringId = (typeof id == "string");
        const assemblies = sbom.compositions[0].assemblies;
        let found = false;
        for (const a of assemblies) {

            // If string, then compare id
            if (isStringId && a.id == id) {
                found = true;
                break;
            }

            // Only compare name & version of bomRef
            else {
                if (a.name == id.name && a.version == id.version) {
                    found = true;
                    break;
                }
            }
        }    
        if (!found) {
            assemblies.push(id);
        }
    }

    //======================================================================================================================
    // Cdxgen
    //======================================================================================================================

    async getSbomsWithCdxgen(ctx: UserContext): Promise<SbomCdxgenStub[]> {
        log.debug("SbomClient.getSbomsWithCdxgen()")
        const r = await this.mgr.getDocs(ctx, sbomType, {
            "_cdxgen.id": { $exists: true, $ne: null },
        }, {
            projection: {
                id: 1,
                cdxgenId: "$_cdxgen.id",
                cdxgenGithub: "$_cdxgen.url",
                cdxgenUpdatedAt: "$_cdxgen.dateUpdated",
                state: 1,
                dateUpdated: 1,
            }
        }) as SbomCdxgenStub[];
        // Normalize github urls
        for (const item of r) {
            if (item.cdxgenGithub) {
                item.cdxgenGithub = normalizeGithubUrl(item.cdxgenGithub);
            }
        }
        log.debug("r=", r[0]);
        return r;
    }

    //======================================================================================================================
    // Store
    //======================================================================================================================

    /**
     * Get all store docs
     * 
     * @returns Array of store objects
     */
    getStoreDocs = async (ctx: UserContext, params:any) => {
        try {
            const data = await this.mgr.getDocs(ctx, storeType, params?.params?.match, params?.params?.options);
            if (data?.length > 0) {
            }
            return data;
        } catch (e: any) {
            console.error("Error getting store: ", e);
            return [];
        }
    }

    /**
     * Update store document.  
     * This will create the Store document if it doesn't exist.
     * 
     * @param {any} item - The store object
     * @param {string} id - The id to update
     * @returns {Promise<any>}
     */
    updateStoreDoc = async (ctx: UserContext, item: any, id?: string) => {
        if (!id) {
            id = item.id;
        }
        log.debug(`SbomClient.updateStoreDoc(${id})`)
        if (!id) {
            const r = await this.createStoreDoc(ctx, item);
            return r;
        }
        const _item = {...item}
        // Remove all keys that aren't allowed to be updated as specified by CdxgenUpdate interface
        delete _item.dateCreated;
        delete _item.dateUpdated;
        delete _item.state;
        delete _item.stateHistory;
        delete _item.comments;
        delete _item.curStateRead;
        delete _item.curStateWrite;
        try {
            const data = await this.mgr.updateDoc(ctx, {type: storeType, id: id}, _item);
            if (data) {
                return data;
            }
            else  {
                return await this.createStoreDoc(ctx, item);
            }
        } catch (e) {
            log.debug("Failed to update Store document: ", e);  
        }
        log.debug("Error trying to update Store document - just returning original object")
        return _item;
 
    }

    /**
     * Create store
     * 
     * @returns store objects
     */
    createStoreDoc = async (ctx: UserContext, item: any) => {
        log.debug(`SbomClient.createStoreDoc(${item.title})`)
        try {
            const data = await this.mgr.createDoc(ctx, storeType, item);
            if (data) {
                return data;
            }
        } catch (e) {
            log.debug("Failed to create Store document: ", e);            
        }
        log.debug("Error trying to create Store document")
        return null;
    }

    /**
     * Delete store object
     * 
     * @param id 
     * @returns 
     */
    deleteStoreDoc = async (ctx: UserContext, id: string) => {
        log.debug(`SbomClient.deleteStoreDoc(${id})`)
        try {
            const r = await this.mgr.deleteDoc(ctx, {type: storeType, id: id});
            log.debug("Store delete status =", r);
            if (r) {
                return r;
            }
        } catch (e) {
            log.debug("Failed to delete Store document: ", e);            
        }
        log.debug("Failed to delete Store");
    }

}