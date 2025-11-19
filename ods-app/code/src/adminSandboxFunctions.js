/**
 * Copyright (c) 2025 Capital One
*/

// const { AppMgr } = require("../appMgr");
const axios = require("axios");
const { Logger } = require("dlms-server");

const { SbomClient } = require("./etl/bom/index");
const { GuidanceProcessor } = require("./etl/guidance/GuidanceProcessor");
const { DepsdevClient } = require("./etl/depsdev/DepsdevClient");
const { compareVersions, sbomType } = require("ods-framework");
const { Role } = require("ods-framework");

const log = new Logger("etl-sandbox");

//-------------------------------------------------------------------------------------------------
// EMPLOYEE FUNCTIONS
//-------------------------------------------------------------------------------------------------

define("log", async (args, { respond }) => {
    log.debug(...args);
    respond();
})


// SBOM CLIENT
define("createBomRef", async ([component, id], { respond, fail }) => {
    try {
        const sbomClient = new SbomClient(global.etl);
        const r = await sbomClient.createBomRef(component, id);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getAllSboms", async ([], { respond, fail }) => {
    try {
        const sbomClient = new SbomClient(global.etl);
        const r = await sbomClient.getAllSboms(global.ctx);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getSboms", async ([params], { respond, fail }) => {
    try {
        const sbomClient = new SbomClient(global.etl);
        const r = await sbomClient.getSboms(global.ctx, params);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getSbomId", async ([productName, productVersion], { respond, fail }) => {
    try {
        const sbomClient = new SbomClient(global.etl);
        const r = await sbomClient.getSbomId(global.ctx, productName, productVersion);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getSbomById", async ([id], { respond, fail }) => {
    try {
        const sbomClient = new SbomClient(global.etl);
        const r = await sbomClient.getSbomById(global.ctx, id);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getSbomByBomRef", async ([bomRef, getIdOnly], { respond, fail }) => {
    try {
        const sbomClient = new SbomClient(global.etl);
        const r = await sbomClient.getSbomByBomRef(global.ctx, bomRef, getIdOnly);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getSbomForCdxgenId", async ([id], { respond, fail }) => {
    try {
        const sbomClient = new SbomClient(global.etl);
        const r = await sbomClient.getSbomForCdxgenId(global.ctx, id);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getSbom", async ([productName, productVersion], { respond, fail }) => {
    try {
        const sbomClient = new SbomClient(global.etl);
        const r = await sbomClient.getSbom(global.ctx, productName, productVersion);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getOssAnalysis", async ([sbomId], { respond, fail }) => {
    try {
        const r = await global.mgr.getOssAnalysis(sbomId);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getMetadataProperty", async ([sbom, name], { respond, fail }) => {
    try {
        const sbomClient = new SbomClient(global.etl);
        const r = await sbomClient.getMetadataProperty(sbom, name);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("searchSboms", async ([searchText, searchType, uses, vulnerabilities, usesOrSearch, onlyVulnerabilities, nonCompliance], { respond, fail }) => {
    try {
        const r = await global.mgr.searchSboms(global.ctx, searchText, searchType, uses, vulnerabilities, usesOrSearch, onlyVulnerabilities, nonCompliance);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getSoftwareThatUsesLibrary", async ([searchText], { respond, fail }) => {
    try {
        const r = await global.mgr.getSoftwareThatUsesLibrary(global.ctx, { name: searchText }, "", null);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

// APP MGR

// define("getVulnerability", async ([v], { respond, fail }) => {
//     try {
//         const r = await global.mgr.getVulnerability(v);
//         respond(r);
//     } catch (e) {
//         fail(e);
//     }
// })

define("getSbomVersions", async ([idOrName], { respond, fail }) => {
    try {
        const r = await global.mgr.getVersions(idOrName);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getMostUsed", async ([directDependency], { respond, fail }) => {
    try {
        const r = await global.mgr.getMostUsed(directDependency);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getDocs", async ([type, match, options], { respond, fail }) => {
    try {
        const r = await global.mgr.getDocs(global.ctx, type, match, options);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getDoc", async ([type, id, projection], { respond, fail }) => {
    try {
        const r = await global.mgr.getDoc(global.ctx, { type: type, id: id }, projection);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

// Add for compatibility with old Queries
define("query", async ([match, projection, limit, sort, database], { respond, fail }) => {
    try {
        const type = database ? database : sbomType;
        const options = {};
        if (limit) { options["limit"] = limit; }
        if (sort) { options["sort"] = sort; }
        const r = await global.mgr.getDocs(global.ctx, type, match, options);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

// GUIDANCE PROCESSOR

define("getGuidanceDocs", async ([params], { respond, fail }) => {
    try {
        console.log("global=", global)
        const client = new GuidanceProcessor(global.etl);
        const r = await client.getGuidanceDocs(global.ctx, params);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getStoreDocs", async ([params], { respond, fail }) => {
    try {
        const sbomClient = new SbomClient(global.etl);
        const r = await sbomClient.getStoreDocs(global.ctx, params);
        respond(r);
    } catch (e) {
        fail(e);
    }
})


// DEPSDEV

define("getDepsdevDocs", async ([params], { respond, fail }) => {
    try {
        const client = new DepsdevClient(global.etl);
        const r = await client.getDepsdevDocs(global.ctx, params);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getDepsdevDoc", async ([basePurl], { respond, fail }) => {
    try {
        const client = new DepsdevClient(global.etl);
        const r = await client.getDepsdevDoc(global.ctx, basePurl);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getPackageFromBasePurl", async ([purl], { respond, fail }) => {
    try {
        const client = new DepsdevClient(global.etl);
        const r = await client.getPackageFromBasePurl(purl);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getPackageFromPurl", async ([purl], { respond, fail }) => {
    try {
        const client = new DepsdevClient(global.etl);
        const r = await client.getPackageFromPurl(purl);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getVersionDetails", async ([purl, system, name, version], { respond, fail }) => {
    try {
        const client = new DepsdevClient(global.etl);
        const r = await client.getVersionDetails(purl, system, name, version);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getPackageVersions", async ([purl], { respond, fail }) => {
    try {
        const client = new DepsdevClient(global.etl);
        const r = await client.getPackageVersions(global.ctx, purl);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("getGuidanceVersionInfo", async ([basePurl], { respond, fail }) => {
    try {
        const client = new DepsdevClient(global.etl);
        const r = await client.getGuidanceVersionInfo(global.ctx, basePurl);
        respond(r);
    } catch (e) {
        fail(e);
    }
})


// OTHER

define("axiosGet", async ([url, config], { respond, fail }) => {
    try {
        const r = await axios.get(url, config);
        respond(r.data);
    } catch (e) {
        const err = e.message ? JSON.parse(e.message) : "" + e;
        fail(err);
    }
})

define("axiosPost", async ([url, data, config], { respond, fail }) => {
    try {
        const r = await axios.post(url, data, config);
        respond(r.data);
    } catch (e) {
        const err = e.message ? JSON.parse(e.message) : "" + e;
        fail(err);
    }
})

define("axiosPut", async ([url, data, config], { respond, fail }) => {
    try {
        const r = await axios.put(url, data, config);
        respond(r.data);
    } catch (e) {
        const err = e.message ? JSON.parse(e.message) : "" + e;
        fail(err);
    }
})

define("axiosPatch", async ([url, data, config], { respond, fail }) => {
    try {
        const r = await axios.patch(url, data, config);
        respond(r.data);
    } catch (e) {
        const err = e.message ? JSON.parse(e.message) : "" + e;
        fail(err);
    }
})

define("axiosDelete", async ([url, config], { respond, fail }) => {
    try {
        const r = await axios.delete(url, config);
        respond(r.data);
    } catch (e) {
        const err = e.message ? JSON.parse(e.message) : "" + e;
        fail(err);
    }
})




// ETL

define("getProfile", async ([idOrEmail, details], { respond, fail }) => {
    try {
        const userProfileService = global.mgr.getUserProfileService();
        const r = await userProfileService.getProfile(idOrEmail, details)
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("getManagementChain", async ([users], { respond, fail }) => {
    try {
        const userProfileService = global.mgr.getUserProfileService();
        const r = await userProfileService.getManagementChain(users);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("getLogs", async ([], { respond, fail }) => {
    try {
        const r = await global.etl.getLogs(global.ctx);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("getStatus", async ([], { respond, fail }) => {
    try {
        const r = await global.etl.getStatus();
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("setNotebookId", async ([id], { respond, fail }) => {
    try {
        global.notebook = id;
        respond(id);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("getNotebookId", async ([], { respond, fail }) => {
    try {
        respond(global.notebook);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("setNotebookVar", async ([notebookId, name, value], { respond, fail }) => {
    try {
        await global.mgr.setNotebookVar(notebookId, name, value)
        respond();
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("getNotebookVar", async ([notebookId, name], { respond, fail }) => {
    // console.log("getNotebookVar name=", name)
    try {
        const r = await global.mgr.getNotebookVar(notebookId, name);
        // console.log(" -- found var r=", r);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("getNotebookVars", async ([notebookId], { respond, fail }) => {
    console.log("getNotebookVars")
    try {
        const r = await global.mgr.getNotebookVars(notebookId);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("deleteNotebookVar", async ([notebookId, name], { respond, fail }) => {
    try {
        await global.mgr.deleteNotebookVar(notebookId, name);
        respond();
    } catch (e) {
        console.log(e);
        fail(e);
    }
});


//-------------------------------------------------------------------------------------------------
// EDITOR FUNCTIONS
//-------------------------------------------------------------------------------------------------

/**
 * Compare version strings
 */
define("compareVersions", async ([v1, v2], { respond, fail }) => {
    try {
        const r = compareVersions(v1, v2);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

/**
 * Get attestors from product team
 */
define("getAttestorsFromProductTeam", async ([productTeam], { respond, fail }) => {
    try {
        const r = getAttestorsFromProductTeam(productTeam);
        respond(r);
    } catch (e) {
        fail(e);
    }
})


//-------------------------------------------------------------------------------------------------
// ADMIN FUNCTIONS
//-------------------------------------------------------------------------------------------------

// SBOM CLIENT

define("deleteSbom", async ([id], { respond, fail }) => {
    try {
        assertIsAdmin();
        const sbomClient = new SbomClient(global.etl);
        const r = await sbomClient.deleteSbom(global.ctx, id);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("updateSbom", async ([sbom, id], { respond, fail }) => {
    try {
        assertIsAdmin();
        const sbomClient = new SbomClient(global.etl);
        const r = await sbomClient.updateSbom(global.ctx, sbom, id);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("createSbom", async ([sbom, id], { respond, fail }) => {
    try {
        assertIsAdmin();
        const sbomClient = new SbomClient(global.etl);
        const r = await sbomClient.createSbom(global.ctx, sbom, id);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("setMetadataProperty", async ([sbom, name, value], { respond, fail }) => {
    try {
        assertIsAdmin();
        const sbomClient = new SbomClient(global.etl);
        const r = await sbomClient.setMetadataProperty(sbom, name, value);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("setMetadataComponentItem", async ([sbom, name, value], { respond, fail }) => {
    try {
        assertIsAdmin();
        const sbomClient = new SbomClient(global.etl);
        const r = await sbomClient.setMetadataComponentItem(sbom, name, value);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("addAssembly", async ([sbom, id], { respond, fail }) => {
    try {
        assertIsAdmin();
        const sbomClient = new SbomClient(global.etl);
        const r = await sbomClient.addAssembly(sbom, id);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

// GUIDANCE PROCESSOR

define("createGuidance", async ([item], { respond, fail }) => {
    try {
        assertIsAdmin();
        const client = new GuidanceProcessor(global.etl);
        const r = await client.createGuidance(global.ctx, item);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("updateGuidance", async ([item, id], { respond, fail }) => {
    try {
        assertIsAdmin();
        const client = new GuidanceProcessor(global.etl);
        const r = await client.updateGuidance(global.ctx, item, id);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("deleteGuidance", async ([id], { respond, fail }) => {
    try {
        assertIsAdmin();
        const client = new GuidanceProcessor(global.etl);
        const r = await client.deleteGuidance(global.ctx, id);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("changeGuidanceState", async ([id, newState], { respond, fail }) => {
    try {
        assertIsAdmin();
        const client = new GuidanceProcessor(global.etl);
        const r = await client.changeGuidanceState(global.ctx, id, newState);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("retireGuidanceForPurl", async ([purl], { respond, fail }) => {
    try {
        assertIsAdmin();
        const client = new GuidanceProcessor(global.etl);
        const r = await client.retireGuidanceForPurl(global.ctx, purl);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("updateTier2Guidance", async ([], { respond, fail }) => {
    try {
        assertIsAdmin();
        const client = new GuidanceProcessor(global.etl);
        const r = client.updateTier2Guidance(global.ctx);
        respond("Running updateTier2Guidance asynchronously...");
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

// OTHER

define("createDoc", async ([type, doc], { respond, fail }) => {
    try {
        assertIsAdmin();
        const r = await global.mgr.createDoc(global.ctx, type, doc);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

define("updateDoc", async ([type, id, args], { respond, fail }) => {
    try {
        assertIsAdmin();
        const r = await global.mgr.updateDoc(global.ctx, { type: type, id: id }, args);
        respond(r);
    } catch (e) {
        fail(e);
    }
})

// ETL

define("refreshCachedDepsdev", async ([], { respond, fail }) => {
    try {
        assertIsAdmin();
        const client = new DepsdevClient(global.etl);
        const r = client.refreshCache(global.ctx);
        respond("Running refreshCachedDepsdev asynchronously...");
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("refreshCachedEndoflife", async ([doRefresh], { respond, fail }) => {
    try {
        assertIsAdmin();
        const client = new EndoflifeClient(global.etl);
        const r = client.refreshCache(global.ctx, doRefresh);
        respond("Running refreshCachedEndoflife asynchronously...");
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("writeLog", async ([message], { respond, fail }) => {
    try {
        assertIsAdmin();
        const r = await global.etl.writeLog(global.ctx, message);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("deleteLog", async ([id], { respond, fail }) => {
    try {
        assertIsAdmin();
        const r = await global.etl.deleteLog(global.ctx, id);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("setStatus", async ([status, command, comment], { respond, fail }) => {
    try {
        assertIsAdmin();
        const r = await global.etl.setStatus(status, command, comment);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});
define("setStatusComment", async ([comment], { respond, fail }) => {
    try {
        assertIsAdmin();
        const r = await global.etl.setStatusComment(comment);
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

define("stop", async ([], { respond, fail }) => {
    try {
        assertIsAdmin();
        const r = await global.etl.stop();
        respond(r);
    } catch (e) {
        console.log(e);
        fail(e);
    }
});

function assertIsAdmin() {
    if (!global.ctx.isAdmin) {
        throw new Error("Must be administrator")
    }
}

function assertIsEditor() {
    if (global.ctx.isAdmin) { 
        return;
    }
    if (global.ctx.user.roles.includes(Role.Editor)) {
        return;
    }
    throw new Error("Must be editor")
}
