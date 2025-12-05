/**
 * Copyright (c) 2025 Capital One
*/

import { EndoflifeInfo, endoflifeType } from '../common';
import { Http } from '../Http'
import { DocError } from './Managers';

const REACT_APP_ODS_SERVER = process.env.REACT_APP_ODS_SERVER || "";
const urlPath = `${REACT_APP_ODS_SERVER}/api/docs/${endoflifeType}/`;

export class EndoflifeMgr  {

    http: Http = Http.getInstance();
    private static instance: EndoflifeMgr;

    constructor() { }

    public static init(): EndoflifeMgr {
        if (this.instance !== undefined) {
            return this.instance;
        }
        this.instance = new EndoflifeMgr();
        return this.instance;
    }

    public static getInstance(): EndoflifeMgr {
        return this.init();
    }


    async getDocument(id: string): Promise<EndoflifeInfo | null> {
        console.log(`getDocument(${id})`)
        if (!id) {
            console.log(`getDocument() error: Document id is missing`);
            throw new Error("EndoflifeMgr.getDocument() - Document id missing");
        }
        let document:EndoflifeInfo;
        try {
            const response = await (this.http.get(urlPath + id))
            console.log("EndoflifeMgr.getDocument response=", response)
            document = response.data;
            return document;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }


    async getDocuments(config?: any) : Promise<EndoflifeInfo[]> {
        console.log("EndoflifeMgr.getDocuments() config=",config);
            return new Promise(async (resolve:any, reject:any) => { 
            try {
                this.http.postStream(urlPath, config, undefined, function(data: any, done: boolean) {
                    if (done) {
                        if (data.length > 0) {
                            console.log("EndoflifeMgr.getDocuments[0] =", data[0]);
                        }
                        return resolve(data);
                    }
                }, false);
            } catch (e: any) {
                const err = new DocError(e);
                console.error(err);
                return reject(err);
            }
        });
    }

    async getDocumentsStream(callback: any, config?: any) {
        console.log("EndoflifeMgr.getDocumentsStream() config=",config);
        try {
            await this.http.postStream(urlPath, config, undefined, callback);
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async deleteDocument(id: string): Promise<boolean> {
        console.log(`EndoflifeMgr.deleteDocument(${id})`);
        if (!id) {
            console.log(`deleteDocument() error: Document id is missing`);
            throw new Error("EndoflifeMgr.deleteDocument() - Document id missing");
        }
        try {
            const response = await this.http.delete(urlPath + id);
            console.log("EndoflifeMgr.deleteDocument response=", response)
            return true;
        } catch (e: any) {
            console.error(new DocError(e));
            return false;
        }
    }

}


