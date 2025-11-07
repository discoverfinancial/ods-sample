/**
 * Copyright (c) 2025 Capital One
*/


export const Role = {
    Administrator: "Admin",
    Editor: "Editor",
    Employee: "Employee",
}

/**
 * Get the url for the document
 * 
 * @param id Document id
 * @param hash Document hash
 * @returns String
 */
export function getUrlForDocument(id: string, hash?: string) {
    try {
        return (window.location.origin + "/details/" + id + (hash ? ("#" + hash) : ""));
    } catch (e) {
        return (process.env.BASE_URL + "/details/" + id + (hash ? ("#" + hash) : ""));
    }
}

/**
 * Get html string for link to document.
 * 
 * @param document Document
 * @param hash Document hash
 * @param text [Optional] Link text or document title if not specified
 * @returns String
 */
export function getLinkForDocument(document: any, hash?: string, text?: string) {
    return `<a href="${getUrlForDocument(document.id, hash)}">${text || document.title || "No Title"}</a>`
}

export const templatized = (template: string, vars = {}) => {
    const handler = new Function('vars', [
        'const localVars = ( ' + Object.keys(vars).join(', ') + ' ) =>',
        '`' + template + '`',
        'return localVars(...Object.values(vars))'
    ].join('\n'))

    return handler(vars)
}

/**
 * Get the base url for the app
 * 
 * @returns String
 */
export function getAppUrl() {
    try {
        return (window.location.origin);
    } catch (e) {
        return (process.env.BASE_URL);
    }
}

export function formatDateTime(d: number): string {
    if (!d) { return "" }
    var date = new Date(d);
    var hours = date.getHours() % 12;
    var amPm = date.getHours() > 11 ? "PM" : "AM";
    return (
        ("0" + (date.getMonth() + 1)).slice(-2) + "/" +
        ("0" + date.getDate()).slice(-2) + "/" +
        ("" + date.getFullYear()).slice(-2) + " at " + hours + ":" + ("0" + date.getMinutes()).slice(-2) + " " + amPm
    )
}

export function formatDate(d: number | undefined): string {
    if (!d) { return "" }
    var date = new Date(d);
    return (
        ("0" + (date.getMonth() + 1)).slice(-2) + "/" +
        ("0" + date.getDate()).slice(-2) + "/" +
        ("" + date.getFullYear()).slice(-2)
    )
}

export function formatDateTimeUTC(d: number): string {
    if (!d) { return "" }
    var date = new Date(d);
    var hours = date.getUTCHours() % 12;
    var amPm = date.getUTCHours() > 11 ? "PM" : "AM";
    return (
        ("0" + (date.getUTCMonth() + 1)).slice(-2) + "/" +
        ("0" + date.getUTCDate()).slice(-2) + "/" +
        ("" + date.getUTCFullYear()).slice(-2) + " at " + hours + ":" + ("0" + date.getUTCMinutes()).slice(-2) + " " + amPm
    )
}

export function capitalize(str: string) {
    return (str.charAt(0).toUpperCase() + str.slice(1)) || "";
}

export function chooseHighestRole(roles: string[]) {
    if (roles.includes(Role.Administrator)) {
        return Role.Administrator;
    }
    if (roles.includes(Role.Editor)) {
        return Role.Editor;
    }
    if (roles.includes(Role.Employee)) {
        return Role.Employee;
    }
    return roles[0];
}

/**
 * Render software name from id
 * @param name 
 * @returns 
 */
export function renderSoftwareName(bomRef: any) {
    return bomRef.name + (bomRef.version ? "@" + bomRef.version : "");
}
// Pre-migrate
// export function renderSoftwareName(name: any) {
//     if (typeof name == "string") {
//         if (name.startsWith(":")) {
//             name = name.substring(1);
//         }
//         if (name.endsWith(":")) {
//             name = name.substring(0, name.length - 1)
//         }
//         const s = name.split(":");
//         if (s.length > 1) {
//             const lastPart = s[s.length - 1].split("@");
//             s.pop();
//             name = s.join(":") + "@" + lastPart[lastPart.length - 1];
//         }
//         return name;
//     }
//     else {
//         let s = "";
//         if (name.group) {
//             s = s + name.group + ":";
//         }
//         if (name.name) {
//             s = s + name.name;
//         }
//         if (name.version) {
//             s = s + "@" + name.version;
//         }
//         return s;
//     }
// }

// const idCache: any = {};

// export function extractPartsFromId(_id: any) {
//     let id = _id;

//     // If migrated
//     if (_id.id) {
//         id = _id.id;
//     }

//     // If migrated
//     if (_id.name) {
//         const r = { name: _id.name, version: _id.version, group: _id.group }
//         // idCache[id] = r;
//         return r;
// }

// if (idCache.hasOwnProperty(id)) {
//     return idCache[id];
// }

// const parts = id.split(":");
// const len = parts.length;
// let version = "";
// let name = "";
// let group = "";
// if (len == 3) {
//     const hashVersion = parts[2];
//     version = hashVersion.split("@")[1];
//     name = parts[1];
//     group = parts[0];
//     const r = { name, version, group }
//     idCache[id] = r;
//     return r;
// }
// else {
//     console.log("Parts LENGTH != 3")
//     return null;
// }

// }

/**
 * Create a BomRef object from an SBOM component
 * 
 * @param component The SBOM component object
 * @returns 
 */
export function createBomRef(component: any, id?: string) {
    const bomRef = { id: id, name: component.name, version: component.version, type: component.type, purl: component.purl, group: component.group };
    return bomRef;
}

/**
 * Return the base purl for the purl.
 * 
 * @param purl 
 * @returns 
 */
export function getBasePurl(purl: string) {
    if (purl) {
        var i = purl.indexOf("@");
        if (i > 0) {
            return purl.substring(0, i);
        }
    }
    return purl;
}

/**
 * Compare version strings.  Return -1 if less, 1 if more, 0 if equal
 * @param v1 
 * @param v2 
 */
export function compareVersions(v1: string, v2: string) {
    // console.log(`compareVersions(${v1}, ${v2})`)
    if ((v1 == undefined || !v1) && (v2 == undefined && !v2)) return 0;
    if (v1 == undefined || !v2) return -1;
    if (v2 == undefined || !v2) return 1;
    const parts1 = v1.split(".");
    const parts2 = v2.split(".");
    const len = Math.min(parts1.length, parts2.length);
    for (var i = 0; i < len; i++) {
        //@TODO: If version has letters or starts with v, compare won't work

        // If version has #.x, then need to stop compare & return equals
        if ((parts1[i]?.toLowerCase() == "x") || (parts2[i]?.toLowerCase() == "x")) {
            // console.log(" => 0 (equals)")
            return 0;
        }
        const p1 = parseInt(parts1[i]);
        const p2 = parseInt(parts2[i]);
        if (p1 < p2) {
            // console.log(" => -1 (less than)")
            return -1;
        }
        if (p1 > p2) {
            // console.log(" => 1 (greater than)")
            return 1;
        }
    }
    // console.log(" => 0 (equals)")
    return 0;
}

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

export const copyDocField = (dest: any, src: any, fieldName: string) => {
    const parts = fieldName.split(".");
    dest[parts[0]] = src[parts[0]];
}
