/**
 * Copyright (c) 2025 Capital One
*/

import { copyDocField } from '.';
import { sbomType, SbomDocument,  AttachmentInfo, SbomDocumentInfo, SbomDocumentCreate, CommentUpdate, CommentCreate } from '../common';
import { Http } from '../Http'
import { IAttachmentMgr, ICommentMgr, IDocMgr, DocError } from './Managers';

const REACT_APP_ODS_SERVER = process.env.REACT_APP_ODS_SERVER || ""
const urlPath = `${REACT_APP_ODS_SERVER}/api/docs/${sbomType}/`;

export class SbomMgr implements IDocMgr<SbomDocument>, IAttachmentMgr, ICommentMgr<SbomDocument> {

    http: Http = Http.getInstance();
    private static instance: SbomMgr;

    constructor() { }

    public static init(): SbomMgr {
        if (this.instance !== undefined) {
            return this.instance;
        }
        this.instance = new SbomMgr();
        return this.instance;
    }

    public static getInstance(): SbomMgr {
        return this.init();
    }

    /**
     * Create a blank document object.
     * Optionally set the id
     * 
     * @returns {Document}
     */
    createBlankDocument() : SbomDocumentInfo {
        let doc: SbomDocumentInfo = {
            id: "",
            bomFormat: "CycloneDX",
            specVersion: "1.6",
            state: "created",
            dateCreated: Date.now(),
            dateUpdated: Date.now(),
            stateHistory: [{state: "created", date: 0, email: ""}],
            comments: [],
            attachments: [],
        };
        return doc;
    }

