/**
 * Copyright (c) 2025 Capital One
*/

import { DepsdevInfo, DepsDevSystem, depsdevType } from '../common';
import { Http } from '../Http'
import { DocError } from './Managers';

const depsdevUrl = `https://api.deps.dev/v3alpha`;

const REACT_APP_ODS_SERVER = process.env.REACT_APP_ODS_SERVER || "";
const urlPath = `${REACT_APP_ODS_SERVER}/api/docs/${depsdevType}/`;

export class DepsDevMgr  {

    http: Http = Http.getInstance();
    private static instance: DepsDevMgr;

    constructor() { }

    public static init(): DepsDevMgr {
        if (this.instance !== undefined) {
            return this.instance;
        }
        this.instance = new DepsDevMgr();
        return this.instance;
    }

    public static getInstance(): DepsDevMgr {
        return this.init();
    }

    async getDocument(id: string): Promise<DepsdevInfo | null> {
        console.log(`DepsDevMgr.getDocument(${id})`)
        if (!id) {
            console.log(`getDocument() error: Document id is missing`);
            throw new Error("GuidanceMgr.getDocument() - Document id missing");
        }
        let document:DepsdevInfo;
        try {
            const response = await (this.http.get(urlPath + id))
            console.log("StoreMgr.getDocument response=", response)
            document = response.data;
            return document;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async getDocuments(config?: any) : Promise<DepsdevInfo[]> {
        console.log("DepsDevMgr.getDocuments() config=",config);
        return new Promise(async (resolve:any, reject:any) => {
            try {
                await this.http.postStream(urlPath, config, undefined, function(data: any, done: boolean) {
                    if (done) {
                        if (data.length > 0) {
                            console.log("DepsDevMgr.getDocuments[0] =", data[0]);
                        }
                        return resolve(data);
                    }
                }, false);
            } catch (e: any) {
                const err = new DocError(e);
                console.error(err);
                return reject(err);
            }
        });
    }

    async getDocumentsStream(callback: any, config?: any) {
        console.log("DepsDevMgr.getDocumentsStream() config=",config);
        try {
            await this.http.postStream(urlPath, config, undefined, callback);
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async deleteDocument(id: string): Promise<boolean> {
        console.log(`DepsDevMgr.deleteDocument(${id})`);
        if (!id) {
            console.log(`DepsDevMgr.deleteDocument() error: Document id is missing`);
            throw new Error("DepsDevMgr.deleteDocument() - Document id missing");
        }
        try {
            const response = await this.http.delete(urlPath + id);
            console.log("DepsDevMgr.deleteDocument response=", response)
            return true;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            return false;
        }
    }

    async deleteDocuments(): Promise<void> {
        console.log("DepsDevMgr.deleteDocuments()");
        const documents = await this.getDocuments();
        documents.map(async (p) => {
            await this.deleteDocument(p.id);
        })
    }

    async deleteMany(match: any) : Promise<any> {
        console.log("DepsDevMgr.deleteMany() match=",match);
        if (!match) {
            console.log("DepsDevMgr.deleteMany error: match is required");
            throw new Error("DepsDevMgr.deleteMany error: match is required");
        }
        try {
            const response = await this.http.delete(urlPath + "?match=" + encodeURIComponent(JSON.stringify(match)));
            console.log("DepsDevMgr.deleteMany response=", response)
            return response.data;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }    

    /**
     * Retrieve package information from the given package system
     * @param {DepsDevSystem} system - The package system hosting the package.  One of GO, NPM, CARGO, MAVEN, PYPI, NUGET
     * @param {string} packageName - The name of the package
     * @param {string} versions - Optional, version of hte package
     * @returns JSON object containing version and package information
     */
    async getPackageByName(system: DepsDevSystem, packageName: string, versions?: string): Promise<any | null> {
        if (!packageName) return null;
        try {
            const versionsString = versions ? `/versions/${versions}` : "";
            const response = await this.http.get(`${depsdevUrl}/systems/${system}/packages/${encodeURIComponent(packageName)}${versionsString}`);
            console.log("Get deps.dev package =", response.status);
            return response.data;
        } catch (e: any) {
            console.error(`Error getting package: ${packageName} from system: ${system}, `, e);
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    /**
     * Retrieve package information associated with the given purl
     * @param {string} purl - The purl of the package to query
     * @returns JSON object containing version and package information
     */
    async getPackageFromBasePurl(purl: string): Promise<any | null> {
        if (!purl) return null;
        try {
            const response = await this.http.get(`${depsdevUrl}/purl/${encodeURIComponent(purl)}`);
            console.log("Get deps.dev package from purl: "+purl+" ", response.status);
            return response.data;
        } catch (e: any) {
            console.error(`Error getting package from purl: ${purl}, `, e);
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }
}