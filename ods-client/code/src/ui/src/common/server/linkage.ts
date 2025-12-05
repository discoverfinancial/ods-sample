/**
 * Copyright (c) 2025 Capital One
*/


export const linkageType = "linkage";

// Document properties

export interface LinkageBase {
    type: string;
    item1: string;
    item1Data?: any;
    item2: string;
    item2Data: any;
    similarity?: number;
    distance?: number;
    changes?: number;
    // match: LinkageMatch;
}

export interface LinkageMatch {
    // item2: string;
    // item2Data: any;
    similarity?: number;
    distance?: number;
    changes?: number;
}

// Retrieval interfaces

export interface Linkage extends LinkageBase {
    id: string;
    state: string;              // created, closed
    dateCreated: number;
    dateUpdated: number;
}

export interface LinkageSummary extends Linkage {
    schemaVersion: string;
    curStateRead?: string[]; // cache of current state read group
    curStateWrite?: string[]; // cache of current state write group
}

export interface LinkageInfo extends LinkageSummary {
}

// Create/update interfaces

export type LinkageBaseOptional = Partial<LinkageBase>

export interface LinkageCreate extends LinkageBaseOptional {
    type: string;
    item1: string;
    item2: string;
}

export interface LinkageUpdate extends LinkageBaseOptional {
    state?: string;
}

