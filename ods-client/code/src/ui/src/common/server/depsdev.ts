/**
 * Copyright (c) 2025 Capital One
*/

// import { AttachmentInfo, CommentCreate, CommentInfo } from "./base";

export const depsdevType = "depsdev";

// Document properties

export interface DepsdevBase {
    package: {
        packageKey: {
            system: string;
            name: string;
        };
        purl: string;
        versions: any[];
    };
    version: {
        versionKey: {
            system: string;
            name: string;
            version: string;
        };
        purl: string;
        publishedAt: string;
        isDefault: boolean;
        isDeprecated: boolean;
        licenses?: any[];
        licenseDetails?: any[];
        advisoryKeys?: any[];
        links?: any[];
        slsaProvenances?: any[];
        registries?: any[];
        relatedProjects?: any[];
        upstreamIdentifiers?: any[];
    };
    project: {
        projectKey: { 
            id: string;
        };
        openIssuesCount?: number;
        starsCount?: number;
        forksCount?: number;
        license?: string;
        description?: string;
        homepage?: string;
        scorecard?: {
            date: string;
            repository: any[];
            scorecard: any;
            checks: any[];
            overallScore: number;
            metadata: any;
        }        
    }
    error: string;
}

// Retrieval interfaces

export interface Depsdev extends DepsdevBase {
    id: string;
    state: string;
    dateCreated: number;
    dateUpdated: number;
}

export interface DepsdevSummary extends Depsdev {
    schemaVersion: string;
    curStateRead?: string[]; // cache of current state read group
    curStateWrite?: string[]; // cache of current state write group
}

export interface DepsdevInfo extends DepsdevSummary {
    // stateHistory: StateHistory[];
    // comments: CommentInfo[];
    // attachments?: AttachmentInfo[];
}

// Create/update interfaces

export type DepsdevBaseOptional = Partial<DepsdevBase>

export interface DepsdevCreate extends DepsdevBaseOptional {
}

export interface DepsdevUpdate extends DepsdevBaseOptional {
    state?: string;
    // comment?: CommentCreate;
    // attachments?: AttachmentInfo[];
}

export enum DepsDevSystem {
    GO = "go",
    NPM = "npm",
    CARGO = "cargo",
    MAVEN = "maven",
    PYPI = "pypi",
    NUGET = "nuget"
}
