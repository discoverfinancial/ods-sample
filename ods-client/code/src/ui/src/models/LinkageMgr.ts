/**
 * Copyright (c) 2025 Capital One
*/

import { LinkageInfo, linkageType } from '../common/common';
import { Http } from '../Http'
import { DocError } from './Managers';

const REACT_APP_ODS_SERVER = process.env.REACT_APP_ODS_SERVER || "";
const urlPath = `${REACT_APP_ODS_SERVER}/api/docs/${linkageType}/`;

export { DocError } from './Managers';

export class LinkageMgr  {

    http: Http = Http.getInstance();
    private static instance: LinkageMgr;

    constructor() { }

    public static init(): LinkageMgr {
        if (this.instance !== undefined) {
            return this.instance;
        }
        this.instance = new LinkageMgr();
        return this.instance;
    }

    public static getInstance(): LinkageMgr {
        return this.init();
    }


    async getDocument(id: string): Promise<LinkageInfo | null> {
        console.log(`getDocument(${id})`)
        if (!id) {
            console.log(`getDocument() error: Document id is missing`);
            throw new Error("LinkageMgr.getDocument() - Document id missing");
        }
        let document:LinkageInfo;
        try {
            const response = await (this.http.get(urlPath + id))
            console.log("LinkageMgr.getDocument response=", response)
            document = response.data;
            return document;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }


    async getDocuments(config?: any) : Promise<LinkageInfo[]> {
        console.log("LinkageMgr.getDocuments() config=",config);
            return new Promise(async (resolve:any, reject:any) => { 
            try {
                this.http.postStream(urlPath, config, undefined, function(data: any, done: boolean) {
                    if (done) {
                        if (data.length > 0) {
                            console.log("LinkageMgr.getDocuments[0] =", data[0]);
                        }
                        return resolve(data);
                    }
                }, false);
            } catch (e: any) {
                const err = new DocError(e);
                console.error(err);
                // throw err;
                return reject(err);
            }
        });
    }

    async getDocumentsStream(callback: any, config?: any) {
        console.log("LinkageMgr.getDocumentsStream() config=",config);
        try {
            await this.http.postStream(urlPath, config, undefined, callback);
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

}


