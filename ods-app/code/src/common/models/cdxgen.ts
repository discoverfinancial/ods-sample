/**
 * Copyright (c) 2025 Capital One
*/

// import { AttachmentInfo, CommentCreate, CommentInfo } from "./base";

export const cdxgenType = "cdxgen";

// Document properties

interface CdxgenBase {
    url: string;
    multiProject: boolean;
    type: string;
}


// Retrieval interfaces

export interface Cdxgen extends CdxgenBase {
    id: string;
    state: string;
    dateCreated: number;
    dateUpdated: number;
}

export interface CdxgenSummary extends Cdxgen {
    schemaVersion: string;
    curStateRead?: string[]; // cache of current state read group
    curStateWrite?: string[]; // cache of current state write group
}

export interface CdxgenInfo extends CdxgenSummary {
    // stateHistory: StateHistory[];
    // comments: CommentInfo[];
    // attachments?: AttachmentInfo[];
}

// Create/update interfaces

export type CdxgenBaseOptional = Partial<CdxgenBase>

export interface CdxgenCreate extends CdxgenBase {
    sbomId?: string;
}

export interface CdxgenUpdate extends CdxgenBaseOptional {
    state?: string;
    sbomId?: string;
    // comment?: CommentCreate;
    // attachments?: AttachmentInfo[];
}
