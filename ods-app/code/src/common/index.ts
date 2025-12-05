/**
 * Copyright (c) 2025 Capital One
*/

export * from "./models";
export * from "./states";
export * from "ods-common"

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
    _guidance: 1,
    _compliance: 1,
    masterIndex: 1,
}

export const summaryProjection = {
    ...summaryProjectionList,
    components: 1,
}