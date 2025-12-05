/**
 * Copyright (c) 2025 Capital One
*/

import { copyDocField } from '.';
import { guidanceType, GuidanceInfo, GuidanceCreate } from '../common';
import { Http } from '../Http'
import { DocError } from './Managers';

const REACT_APP_ODS_SERVER = process.env.REACT_APP_ODS_SERVER || "";
const urlPath = `${REACT_APP_ODS_SERVER}/api/docs/${guidanceType}/`;

export class GuidanceMgr  {

    http: Http = Http.getInstance();
    private static instance: GuidanceMgr;

    constructor() { }

    public static init(): GuidanceMgr {
        if (this.instance !== undefined) {
            return this.instance;
        }
        this.instance = new GuidanceMgr();
        return this.instance;
    }

    public static getInstance(): GuidanceMgr {
        return this.init();
    }

    /**
     * Create a blank document object.
     * Optionally set the id
     * 
     * @returns {Document}
     */
    createBlankDocument() : GuidanceInfo {
        let doc: GuidanceInfo = {
            id: "",
            schemaVersion: "",
            updatedBy: [],
            tier: "",
            nMinus: "",
            title: "",
            description: "",
            depsdevVersions: [],
            pci: { preferredVersion: { minimum: "" } },
            nonPci: { preferredVersion: { minimum: "" } },
            state: "created",
            dateCreated: Date.now(),
            dateUpdated: Date.now(),
            stateHistory: [{ state: "created", date: 0, email: "" }],
            comments: [],
            attachments: [],
            item: {
                basePurl: '',
                name: ''
            },
        };
        return doc;
    }

    async createDocument(data?:GuidanceCreate): Promise<GuidanceInfo | null> {
        try {
            const _data:any = {...data};
            delete _data.id;
            delete _data.state;
            delete _data.dateCreated;
            delete _data.dateUpdated;
            delete _data.stateHistory;
            delete _data.comments;
            delete _data.schemaVersion;
            delete _data.updatedBy;
            delete _data.curStateRead;
            delete _data.curStateWrite;
            const response = await this.http.put(urlPath, _data);
            console.log("GuidanceMgr.createDocument response=", response)
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
    async saveDocument(document: any, key?: string): Promise<GuidanceInfo | null> {
        console.log(`GuidanceMgr.saveDocument(${key}) data=`, document)
        const id = document.id;
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
            const removeKeys = ["id", "dateUpdated", "dateCreated", "stateHistory", "comments", "schemaVersion", "updatedBy", "curStateRead", "curStateWrite"];
            for (const removeKey of removeKeys) {
                delete data[removeKey];
            }
            const response = await this.http.patch(urlPath + id, data);
            console.log("GuidanceMgr.saveDocument response=", response)
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

    async getDocument(id: string): Promise<GuidanceInfo | null> {
        console.log(`getDocument(${id})`)
        if (!id) {
            console.log(`GuidanceMgr.getDocument() error: Document id is missing`);
            throw new Error("GuidanceMgr.getDocument() - Document id missing");
        }
        let document:GuidanceInfo;
        try {
            const response = await (this.http.get(urlPath + id))
            console.log("GuidanceMgr.getDocument response=", response)
            document = response.data;
            return document;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async getDocumentForItem(basePurl: string): Promise<GuidanceInfo | null> {
        console.log(`GuidanceMgr.getDocumentForItem(${basePurl})`)
        if (!basePurl) {
            console.log(`GuidanceMgr.getDocumentForItem() error: Document basePurl is missing`);
            throw new Error("GuidanceMgr.getDocumentForItem() - Document basePurl missing");
        }
        const config = {
            params: {
                match: {
                    //@TODO: replace with match & options
                    aggregate: [
                        {$match: { "item.basePurl": basePurl }},
                        {$sort: { dateUpdated: -1 }},
                        {$limit: 1},
                    ]
                }
            }
        }
        let document:GuidanceInfo;
        try {
            const response = await this.http.post(urlPath, config);
            console.log("GuidanceMgr.getDocumentForItem response=", response)
            if (response.data.items.length) {
                document = response.data.items[0];
                return document;
            }
            throw new DocError({status: 404, message: "Not found"});
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async getDocuments(config?: any) : Promise<GuidanceInfo[]> {
        console.log("GuidanceMgr.getDocuments() config=",config);
        return new Promise(async (resolve:any, reject:any) => {
            try {
                await this.http.postStream(urlPath, config, undefined, function(data: any, done: boolean) {
                    if (done) {
                        if (data.length > 0) {
                            console.log("GuidanceMgr.getDocuments[0] =", data[0]);
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
        console.log("GuidanceMgr.getDocumentsStream() config=",config);
        try {
            await this.http.postStream(urlPath, config, undefined, callback);
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async deleteDocument(id: string): Promise<boolean> {
        console.log(`GuidanceMgr.deleteDocument(${id})`);
        if (!id) {
            console.log(`GuidanceMgr.deleteDocument() error: Document id is missing`);
            throw new Error("GuidanceMgr.deleteDocument() - Document id missing");
        }
        try {
            const response = await this.http.delete(urlPath + id);
            console.log("GuidanceMgr.deleteDocument response=", response)
            return true;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            return false;
        }
    }

    async deleteDocuments(): Promise<void> {
        console.log("GuidanceMgr.deleteDocuments()");
        const documents = await this.getDocuments();
        documents.map(async (p) => {
            await this.deleteDocument(p.id);
        })
    }

    async deleteMany(match: any) : Promise<any> {
        console.log("GuidanceMgr.deleteMany() match=",match);
        if (!match) {
            console.log("GuidanceMgr.deleteMany error: match is required");
            throw new Error("GuidanceMgr.deleteMany error: match is required");
        }
        try {
            const response = await this.http.delete(urlPath + "?match=" + encodeURIComponent(JSON.stringify(match)));
            console.log("GuidanceMgr.deleteMany response=", response)
            return response.data;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }    

}


