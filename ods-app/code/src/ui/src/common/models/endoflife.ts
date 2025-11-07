/**
 * Copyright (c) 2025 Capital One
*/

import { AttachmentInfo, CommentCreate, CommentInfo, StateHistory, User } from "./base";

export const endoflifeType = "endoflife";

export type EndoflifeInfoOptional = Partial<EndoflifeInfo>;

export interface EndoflifeInfo extends Endoflife {
    stateHistory: StateHistory[];
    comments: CommentInfo[];
    attachments?: AttachmentInfo[];
}

export interface EndoflifeSummary extends Endoflife {
    schemaVersion: string;
    curStateRead?: string[]; // cache of current state read group
    curStateWrite?: string[]; // cache of current state write group
}

export interface EndoflifeCreate  {
    data: any;
}

export interface EndoflifeUpdate {
    data?: any;

    state?: string;
    comment?: CommentCreate;
    attachments?: AttachmentInfo[];
}

export interface Endoflife  {
    id: string;
    state: string;
    schemaVersion: string;

    dateCreated: number;
    dateUpdated: number;

    comment?: CommentCreate;

    curStateRead?: string[]; // cache of current state read group
    curStateWrite?: string[]; // cache of current state write group

    data: any;
}


export interface EndoflifeReport {
    stage: string;
    applicationId: string;
    evaluationDate: string;
    latestReportHtmlUrl: string;
    reportHtmlUrl: string;
    embeddableReportHtmlUrl: string;
    reportPdfUrl: string;
    reportDataUrl: string;
}

export interface EndoflifeManagement {
    email: string;
    uid: string;
    title: string;
    name: string;
    level: string;
}

export interface EndoflifeVersion {
    id: string;
    repository: string;
    format: string;
    group: string;
    name: string;
    version: string;
    assets: EndoflifeAsset[];
}

export interface EndoflifeAsset {
    id: string;
    downloadUrl: string;
    path: string;
    repository: string;
    format: string;
    contentType: string;
    lastModified: string;
    fileSize: number;
    [key: string]: any; // Allow additional properties
}