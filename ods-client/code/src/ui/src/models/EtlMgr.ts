/**
 * Copyright (c) 2025 Capital One
*/

// import { Vulnerability } from '../common/server/bom-1.6';
import { sbomType, Person, AttachmentInfo, UserGroupInfo, SbomDocumentInfo, SbomDocumentCreate, SbomDocumentUpdate } from '../common/common';
import { Http } from '../Http'
import { IActionMgr, IAttachmentMgr, IDocMgr, IUserGroupMgr, IServicesMgr, DocError } from './Managers';

const REACT_APP_ODS_SERVER = process.env.REACT_APP_ODS_SERVER || "";
const urlPath = `${REACT_APP_ODS_SERVER}/api/${sbomType}/`;

export { DocError } from './Managers';

export class EtlMgr {

    http: Http = Http.getInstance();
    private static instance: EtlMgr;

    constructor() { }

    public static init(): EtlMgr {
        if (this.instance !== undefined) {
            return this.instance;
        }
        this.instance = new EtlMgr();
        return this.instance;
    }

    public static getInstance(): EtlMgr {
        return this.init();
    }



    // async runAction(document: any, data: any): Promise<DocumentInfo | null> {
    //     if (!document || !document.id) {
    //         console.log(`runAction() error: Document id is missing`);
    //         throw new Error("DocMgr.runAction() - Document id missing");
    //     }
    //     console.log(`runAction(${document.id}) data=`, data)
    //     try {
    //         //const response = await this.http.post("/api/action/${type}/" + document.id, data);
    //         const response = await this.http.post("/api/action/" + document.id, data);
    //         console.log("runAction response=", response)
    //         const body = response.data;
    //         return body;
    //     } catch (e: any) {
    //         const err = new DocError(e);
    //         console.error(err);
    //         throw err;
    //     }
    // }

    // async getUserProfile(email: string): Promise<any> {
    //     console.log(`getProfile(${email})`);
    //     let url = `/api/profile/${email}/`;
    //     try {
    //         const response = await this.http.get(url);
    //         console.log("getProfile response=", response)
    //         return response.data;
    //     } catch (e: any) {
    //         console.error(new DocError(e));
    //     }
    //     return null;
    // }

    /**
     * Get all items that are in the process list.
     * Some may be complete, others may be underway or not started yet.
     * 
     * @returns 
     */
    async getList(name: string): Promise<any> {
        try {
            const response = await this.http.get(`${REACT_APP_ODS_SERVER}/api/service/list/${name}`);
            console.log("getList response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    /**
     * Process a list
     * 
     * @param cmd The command to run
     * @returns 
     */
    async process(cmd: string): Promise<any> {
        try {
            const response = await this.http.get(`${REACT_APP_ODS_SERVER}/api/service/process/${cmd}`);
            console.log("retrieveNew response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    /**
     * Process a command with post
     * 
     * @param cmd The command to run
     * @returns 
     */
    async processPost(cmd: string, data: any): Promise<any> {
        try {
            const response = await this.http.post(`${REACT_APP_ODS_SERVER}/api/service/process/${cmd}`, data);
            console.log("retrieveNew response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    
    async getStatus(): Promise<any> {
        try {
            const response = await this.http.get(`${REACT_APP_ODS_SERVER}/api/service/process/status`);
            // console.log("status response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    
}


