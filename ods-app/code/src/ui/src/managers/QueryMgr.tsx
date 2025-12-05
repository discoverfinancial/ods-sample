/**
 * Copyright (c) 2025 Capital One
*/

import { copyDocField } from '.';
import { queryType, QueryInfo, QueryCreate } from '../common';
import { Http } from '../Http'
import { DocError } from './Managers';

const REACT_APP_ODS_SERVER = process.env.REACT_APP_ODS_SERVER || "";
const urlPath = `${REACT_APP_ODS_SERVER}/api/docs/${queryType}/`;

export class QueryMgr  {

    http: Http = Http.getInstance();
    private static instance: QueryMgr;

    constructor() { }

    public static init(): QueryMgr {
        if (this.instance !== undefined) {
            return this.instance;
        }
        this.instance = new QueryMgr();
        return this.instance;
    }

    public static getInstance(): QueryMgr {
        return this.init();
    }

    /**
     * Create a blank document object.
     * Optionally set the id
     * 
     * @returns {Document}
     */
    createBlankDocument() : QueryInfo {
        let doc: QueryInfo = {
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
            query: '',
            name: '',
            tag: '',
            description: '',
            database: '',
            projection: '',
            sort: '',
            limit: 0,
            public: false
        };
        return doc;
    }

    async createDocument(data?:QueryCreate): Promise<QueryInfo | null> {
        try {
            const response = await this.http.put(urlPath, data);
            console.log("QueryMgr.createDocument response=", response)
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
    async saveDocument(document: any, key?: string): Promise<QueryInfo | null> {
        if (!document || !document.id) {
            console.log(`saveDocument() error: Document id is missing`);
            throw new Error("QueryMgr.saveDocument() - Document id missing");
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
            console.log("QueryMgr.saveDocument response=", response)
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

    async getDocument(id: string): Promise<QueryInfo | null> {
        console.log(`getDocument(${id})`)
        if (!id) {
            console.log(`getDocument() error: Document id is missing`);
            throw new Error("GuidanceMgr.getDocument() - Document id missing");
        }
        let document:QueryInfo;
        try {
            const response = await (this.http.get(urlPath + id))
            console.log("QueryMgr.getDocument response=", response)
            document = response.data;
            return document;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async getDocuments(config?: any) : Promise<QueryInfo[]> {
        console.log("QueryMgr.getDocuments() config=",config);
        return new Promise(async (resolve:any, reject:any) => {
            try {
                await this.http.postStream(urlPath, config, undefined, function(data: any, done: boolean) {
                    if (done) {
                        if (data.length > 0) {
                            console.log("QueryMgr.getDocuments[0] =", data[0]);
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
        console.log("QueryMgr.getDocumentsStream() config=",config);
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
            console.log("QueryMgr.deleteDocument response=", response)
            return true;
        } catch (e: any) {
            console.error(new DocError(e));
            return false;
        }
    }

    async deleteDocuments(): Promise<void> {
        console.log("QueryMgr.deleteDocuments()");
        const documents = await this.getDocuments();
        documents.map(async (p) => {
            await this.deleteDocument(p.id);
        })
    }

    async deleteMany(match: any) : Promise<any> {
        console.log("QueryMgr.deleteMany() match=",match);
        if (!match) {
            console.log("QueryMgr.deleteMany error: match is required");
            throw new Error("QueryMgr.deleteMany error: match is required");
        }
        try {
            const response = await this.http.delete(urlPath + "?match=" + encodeURIComponent(JSON.stringify(match)));
            console.log("QueryMgr.deleteMany response=", response)
            return response.data;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }    
    
}
