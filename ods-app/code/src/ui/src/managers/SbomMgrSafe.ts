/**
 * Copyright (c) 2025 Capital One
*/

import { SbomMgr } from './SbomMgr';
import { AttachmentInfo, SbomDocumentInfo, SbomDocumentCreate, CommentUpdate } from '../common';
import { Http } from '../Http'

export class SbomMgrSafe extends SbomMgr {

    http: Http = Http.getInstance();
    private static instanceSafe: SbomMgrSafe;

    public static init(): SbomMgrSafe {
        if (this.instanceSafe !== undefined) {
            return this.instanceSafe;
        }
        this.instanceSafe = new SbomMgrSafe();
        return this.instanceSafe;
    }

    public static getInstance(): SbomMgrSafe {
        return this.init();
    }

    createBlankDocument() : SbomDocumentInfo {
        throw new Error("Not allowed")
    }

    async createDocument(data?:SbomDocumentCreate): Promise<SbomDocumentInfo | null> {
        throw new Error("Not allowed")
    }

    async saveDocument(document: any, key?: string): Promise<SbomDocumentInfo | null> {
        throw new Error("Not allowed")
    }

    isDocumentSaveable(document: any): boolean {
        throw new Error("Not allowed")
    }

    async addComment(document: any, text: string, topic?: string, _private=false, approved?: string): Promise<SbomDocumentInfo | null> {
        throw new Error("Not allowed")
    }

    async deleteCommentForId(document: any, id: string): Promise<SbomDocumentInfo | null> {
        throw new Error("Not allowed")
    }

    async updateCommentForId(document: any, id: string, data: CommentUpdate): Promise<SbomDocumentInfo | null> {
        throw new Error("Not allowed")
    }

    async deleteDocument(id: string): Promise<boolean> {
        throw new Error("Not allowed")
    }

    async deleteDocuments(): Promise<void> {
        throw new Error("Not allowed")
    }

    async deleteMany(match: any) : Promise<any> {
        throw new Error("Not allowed")
    }    

    async deleteAttachment(documentId: string, attachmentId: string): Promise<AttachmentInfo[] | null> {
        throw new Error("Not allowed")
    }

    async uploadAttachment(documentId: string, file: File): Promise<AttachmentInfo[]> {
        throw new Error("Not allowed")
    }

}
