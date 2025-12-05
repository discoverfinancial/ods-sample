/**
 * Copyright (c) 2025 Capital One
*/

import { Logger, UserContext } from "ods-framework";
import { Ods, ETL } from "ods-framework";
import { SbomClient } from "../bom";
import { STATUS } from "ods-framework";
import { guidanceType, GuidanceInfo } from "../../common";
import { DepsdevClient } from "../depsdev";
import { Processor } from "ods-framework";
const log = new Logger("GuidanceProcessor");

/**
 * GuidanceProcessor class for processing Guidance
 */
export class GuidanceProcessor implements Processor {
    etl: ETL;
    mgr: Ods;
    sbomClient: SbomClient;

    constructor(etl: ETL) {
        this.etl = etl;
        this.mgr = etl.mgr;
        this.sbomClient = new SbomClient(etl);
    }

    //======================================================================================================================
    // Guidance
    //======================================================================================================================

    /**
     * Get all guidance docs
     *
     * @returns Array of guidance objects
     */
    getGuidanceDocs = async (ctx: UserContext, params:any) => {
        try {
            const data = await this.mgr.getDocs(ctx, guidanceType, params?.params?.match, params?.params?.options);
            if (data?.length > 0) {
            }
            return data;
        } catch (e: any) {
            console.error("Error getting guidance: ", e);
        }
        log.debug("Error trying to get Guidance documents")
        return [];
    }

    /**
     * Create guidance document.
     *
     * @param guidance - The guidance object
     * @returns {Promise<any>}
     */
    createGuidance = async (ctx: UserContext, guidance: any) => {
        if (!guidance || !guidance.item.name) return null;
        log.debug(`SbomClient.guidance(${guidance.item.name})`);
        try {
            const r = await this.mgr.createDoc(ctx, guidanceType, guidance);
            if (r) {
                return r;
            }
        } catch (e) {
            log.debug("Failed to create Guidance document: ", e);
        }
        log.debug("Error trying to create Guidance document")
        return null;
    }

    copyDocField = (dest: any, src: any, fieldName: string) => {
        const parts = fieldName.split(".");
        dest[parts[0]] = src[parts[0]];
    }

    /**
     * Change guidance state to a supported value
     *
     * @returns Array of guidance objects
     */
    changeGuidanceState = async (ctx: UserContext, id: string, newState: string): Promise<boolean> => {
        if (!id || !["active", "cancelled"].includes(newState)) return false;
        try {
            const data = await this.mgr.updateDoc(ctx, {type: guidanceType, id: id}, {"state": newState});
            if (data?.state === newState) {
                return true;
            }
        } catch (e: any) {
            console.error("Error updating guidance state: ", e);
        }
        return false;
    }

    /**
     * Activate guidance document
     *
     * @returns Updated guidance document
     */
    activateGuidanceDoc = async (ctx: UserContext, id: string): Promise<boolean> => {
        return await this.changeGuidanceState(ctx, id, "active");
    }

    /**
     * Retire guidance document
     *
     * @returns Guidance object
     */
    retireGuidanceDoc = async (ctx: UserContext, id: string): Promise<boolean> => {
        return await this.changeGuidanceState(ctx, id, "cancelled");
    }

    /**
     * Retire guidance documents for purl
     *
     * @returns Array of guidance objects that were changed
     */
    retireGuidanceForPurl = async (ctx: UserContext, purl: string): Promise<any> => {
        console.log(`retireGuidanceForPurl(${purl})`)
        const params = {params: {
            match: {
                "item.basePurl": purl,
            },
            projection: {
                id:1, item:1, tier:1, state:1,
            }
        }}
        const docs = await this.getGuidanceDocs(ctx, params);
        const retired = [];
        if (docs && docs.length > 0) {
            for (const doc of docs) {
                console.log("retiring "+purl+" with id=" + doc.id);
                const r = await this.changeGuidanceState(ctx, doc.id, "cancelled");
                retired.push(doc.id);
            }
        }
        return retired;
    }

    /**
     * Update guidance document.  
     * This will create the Guidance document if it doesn't exist.
     * 
     * @param {any} item - The guidance object
     * @param {string} id - The id to update
     * @returns {Promise<any>}
     */
    updateGuidance = async (ctx: UserContext, item: any, id?: string):Promise<GuidanceInfo> => {
        if (!id) {
            id = item.id;
        }
        log.debug(`SbomClient.updateGuidance(${id})`)
        if (!id) {
            const r = await this.createGuidance(ctx, item);
            return r;
        }
        const _item = {...item}
        // Remove all keys that aren't allowed to be updated as specified by GuidanceUpdate interface
        delete _item.dateCreated;
        delete _item.dateUpdated;
        delete _item.stateHistory;
        delete _item.comments;
        delete _item.curStateRead;
        delete _item.curStateWrite;
        delete _item.id;

            try {
                const r = await this.mgr.updateDoc(ctx, {type: guidanceType, id: id}, _item);
                if (r) {
                    return r;
                }
                else {
                    // If creating with state specified, then create first, then update with state
                    const newState = _item.state;
                    if (newState) {
                        delete _item.state;
                    }
                    const rc = await this.createGuidance(ctx, item);
                    if (newState) {
                        const rcu = await this.updateGuidance(ctx, {state: newState}, rc.id);
                        return rcu;
                    }
                    return rc;
                }
            } catch (e) {
                log.debug("Failed to update Guidance document: ", e);  
            }
        log.debug("Error trying to update Guidance document - just returning original object")
        return _item;
    }

    /**
     * Delete guidance document.
     * 
     * @param id 
     */
    deleteGuidance = async (ctx: UserContext, id: string) => {
        try {
            const r = await this.mgr.deleteDoc(ctx, {type: guidanceType, id: id});
            if (r) {
                return true;
            }
        } catch (e) {
            log.debug("Failed to delete Guidance document: ", e);  
        }
        log.debug("Error trying to delete Guidance document - just returning")
        return false;
    }

    /**
     * Update Guidance
     * @param ctx
     */
    process = async (ctx: UserContext) => {
        await this.etl.assertIsAdminOrEditor(ctx);
        const serverStatus = await this.etl.getServerStatus();
        if (serverStatus && ![STATUS.STOPPED, STATUS.IDLE].includes(serverStatus)) { throw "Server is busy"}
        const guidanceProcessor = new GuidanceProcessor(this.etl);
        await guidanceProcessor.updateTier2Guidance(ctx);
    }

    /**
     * Guidance for Tier2 components are generated by looking at deps.dev
     * 
     * @param ctx 
     * @returns 
     */
    updateTier2Guidance = async (ctx: UserContext) => {
        await this.etl.assertIsAdminOrEditor(ctx);
        const serverStatus = await this.etl.getServerStatus();
        if (serverStatus && ![STATUS.STOPPED, STATUS.IDLE].includes(serverStatus)) { throw "Server is busy"}
        await this.etl.writeLog(ctx,`updateTier2Guidance() - Start`)
        log.info(`updateTier2Guidance()`)
        const cmd = "Update Tier 2 Guidance";
        await this.etl.setStatus(STATUS.UPDATING, cmd, "");

        const depsDevClient = new DepsdevClient(this.etl);
        await depsDevClient.updateTier2Guidance(ctx);

        await this.etl.setStatus(STATUS.IDLE, cmd, "Done");
        await this.etl.writeLog(ctx,`updateTier2Guidance() - Done`)
    }

}