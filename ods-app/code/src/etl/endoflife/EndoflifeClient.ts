/**
 * Copyright (c) 2025 Capital One
*/

import { Logger, UserContext } from "dlms-server";
import { Ods, ETL } from "ods-framework";
import { SbomClient } from "../bom";
import { STATUS} from "ods-framework";
import {endoflifeType } from "../../common";
import { CacheDataClient } from "ods-framework";
const log = new Logger("EndoflifeClient");

const url = `https://endoflife.date`;

/**
 * EndoflifeClient class for interacting with the EndOfLife API
 */
export class EndoflifeClient implements CacheDataClient {
    etl: ETL;
    mgr: Ods;
    sbomClient: SbomClient;

    constructor(etl: ETL) {
        this.etl = etl;
        this.mgr = etl.mgr;
        this.sbomClient = new SbomClient(etl);
    }

    config = () => {
        const r:any = {
            headers: {
                "Content-Type": "application/json",
            },
        }
        return r;
    }

    //==========


    /**
     * Get Endoflife document from Surveyor cached database
     *
     * @param {string} id - The cached endoflife id
     * @returns {Promise<any>}
     */
    getEndoflife = async (ctx: UserContext, id: string) => {
        if (!id) {
            return null;
        }
        try {
            const data = await this.mgr.getDoc(ctx, { type: endoflifeType, id: id });
            return data;
        } catch (e) {
        }
        return null;
    }

