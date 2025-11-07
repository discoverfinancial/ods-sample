/**
 * Copyright (c) 2025 Capital One
*/


/**
 * Compare version strings.  Return -1 if v1 < v2, 1 if v1 > v2 more, 0 if equal
 * @param v1 
 * @param v2 
 */
export function compareVersions(v1: string, v2: string, onlyCompareDigits=false) {
    // console.log(`compareVersions(${v1}, ${v2}, ${onlyCompareDigits})`)
    if ((v1 == undefined || !v1) && (v2 == undefined && !v2)) return 0;
    if (v1 == undefined || !v2 ) return -1;
    if (v2 == undefined || !v2) return 1;
    const parts1 = v1.split(".");
    const parts2 = v2.split(".");
    const len = Math.min(parts1.length, parts2.length);
    for (var i=0; i<len; i++) {
        //@TODO: If version has letters or starts with v, compare won't work      
        let _p1 = onlyCompareDigits ? parts1[i].replace(/[^\d.x]/gi, '') : parts1[i];
        let _p2 = onlyCompareDigits ? parts2[i].replace(/[^\d.x]/gi, '') : parts2[i];
        // console.log("1: _p1=", _p1, "_p2=", _p2);
        // Replace quotes
        _p1 = _p1.replace('"', "").replace('"', "");
        _p2 = _p2.replace('"', "").replace('"', "");
        // console.log("2: _p1=", _p1, "_p2=", _p2);

        // If version has #.x, then need to stop compare & return equals
        // if ((parts1[i]?.toLowerCase() == "x") || (parts2[i]?.toLowerCase() == "x")) {
        if ((_p1?.toLowerCase() == "x") || (_p2?.toLowerCase() == "x")) {
            // console.log(" => 0 (equals)")
            return 0;
        }
        const p1 = parseInt(_p1);
        const p2 = parseInt(_p2);
        // console.log("3: p1=", p1, "p2=", p2);
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
 * Get attestors object from product team
 * 
 * @param productTeam 
 * @returns 
 */
export function getAttestorsFromProductTeam(productTeam: any) {
    let attestors:any[] = productTeam?.users;
    if (attestors) {
        for (const attestor of attestors) {
            attestor.group = {id: productTeam.id, 
                name: productTeam.name, 
                businessUnit: productTeam.businessUnit,
                agileTeamType: productTeam.agileTeamType,
                teamType: productTeam.teamType,
            };
        }
    }
    return attestors;
}

/**
 * Normalize a GitHub URL by converting it to lowercase and removing the ".git" suffix
 * 
 * @param url The GitHub URL to normalize
 * @returns The normalized URL
 */
export function normalizeGithubUrl(url: string | undefined) {
    if (url && url.startsWith("http")) {
        return url.toLowerCase().replace(".git", "");
    }
    return "";
}


/**
 * Return the repo name part of a GitHub URL and convert to lowercase and removing the ".git" suffix
 * 
 * @param url The GitHub URL to normalize
 * @returns The partial URL
 */
export function partialGithubUrl(url: string | undefined) {
    if (url && url.startsWith("http")) {
        const i = url.lastIndexOf("/");
        if (i > 0) {
            const r = url.substring(i + 1).toLowerCase().replace(".git", "");
            return r;
        }
        else {
            return url.toLowerCase().replace(".git", "");
        }
    }
    return "";
}