    async createDocument(data?:SbomDocumentCreate): Promise<SbomDocumentInfo | null> {
        try {
            const response = await this.http.put(urlPath, data);
            console.log("SbomMgr.createDocument response=", response)
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
    async saveDocument(document: any, key?: string): Promise<SbomDocumentInfo | null> {
        if (!document || !document.id) {
            console.log(`saveDocument() error: Document id is missing`);
            throw new Error("SbomMgr.saveDocument() - Document id missing");
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
            const response = await this.http.patch(urlPath + encodeURIComponent(document.id), data);
            console.log("SbomMgr.saveDocument response=", response)
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

    async addComment(document: any, text: string, topic?: string, _private=false, approved?: string): Promise<SbomDocumentInfo | null> {
        if (!document || !document.id) {
            console.log(`addComment() error: Document id is missing`);
            throw new Error("SbomMgr.addComment() - Document id missing");
        }
        console.log(`addComment(${document.id}) text=${text} topic=${topic} private=${_private})`)
        try {
            let data:CommentCreate = {text: text, topic: topic || "", private: _private, approved: approved || ""}
            const response = await this.http.put(urlPath + encodeURIComponent(document.id) + "/comment", data);
            console.log("SbomMgr.addComment response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async deleteCommentForId(document: any, id: string): Promise<SbomDocumentInfo | null> {
        if (!document || !document.id) {
            console.log(`deleteCommentForId() error: Document id is missing`);
            throw new Error("SbomMgr.deleteCommentForId() - Document id missing");
        }
        console.log(`deleteCommentForId(${document.id}) index=${id})`)
        try {
            const response = await this.http.delete(urlPath + encodeURIComponent(document.id) + "/comment/" + id);
            console.log("SbomMgr.deleteCommentForId response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async updateCommentForId(document: any, id: string, data: CommentUpdate): Promise<SbomDocumentInfo | null> {
        if (!document || !document.id) {
            console.log(`updateCommentForId() error: Document id is missing`);
            throw new Error("SbomMgr.updateCommentForId() - Document id missing");
        }
        console.log(`updateCommentForId(${document.id}) id=${id})`)
        try {
            const response = await this.http.patch(urlPath + encodeURIComponent(document.id) + "/comment/" + id, data);
            console.log("SbomMgr.updateComment response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async getDocument(id: string): Promise<SbomDocumentInfo | null> {
        console.log(`getDocument(${id})`)
        if (!id) {
            console.log(`getDocument() error: Document id is missing`);
            throw new Error("SbomMgr.getDocument() - Document id missing");
        }
        let document:SbomDocumentInfo;
        try {
            const response = await (this.http.get(urlPath + encodeURIComponent(id)))
            console.log("SbomMgr.getDocument response=", response)
            document = response.data;
            return document;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async getDocumentForBomRef(bomRef: string): Promise<SbomDocumentInfo | null> {
        console.log(`getDocumentForBomRef(${bomRef})`)
        if (!bomRef) {
            console.log(`getDocumentForBomRef() error: Document bomRef is missing`);
            throw new Error("SbomMgr.getDocumentForBomRef() - Document bomRef missing");
        }
        try {
            const _bomRef = JSON.parse(bomRef);
            const match:any = {};
            if (_bomRef.name) {
                match["metadata.component.name"] = _bomRef.name;
            }
            if (_bomRef.version) {
                match["metadata.component.version"] = _bomRef.version;
            }
            if (_bomRef.group) {
                match["metadata.component.group"] =  _bomRef.group;
            }
            if (_bomRef.type) {
                match["metadata.component.type"] = _bomRef.type;
            }
            if (_bomRef.purl) {
                match["metadata.component.purl"] = _bomRef.purl;
            }
            const params = {
                "params": {
                    "match": match,
                }
            }
            const response = await this.http.post(urlPath, params);
            if (response.data.items.length > 0) {
                return response.data.items[0];
            }
            throw new Error("Not Found")
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async getDocuments(config?: any) : Promise<SbomDocumentInfo[]> {
        console.log("SbomMgr.getDocuments() config=",config);
        return new Promise(async (resolve:any, reject:any) => {
            try {
                await this.http.postStream(urlPath, config, undefined, function(data: any, done: boolean) {
                    if (done) {
                        if (data.length > 0) {
                            console.log("SbomMgr.getDocuments[0] =", data[0]);
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
        console.log("SbomMgr.getDocumentsStream() config=",config);
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
            throw new Error("SbomMgr.deleteDocument() - Document id missing");
        }
        try {
            const response = await this.http.delete(urlPath + encodeURIComponent(id));
            console.log("SbomMgr.deleteDocument response=", response)
            return true;
        } catch (e: any) {
            console.error(new DocError(e));
            return false;
        }
    }

    async deleteDocuments(): Promise<void> {
        console.log("SbomMgr.deleteDocuments()");
        const documents = await this.getDocuments();
        documents.map(async (p) => {
            await this.deleteDocument(p.id);
        })
    }

    async deleteMany(match: any) : Promise<any> {
        console.log("SbomMgr.deleteMany() match=",match);
        if (!match) {
            console.log("SbomMgr.deleteMany error: match is required");
            throw new Error("SbomMgr.deleteMany error: match is required");
        }
        try {
            const response = await this.http.delete(urlPath + "?match=" + encodeURIComponent(JSON.stringify(match)));
            console.log("SbomMgr.deleteMany response=", response)
            return response.data;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async deleteAttachment(documentId: string, attachmentId: string): Promise<AttachmentInfo[] | null> {
        console.log(`deleteAttachment(${documentId}, ${attachmentId})`);
        let url = `${REACT_APP_ODS_SERVER}/api/docs/${sbomType}/${encodeURIComponent(documentId)}/attachments/${attachmentId}`;
        try {
            const response = await this.http.delete(url);
            console.log("SbomMgr.deleteAttachment response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            console.error(new DocError(e));
        }
        return null;
    }

    /**
     * Upload an attachment to a document.
     * This saves the attachment content in database & adds attachment metadata to document.attachments
     * 
     * @param documentId 
     * @param file 
     * @returns AttachmentInfo[] The new list of attachments for the document
     */
    async uploadAttachment(documentId: string, file: File): Promise<AttachmentInfo[]> {
        console.log(`uploadAttachment()`);
        console.log("SbomMgr.file=", file)

        const formData = new FormData();
        formData.append("file", file);

        let url = `${REACT_APP_ODS_SERVER}/api/docs/${sbomType}/${encodeURIComponent(documentId)}/attachments/`;
        try {
            const response = await this.http.put(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
            console.log("SbomMgr.uploadAttachment response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            console.error(new DocError(e));
        }
        return [];
    }
}