    /**
     * Get Endoflife document from software name from Surveyor cached database.
     *
     * @param {string} name - The Endoflife name
     * @returns {Promise<any>}
     */
    getEndoflifeForName = async (ctx: UserContext, name: string) => {
        log.debug(`getEndoflifeForName(${name})`);
        if (!name) {
            return null;
        }
        try {
            const params = {
                params: {
                    match: {
                        aggregate: [
                            {
                                $match: {
                                    "data.result.name": name
                                }
                            },
                            { $sort: { dateUpdated: -1 } },
                            { $limit: 1 },
                        ]
                    }
                }
            }
            const data = await this.mgr.getDocs(ctx, endoflifeType, params.params.match);
            if (data?.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    const _r = data[i];
                    return _r;
                }
            }

        } catch (e) {
            log.debug("Error getting endoflife entry for name ", name, ": ", e);
        }
        return null;
    }

    /**
     * Create Endoflife document in Surveyor cached database.
     *
     * @param {any} item - The Endoflife document
     * @returns {Promise<any>} Endoflife object or null
     */
    createEndoflife = async (ctx: UserContext, item: any) => {
        log.debug(`EndoflifeClient.createEndoflife()`)
        try {
            const data = await this.mgr.createDoc(ctx, endoflifeType, item);
            if (data) {
                return data;
            }
        } catch (e) {
            log.debug("Failed to create Endoflife document: ", e);
        }
        log.debug("Error trying to create Endoflife document")
        return null;
    }

    /**
     * Update the Surveyor cached Endoflife document.
     * This will create the Endoflife document if it doesn't exist.
     *
     * @param {any} item - The Endoflife object
     * @param {string} id - The Endoflife id to update
     * @returns {Promise<any>}
     */
    updateEndoflife = async (ctx: UserContext, item: any, id?: string) => {

        if ((!id) && ('id' in item)) {
            id = item.id;
            console.log("Taking id from item: ", id);
        }
        log.debug(`EndoflifeClient.updateEndoflife(${item.id})`)
        if (!id) {
            const r = await this.createEndoflife(ctx, item);
            return r;
        }
        const _item = { ...item }
        // Remove all keys that aren't allowed to be updated as specified by EndoflifeUpdate interface
        delete _item.dateCreated;
        delete _item.dateUpdated;
        delete _item.stateHistory;
        delete _item.comments;
        delete _item.curStateRead;
        delete _item.curStateWrite;

        try {
            const data = await this.mgr.updateDoc(ctx, { type: endoflifeType, id: id }, _item);
            if (data) {
                return data;
            }
            else {
                return await this.createEndoflife(ctx, item);
            }
        } catch (e) {
            log.debug("Failed to update Endoflife document: ", e);
        }
        log.debug("Error trying to update Endoflife document - just returning original object")
        return _item;
    }

    /**
     * Delete document from Surveyor cached Endoflife document.
     *
     * @param id
     */
    deleteEndoflife = async (ctx: UserContext, id: string) => {
        try {
            const r = await this.mgr.deleteDoc(ctx, { type: endoflifeType, id: id });
            log.debug("App delete status =", r);
            return true;
        } catch (e) {
            log.debug("Failed to delete Endoflife document: ", e);
        }
        log.debug("Error trying to delete Endoflife document - just returning")
        return false;
    }


    /**
     * Delete document from Surveyor cached Endoflife document.
     *
     * @param id
     */
    deleteAllEndoflife = async (ctx: UserContext) => {
        try {
            const productNames = await this.getProductNames();
            for (const product of productNames) {
                const currentEntry = await this.getEndoflifeForName(ctx, product);
                const r = await this.mgr.deleteDoc(ctx, { type: endoflifeType, id: currentEntry.id });
                console.log("Deleted Endoflife document for product: ", product, " - ", r);
            }
            console.log("Deleted all Endoflife documents");

        } catch (e) {
            log.debug("Failed to delete Endoflife document: ", e);
        }
        log.debug("Error trying to delete Endoflife document - just returning");
    }


    /**
     * Refresh cached end of life data
     * 
     * @param ctx 
     * @param doRefresh true=create new and update existing documents, false=create new documents but don't update existing ones
     * @returns 
     */
    refreshCache = async (ctx: UserContext, doRefresh=false) => {
        await this.etl.assertIsAdminOrEditor(ctx);
        const serverStatus = await this.etl.getServerStatus();
        if (serverStatus && ![STATUS.STOPPED, STATUS.IDLE].includes(serverStatus)) { throw "Server is busy"}
        log.info(`refreshCachedEndoflife(${doRefresh})`);

        const cmd = "Updating cached Endoflife Database";
        await this.etl.setStatus(STATUS.UPDATING, cmd, "");
        const now = Date.now();

        let updatedCount = 0;
        let createdCount = 0;
        let existingCount = 0;

        const productNames = await this.getProductNames();
        if (productNames) {
            let count = 1;
            let len = productNames.length;

            for (const product of productNames) {

                const serverStatus = await this.etl.getServerStatus();
                if (serverStatus == STATUS.STOPPED || !serverStatus) {
                    return null;
                }
                await this.etl.setStatusComment(`Updating ${count} of ${len}: Name=${product}`);
                count++;

                const productDetails = await this.getProductDetails(product);
                const currentEntry = await this.getEndoflifeForName(ctx, product);
                console.log("currentEntry=", currentEntry);
                if (!currentEntry) {
                    log.debug(">>> create endoflife")
                    const _item = await this.createEndoflife(ctx, { data: productDetails });
                    createdCount++;
                }
                else {
                    if (new Date(productDetails?.last_modified) > new Date(currentEntry.data?.last_modified)) {
                        log.debug(">>> update endoflife")
                        const _item = await this.updateEndoflife(ctx, { data: productDetails, state: "updated" }, currentEntry.id);
                        updatedCount++;
                    }
                    else {
                        existingCount++;
                    }
                }
            }
        }

        await this.etl.setStatus(STATUS.IDLE, cmd, "Done");
        await this.etl.writeLog(ctx, `refreshCachedEndoflife() - Number of Endoflife docs created = ${createdCount}`);
        await this.etl.writeLog(ctx, `refreshCachedEndoflife() - Number of Endoflife docs updated = ${updatedCount}`);
        await this.etl.writeLog(ctx, `refreshCachedEndoflife() - Number of preexisting unchanged Endoflife docs = ${existingCount}`);
        await this.etl.writeLog(ctx, `refreshCachedEndoflife() - Done`)

        console.log(`refreshCachedEndoflife() - Number of Endoflife docs created = ${createdCount}`);
        console.log(`refreshCachedEndoflife() - Number of Endoflife docs updated = ${updatedCount}`);
        console.log(`refreshCachedEndoflife() - Number of preexisting unchanged Endoflife docs = ${existingCount}`);
        console.log(`refreshCachedEndoflife() - Done`);

    }

    test = async () => {
        const details = await this.getAllDetails("angular");
        console.log("details=", JSON.stringify(details,null,4));

        const cycle = await this.getSingleCycleDetails("angular", "19");
        console.log("cycle=", JSON.stringify(cycle,null,4));

        const productPage = await this.getProductPage("angular");
        console.log("detproductPageails=", productPage);

        return {details: details, cycle: cycle, productPage: productPage }
    }

    //==========

    async getProductNames () {
        log.debug(`getProductNames()`)
        const response = await fetch(`${url}/api/all.json`, { method: 'GET', ...this.config() });
        if (!response.ok) {
            throw new Error(`Request failed! Status: ${response.status}`);
        }
        const r = await response.json();
        console.log("getProductNames =", r);
        return r;
    }

    async getProducts () {
        log.debug(`getProducts()`)
        const response = await fetch(`${url}/api/v1/products`, { method: 'GET', ...this.config() });
        if (!response.ok) {
            throw new Error(`Request failed! Status: ${response.status}`);
        }
        const r = await response.json();
        console.log("getProducts =", r);
        return r;
    }

    async getProductDetails (product: string) {
        log.debug(`getProductDetails(${product})`)
        const response = await fetch(`${url}/api/v1/products/${product}`, { method: 'GET', ...this.config() });
        if (!response.ok) {
            throw new Error(`Request failed! Status: ${response.status}`);
        }
        const r = await response.json();
        console.log("getProductDetails =", r);
        return r;

    }

    async getAllDetails (product: string) : Promise<any> {
        log.debug(`getAllDetails(${product})`)
        const response = await fetch(`${url}/api/${product}.json`, { method: 'GET', ...this.config() });
        if (!response.ok) {
            throw new Error(`Request failed! Status: ${response.status}`);
        }
        const r = await response.json();
        return r;
    }

    async getSingleCycleDetails (product: string, cycle: string) : Promise<any> {
        log.debug(`getSingleCycleDetails(${product}, ${cycle})`)
        const response = await fetch(`${url}/api/${product}/${cycle}.json`, { method: 'GET', ...this.config() });
        if (!response.ok) {
            throw new Error(`Request failed! Status: ${response.status}`);
        }
        const r = await response.json();
        return r;
    }

    async getProductPage (product: string) : Promise<any> {
        log.debug(`getProductPage(${product})`)
        const response = await fetch(`https://raw.githubusercontent.com/endoflife-date/endoflife.date/refs/heads/master/products/${product}.md`, { method: 'GET', ...this.config() });
        if (!response.ok) {
            throw new Error(`Request failed! Status: ${response.status}`);
        }
        const r = await response.text();
        return r;
    }

}