/**
 * Copyright (c) 2025 Capital One
*/

import { copyDocField } from '.';
import { ScriptInfo, ScriptCreate, scriptType } from '../common';
import { Http } from '../Http'
import { DocError } from './Managers';

const REACT_APP_ODS_SERVER = process.env.REACT_APP_ODS_SERVER || "";
const urlPath = `${REACT_APP_ODS_SERVER}/api/docs/${scriptType}/`;

export class ScriptMgr  {

    http: Http = Http.getInstance();
    private static instance: ScriptMgr;

    constructor() { }

    public static init(): ScriptMgr {
        if (this.instance !== undefined) {
            return this.instance;
        }
        this.instance = new ScriptMgr();
        return this.instance;
    }

    public static getInstance(): ScriptMgr {
        return this.init();
    }

    /**
     * Create a blank document object.
     * Optionally set the id
     * 
     * @returns {Document}
     */
    createBlankDocument() : ScriptInfo {
        let doc: ScriptInfo = {
            id: "",
            schemaVersion: "1",
            state: "created",
            dateCreated: Date.now(),
            dateUpdated: Date.now(),
            stateHistory: [{ state: "created", date: 0, email: "" }],
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
            script: '',
            name: '',
            tag: '',
            description: '',
            public: false,
            type: '',
            parameters: '',
            cronJob: '',
            cronRunAt: '',
            view: ''
        };
        return doc;
    }

    async createDocument(data?:ScriptCreate): Promise<ScriptInfo | null> {
        try {
            const response = await this.http.put(urlPath, data);
            console.log("ScriptMgr.createDocument response=", response)
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
    async saveDocument(document: any, key?: string): Promise<ScriptInfo | null> {
        if (!document || !document.id) {
            console.log(`ScriptMgr.saveDocument() error: Document id is missing`);
            throw new Error("ScriptMgr.saveDocument() - Document id missing");
        }
        console.log(`ScriptMgr.saveDocument(${key}) data=`, document)
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
            console.log("ScriptMgr.saveDocument response=", response)
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

    async getDocument(id: string): Promise<ScriptInfo | null> {
        console.log(`ScriptMgr.getDocument(${id})`)
        if (!id) {
            console.log(`ScriptMgr.getDocument() error: Document id is missing`);
            throw new Error("ScriptMgr.getDocument() - Document id missing");
        }
        let document:ScriptInfo;
        try {
            const response = await (this.http.get(urlPath + id))
            console.log("ScriptMgr.getDocument response=", response)
            document = response.data;
            return document;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async getDocuments(config?: any) : Promise<ScriptInfo[]> {
        console.log("ScriptMgr.getDocuments() config=",config);
        return new Promise(async (resolve:any, reject:any) => {
            try {
                await this.http.postStream(urlPath, config, undefined, function(data: any, done: boolean) {
                    if (done) {
                        if (data.length > 0) {
                            console.log("ScriptMgr.getDocuments[0] =", data[0]);
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
        console.log("ScriptMgr.getDocumentsStream() config=",config);
        try {
            await this.http.postStream(urlPath, config, undefined, callback);
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async deleteDocument(id: string): Promise<boolean> {
        console.log(`ScriptMgr.deleteDocument(${id})`);
        if (!id) {
            console.log(`ScriptMgr.deleteDocument() error: Document id is missing`);
            throw new Error("ScriptMgr.deleteDocument() - Document id missing");
        }
        try {
            const response = await this.http.delete(urlPath + id);
            console.log("ScriptMgr.deleteDocument response=", response)
            return true;
        } catch (e: any) {
            console.error(new DocError(e));
            return false;
        }
    }

    async deleteDocuments(): Promise<void> {
        console.log("ScriptMgr.deleteDocuments()");
        const documents = await this.getDocuments();
        documents.map(async (p) => {
            await this.deleteDocument(p.id);
        })
    }

    async deleteMany(match: any) : Promise<any> {
        console.log("ScriptMgr.deleteMany() match=",match);
        if (!match) {
            console.log("ScriptMgr.deleteMany error: match is required");
            throw new Error("ScriptMgr.deleteMany error: match is required");
        }
        try {
            const response = await this.http.delete(urlPath + "?match=" + encodeURIComponent(JSON.stringify(match)));
            console.log("ScriptMgr.deleteMany response=", response)
            return response.data;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }  
    
    async runScript(data: any, type?: string): Promise<any> {
        return new Promise(async (resolve:any, reject:any) => {
            try {
                const params = type ? `?type=${type}` : "";
                await this.http.postStream(`${REACT_APP_ODS_SERVER}/api/script/run${params}`, data, undefined, function(result: string, done: boolean) {
                    if (done) {
                        console.log("Result: ", result)
                        return resolve(result);
                    }
                }, false);
            } catch (e: any) {
                const err = new DocError(e);
                console.error(err);
                return reject(err);
            }
        });
    }

    async runScriptId(id: string, data: any): Promise<any> {
        try {
            const response = await this.http.post(`${REACT_APP_ODS_SERVER}/api/script/run/${id}`, data);
            console.log("runUserScriptId response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async stopScript(): Promise<any> {
    }
}
