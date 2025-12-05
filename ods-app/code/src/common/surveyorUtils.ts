/**
 * Copyright (c) 2025 Capital One
*/

import { getAppUrl } from "ods-common";

/**
 * Get attestors object from product team
 * 
 * @param productTeam 
 * @returns 
 */
export function getAttestorsFromProductTeam(productTeam: any) {
    let attestors: any[] = productTeam?.users;
    if (attestors) {
        for (const attestor of attestors) {
            attestor.group = {
                id: productTeam.id,
                name: productTeam.name,
                businessUnit: productTeam.businessUnit,
                agileTeamType: productTeam.agileTeamType,
                teamType: productTeam.teamType,
            };
        }
    }
    return attestors;
}

const attestationStateToStatusMap: any = {
    created: "Created",
    active: "Active",
    pending: "Incomplete",
    overdue: "Overdue",
    deferred: "Deferred",
    complete: "Completed",
    rejected: "Completed",
    closed: "Closed",
    cancelled: "Cancelled",
}

const attestationStateToPlanMap: any = {
    created: "Not Started",
    active: "Not Started",
    pending: "In Progress",
    overdue: "Overdue",
    deferred: "Deferred",
    complete: "Complete",
    rejected: "Rejected",
    closed: "Closed",
    cancelled: "Cancelled",
}

export function getAttestationStatus(state: string): string {
    return (attestationStateToStatusMap[state] || "")
}

export function getAttestationPlan(state: string): string {
    return (attestationStateToPlanMap[state] || "")
}

/**
 * Get the url for the document from the Surveyor app
 * 
 * @param id Document id
 * @param hash Document hash
 * @returns String
 */
export function getSurveyorUrlForDocument(id: string, hash?: string) {
    return (getAppUrl() + "/details/" + id + (hash ? ("#" + hash) : ""));
}

export function getSurveyorUrlForAttestation(id: string, hash?: string) {
    return (getAppUrl() + "/attestation/" + id + (hash ? ("#" + hash) : ""));
}

export function getSurveyorLinkForAttestationProduct(document: any, text: string) {
    const url = getAppUrl() + "/attestation?product=" + encodeURIComponent(document.item.name);
    return `<a href="${url}">${text}${document.item.name}</a>`
}

/**
 * Get html string for link to a document from the Surveyor app
 *
 * @param document Document
 * @param hash Document hash
 * @param text [Optional] Link text or document title if not specified
 * @param type [Optional] Type of link to generate
 * @returns String
 */
export function getSurveyorLinkForDocument(document: any, hash?: string, text?: string, type?: string) {
    return `<a href="${getSurveyorUrlForDocument(document.id, hash)}">${text || document.title || "No Title"}</a>`
}
