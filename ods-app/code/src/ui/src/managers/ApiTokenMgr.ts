/**
 * Copyright (c) 2025 Capital One
*/

import { ApiToken, ApiTokenCreate, ApiTokenInfo, apitokenType } from '../common';
import { Http } from '../Http'
import { copyDocField } from '.';
import { DocError, IDocMgr } from './Managers';

const REACT_APP_ODS_SERVER = process.env.REACT_APP_ODS_SERVER || "";
const urlPath = `${REACT_APP_ODS_SERVER}/api/docs/${apitokenType}/`;

export class ApiTokenMgr implements IDocMgr<ApiToken> {

    http: Http = Http.getInstance();
    private static instance: ApiTokenMgr;

    constructor() { }

    public static init(): ApiTokenMgr {
        if (this.instance !== undefined) {
            return this.instance;
        }
        this.instance = new ApiTokenMgr();
        return this.instance;
    }

    public static getInstance(): ApiTokenMgr {
        return this.init();
    }

    /**
     * Create a blank document object.
     * Optionally set the id
     * 
     * @returns {Document}
     */
    createBlankDocument() : ApiTokenInfo {
        let doc: ApiTokenInfo = {
            id: "",
            name: "",
            value: "",
            expirationDate: 0,
            schemaVersion: "1",
            state: "created",
            dateCreated: Date.now(),
            dateUpdated: Date.now(),
            stateHistory: [{ state: "created", date: 0, email: "" }],
            comments: [],
            attachments: [],
        };
        return doc;
    }

    async createDocument(data?:ApiTokenCreate): Promise<ApiTokenInfo | null> {
        try {
            if (!data) {
                return null;
            }
            if (!data.expirationDate) {
                // api token expires in a year by default
                data.expirationDate = Date.now() + (60*60*24*365)*1000;
            }
            const createResponse = await this.http.put(urlPath, data);
            console.log("ApiTokenMgr.createDocument response=", createResponse)
            const body = createResponse.data;
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
    async saveDocument(document: any, key?: string): Promise<ApiTokenInfo | null> {
        if (!document || !document.id) {
            console.log(`saveDocument() error: Document id is missing`);
            throw new Error("ApiTokenMgr.saveDocument() - Document id missing");
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
            console.log("ApiTokenMgr.saveDocument response=", response)
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

    async getDocument(id: string): Promise<ApiTokenInfo | null> {
        console.log(`getDocument(${id})`)
        if (!id) {
            console.log(`getDocument() error: Document id is missing`);
            throw new Error("GuidanceMgr.getDocument() - Document id missing");
        }
        let document:ApiTokenInfo;
        try {
            const response = await (this.http.get(urlPath + id))
            console.log("ApiTokenMgr.getDocument response=", response)
            document = response.data;
            return document;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async getDocumentForName(name: string): Promise<ApiTokenInfo | null> {
        console.log(`getDocumentForName(${name})`)
        if (!name) {
            console.log(`getDocumentForName() error: Document id is missing`);
            throw new Error("ApiTokenMgr.getDocumentForName() - Document id missing");
        }
        let document:ApiTokenInfo;
        try {
            const config = {
                params: {
                    match: { "data.name": name },
                }
            }
            const response = await this.http.post(urlPath, config);
            console.log("ApiTokenMgr.getDocument response=", response)
            if (response.data.count > 0) {
                document = response.data.items[0];
                return document;
            }
            return null;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async getDocuments(config?: any) : Promise<ApiTokenInfo[]> {
        console.log("ApiTokenMgr.getDocuments() config=",config);
        return new Promise(async (resolve:any, reject:any) => {
            try {
                await this.http.postStream(urlPath, config, undefined, function(data: any, done: boolean) {
                    if (done) {
                        if (data.length > 0) {
                            console.log("ApiTokenMgr.getDocuments[0] =", data[0]);
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
        console.log("ApiTokenMgr.getDocumentsStream() config=",config);
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
            console.log("ApiTokenMgr.deleteDocument response=", response)
            return true;
        } catch (e: any) {
            console.error(new DocError(e));
            return false;
        }
    }

    async deleteDocuments(): Promise<void> {
        console.log("ApiTokenMgr.deleteDocuments()");
        const documents = await this.getDocuments();
        documents.map(async (p) => {
            await this.deleteDocument(p.id);
        })
    }

    async deleteMany(match: any) : Promise<any> {
        console.log("ApiTokenMgr.deleteMany() match=",match);
        if (!match) {
            console.log("ApiTokenMgr.deleteMany error: match is required");
            throw new Error("ApiTokenMgr.deleteMany error: match is required");
        }
        try {
            const response = await this.http.delete(urlPath + "?match=" + encodeURIComponent(JSON.stringify(match)));
            console.log("ApiTokenMgr.deleteMany response=", response)
            return response.data;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }    
}