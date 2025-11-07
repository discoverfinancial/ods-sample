/**
 * Copyright (c) 2025 Capital One
*/

import { storeType, StoreInfo, StoreSummary, StoreUpdate, StoreCreate } from '../common/common';
import { Http } from '../Http'
import { DocError } from './Managers';

const REACT_APP_ODS_SERVER = process.env.REACT_APP_ODS_SERVER || "";
const urlPath = `${REACT_APP_ODS_SERVER}/api/docs/${storeType}/`;

export { DocError } from './Managers';

export class StoreMgr  {

    http: Http = Http.getInstance();
    private static instance: StoreMgr;

    constructor() { }

    public static init(): StoreMgr {
        if (this.instance !== undefined) {
            return this.instance;
        }
        this.instance = new StoreMgr();
        return this.instance;
    }

    public static getInstance(): StoreMgr {
        return this.init();
    }

    /**
     * Create a blank document object.
     * Optionally set the id
     * 
     * @returns {Document}
     */
    createBlankDocument() : StoreInfo {
        let doc: StoreInfo = {
            id: "",
            schemaVersion: "1",
            key: "",
            value: {},
            state: "created",
            dateCreated: Date.now(),
            dateUpdated: Date.now(),
            stateHistory: [{state: "created", date: 0, email: ""}],
            comments: [],
            attachments: [],
            owner: {
                id: '',
                roles: [],
                name: '',
                department: '',
                email: '',
                title: '',
                employeeNumber: ''
            },
            public: false
        };
        return doc;
    }

    async createDocument(data?:StoreCreate): Promise<StoreInfo | null> {
        try {
            const response = await this.http.put(urlPath, data);
            console.log("StoreMgr.createDocument response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    /**
     * Save document to peristent storage
     * 
     * @param document The document
     * @param key [Optional] Only the data for the key needs to be updated (comma separated string)
     */
    async saveDocument(document: any, key?: string): Promise<StoreInfo | null> {
        if (!document || !document.id) {
            console.log(`saveDocument() error: Document id is missing`);
            throw new Error("StoreMgr.saveDocument() - Document id missing");
        }
        console.log(`saveDocument(${key}) data=`, document)
        try {
            let data: any = {}
            if (key) {
                const parts = key.split(",");
                for (var part of parts) {
                    const i = part.trim();
                    copyDocField(data, document, i);
                }
            }
            else {
                data = {...document};
            }
            const removeKeys = ["id", "dateUpdated", "dateCreated", "stateHistory", "comments", "schemaVersion", "curStateRead", "curStateWrite"];
            for (const removeKey of removeKeys) {
                delete data[removeKey];
            }
            const response = await this.http.patch(urlPath + document.id, data);
            console.log("StoreMgr.saveDocument response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    isDocumentSaveable(document: any): boolean {
        return true;
    }

    async getDocument(id: string): Promise<StoreInfo | null> {
        console.log(`getDocument(${id})`)
        if (!id) {
            console.log(`getDocument() error: Document id is missing`);
            throw new Error("GuidanceMgr.getDocument() - Document id missing");
        }
        let document:StoreInfo;
        try {
            const response = await (this.http.get(urlPath + id))
            console.log("StoreMgr.getDocument response=", response)
            document = response.data;
            return document;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async getDocuments(config?: any) : Promise<StoreInfo[]> {
        console.log("StoreMgr.getDocuments() config=",config);
        return new Promise(async (resolve:any, reject:any) => {
            try {
                await this.http.postStream(urlPath, config, undefined, function(data: any, done: boolean) {
                    if (done) {
                        if (data.length > 0) {
                            console.log("StoreMgr.getDocuments[0] =", data[0]);
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
        console.log("StoreMgr.getDocumentsStream() config=",config);
        try {
            await this.http.postStream(urlPath, config, undefined, callback);
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async deleteDocument(id: string): Promise<boolean> {
        console.log(`deleteDocument(${id})`);
        if (!id) {
            console.log(`deleteDocument() error: Document id is missing`);
            throw new Error("GuidanceMgr.deleteDocument() - Document id missing");
        }
        try {
            const response = await this.http.delete(urlPath + id);
            console.log("StoreMgr.deleteDocument response=", response)
            return true;
        } catch (e: any) {
            console.error(new DocError(e));
            return false;
        }
    }

    async deleteDocuments(): Promise<void> {
        console.log("StoreMgr.deleteDocuments()");
        const documents = await this.getDocuments();
        documents.map(async (p) => {
            await this.deleteDocument(p.id);
        })
    }

    async deleteMany(match: any) : Promise<any> {
        console.log("StoreMgr.deleteMany() match=",match);
        if (!match) {
            console.log("StoreMgr.deleteMany error: match is required");
            throw new Error("StoreMgr.deleteMany error: match is required");
        }
        try {
            const response = await this.http.delete(urlPath + "?match=" + encodeURIComponent(JSON.stringify(match)));
            console.log("StoreMgr.deleteMany response=", response)
            return response.data;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }    

}


export const getDocField = (document: any, fieldName: string) => {
    const parts = fieldName.split(".");
    let obj = document;
    for (let i=0; i<parts.length; i++) {
        if (obj) {
            obj = obj[parts[i]];
        }
        else {
            return null;
        }
    }
    return obj;
}

export const setDocField = (document: any, fieldName: string, value: any) => {
    const parts = fieldName.split(".");
    let obj = document;
    const lenM1 = parts.length-1;
    for (let i=0; i<lenM1; i++) {
        let isArray = false;
        if (!obj.hasOwnProperty([parts[i]])) {
                if (i < lenM1 &&  parts[i+1] == "0") {
                    obj[parts[i]] = [];
                }
                else {
                    obj[parts[i]] = {};
                }
        }
        obj = obj[parts[i]];
    }
    // if (Array.isArray(obj)) {
    //     const key = parts[lenM1];
    //     obj.push({[key]: value});
    // }
    // else {
        obj[parts[lenM1]] = value;
    // }
}

export const copyDocField = (dest: any, src: any, fieldName: string) => {
    const parts = fieldName.split(".");
    dest[parts[0]] = src[parts[0]];
}
