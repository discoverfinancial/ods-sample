/**
 * Copyright (c) 2025 Capital One
*/

import { AttachmentInfo, CommentUpdate, Person, UserGroupInfo } from '../common';

export interface IDocMgr<Type> {

    createBlankDocument(): Type;

    createDocument(data?: Type): Promise<Type | null>;

    saveDocument(document: any, key: string): Promise<Type | null>;

    isDocumentSaveable(document: any): boolean;

    getDocument(id: string): Promise<Type | null>;

    getDocuments(config?: any): Promise<Type[]>;

    deleteDocument(id: string): Promise<boolean>;

    deleteDocuments(): Promise<void>;
}

export interface IActionMgr<Type> {

    runAction(document: any, data: any): Promise<Type | null>;
    
}

export interface IAttachmentMgr {

    deleteAttachment(documentId: string, attachmentId: string): Promise<AttachmentInfo[] | null>;

    uploadAttachment(documentId: string, file: File): Promise<AttachmentInfo[]>;

}

export interface IServicesMgr {

    getUserProfile(email: string): Promise<any>;

}

export interface ICommentMgr<Type> {

    addComment(document: any, text: string, topic?: string, _private?: boolean, approved?: string): Promise<Type | null>;

    deleteCommentForId(document: any, id: string): Promise<Type | null>;

    updateCommentForId(document: any, id: string, data: CommentUpdate): Promise<Type | null>;

}

export interface IUserGroupMgr {

    getUserGroups(): Promise<UserGroupInfo[]>;

    getUserGroup(name: string): Promise<UserGroupInfo>;

    setUserGroup(name: string, members: Person[]): Promise<UserGroupInfo>;

    createUserGroup(name: string, members: Person[]): Promise<UserGroupInfo>;

    deleteUserGroup(name: string): Promise<boolean>;

}

export class DocError {
    status: number;
    statusText: string;
    message: string;
    details: any;
    labels: any;

    constructor(e:any) {
        if (e.response) {
            this.status = e.response.status;
            this.statusText = (this.status && this.status === 422) ? "Invalid Parameters" : (e.response.data.statusText || e.response.statusText);
            this.message = e.response.data.message;
            this.details = e.response.data.details;
        }
        else if (e.status) {
            this.status = e.status;
            this.statusText = e.statusText;
            this.message = e.message;
        }
        else if (e.message == "Network Error") {
            this.status = 500;
            this.statusText = "Network Error"
            this.message = "It could be that you don't have an internet connection, or the server is down."
        }
        else {
            console.log("DocError: Unknow error=",e,"json=",(JSON.stringify(e)));
            this.status = 500;
            this.statusText = "Unknown error calling server"
            this.message = "Unknown error calling server"
        }
    }

    getStatus():number {
        return this.status;
    }
    getStatusText():string {
        return this.statusText;
    }
    getMessage():string {
        return this.message;
    }
    toString():string {
        return `Http error: status=${this.getStatus()} statusText="${this.getStatusText()}" message="${this.getMessage()}`;
    }
    toString1(): string {
        return JSON.stringify(this);
    }
}

export const throwTestError = () => {
    throw new DocError({status:505, statusText: "Test Message", message: "This is a test error message thrown by Managers.throwTestError()."});
}
