/**
 * Copyright (c) 2025 Capital One
*/

import { AttachmentInfo, CommentCreate, CommentInfo, StateHistory, User } from "./base";
import { CycloneDXBillOfMaterialsStandard as Bom, 
    // BOMFormat, 
    // CycloneDXSpecificationVersion,  
    // BOMSerialNumber,
    // BOMVersion,
    // BOMMetadata,
    // Components2,
    // Services2,
    // ExternalReferences4,
    // Dependencies,
    // Compositions,
    // Vulnerabilities,
    // Annotations,
    // Formulation,
    // Declarations,
    // Definitions,
    // Properties20,
    // Signature10,
} from "./bom-1.6";

export const sbomType:string = "sbom";

// Document properties

export interface SbomDocumentBase extends Bom {
    [key:string]: any; // Allow other properties as well
}

// Retrieval interfaces

export interface SbomDocument extends SbomDocumentBase {
    id: string;
    state: string;
    dateCreated: number;
    dateUpdated: number;
    _vulnerabilities?: number;
    _compositions?: number;
}

export interface SbomDocumentSummary extends SbomDocument {
    comment?: CommentCreate;
    curStateRead?: string[]; // cache of current state read group
    curStateWrite?: string[]; // cache of current state write group
}

export interface SbomDocumentInfo extends SbomDocumentSummary {
    stateHistory: StateHistory[];
    comments: CommentInfo[];
    attachments?: AttachmentInfo[];
}

// Create/update interfaces

export type SbomDocumentBaseOptional = Partial<SbomDocumentBase>

export interface SbomDocumentCreate extends SbomDocumentBaseOptional {
}

export interface SbomDocumentUpdate extends SbomDocumentBaseOptional {
    state?: string;
    comment?: CommentCreate;
    attachments?: AttachmentInfo[];
    "$set"?: any;
}

export interface SbomDocumentList {
    count: number;
    items: SbomDocumentSummary[];
}



export const summaryProjectionList = {
    id: 1,
    dateCreated: 1,
    dateUpdated: 1,
    state: 1,
    curStateRead: 1,
    curStateWrite: 1,
    metadata: 1,
    _vulnerabilities: 1,
    compositions: 1,
    _compositions: 1,
}

export const summaryProjection = {
    ...summaryProjectionList,
    components: 1,
}