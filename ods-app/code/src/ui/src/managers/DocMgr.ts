/**
 * Copyright (c) 2025 Capital One
*/

import { Bom } from '../common';
import { sbomType, Person, UserGroupInfo, GetVersions, MostUsed, UsesLibrary, OssAnalysis } from '../common';
import { Http } from '../Http'
import { DocError, IServicesMgr, IUserGroupMgr } from './Managers';

const REACT_APP_ODS_SERVER = process.env.REACT_APP_ODS_SERVER || ""

export class DocMgr implements IUserGroupMgr, IServicesMgr {

    http: Http = Http.getInstance();
    private static instance: DocMgr;

    constructor() { }

    public static init(): DocMgr {
        if (this.instance !== undefined) {
            return this.instance;
        }
        this.instance = new DocMgr();
        return this.instance;
    }

    public static getInstance(): DocMgr {
        return this.init();
    }


    async getUserGroups(): Promise<UserGroupInfo[]> {
        console.log("DocMgr.getUserGroups()");
        try {
            const response = await this.http.get(`${REACT_APP_ODS_SERVER}/api/user_groups/`);
            console.log("DocMgr.getUserGroups response=", response)
            return response.data.items;
        } catch (e: any) {
            console.error(new DocError(e));
            return [];
        }
    }

    async getUserGroup(name: string): Promise<UserGroupInfo> {
        console.log(`getUserGroup(${name})`);
        try {
            const response = await this.http.get(`${REACT_APP_ODS_SERVER}/api/user_groups/` + name + "/");
            console.log("DocMgr.getUserGroup response=", response)
            let members: Person[] = [];
            for (var i = 0; i < response.data.members.length; i++) {
                const member = response.data.members[i];
                members.push({
                    department: member.department,
                    email: member.email,
                    employeeNumber: member.employeeNumber,
                    name: member.name,
                    title: member.title,
                })
            }
            return { id: response.data.id, deletable: response.data.deletable, members: members };
        } catch (e: any) {
            console.error(new DocError(e));
            return { id: name, deletable: false, members: [] };
        }
    }

    async setUserGroup(name: string, members: Person[]): Promise<UserGroupInfo> {
        try {
            const response = await this.http.patch(`${REACT_APP_ODS_SERVER}/api/user_groups/` + name, { members: members });
            console.log("DocMgr.setUserGroup response=", response)
            const body = response.data;
            return body.members;
        } catch (e: any) {
            console.error(new DocError(e));
            return { id: name, deletable: false, members: [] };
        }
    }

    async createUserGroup(name: string, members: Person[]): Promise<UserGroupInfo> {
        try {
            const response = await this.http.put(`${REACT_APP_ODS_SERVER}/api/user_groups/`, { id: name, members: members, deletable: true });
            console.log("DocMgr.createUserGroup response=", response)
            const body = response.data;
            return body.members;
        } catch (e: any) {
            console.error(new DocError(e));
            return { id: name, deletable: false, members: [] };
        }
    }

    async deleteUserGroup(name: string): Promise<boolean> {
        console.log(`deleteUserGroup(${name})`);
        if (!name) {
            console.log(`deleteDocument() error: Group name is missing`);
            throw new Error("DocMgr.deleteUserGroup() - Group name missing");
        }
        try {
            const response = await this.http.delete(`${REACT_APP_ODS_SERVER}/api/user_groups/` + name);
            console.log("DocMgr.deleteUserGroup response=", response)
            return true;
        } catch (e: any) {
            console.error(new DocError(e));
            return false;
        }
    }

    async runAction(type: string, document: any, data: any): Promise<any | null> {
        if (!document || !document.id) {
            console.log(`runAction() error: Document id is missing`);
            throw new Error("DocMgr.runAction() - Document id missing");
        }
        console.log(`runAction(${document.id}) data=`, data)
        try {
            const response = await this.http.post(`${REACT_APP_ODS_SERVER}/api/action/` + type + "/" + encodeURIComponent(document.id), data);
            console.log("DocMgr.runAction response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async getUserProfile(email: string): Promise<any> {
        console.log(`getProfile(${email})`);
        let url = `${REACT_APP_ODS_SERVER}/api/profile/${email}/`;
        try {
            const response = await this.http.get(url);
            console.log("DocMgr.getProfile response=", response)
            return response.data;
        } catch (e: any) {
            console.error(new DocError(e));
        }
        return null;
    }

    async getVulnerability(data?:Bom.Vulnerability): Promise<any | null> {
        try {
            const response = await this.http.post(`${REACT_APP_ODS_SERVER}/api/queries/getVulnerability`, data);
            console.log("DocMgr.getVulnerability response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async getMostUsed(directDependency=false): Promise<MostUsed[] | null> {
        try {
            const response = await this.http.get(`${REACT_APP_ODS_SERVER}/api/queries/getMostUsed` + (directDependency ? "?directDependency=true" : ""));
            console.log("DocMgr.getMostUsed response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async getOssAnalysis(sbomId: string): Promise<OssAnalysis[] | null> {
        try {
            const response = await this.http.get(`${REACT_APP_ODS_SERVER}/api/queries/getOssAnalysis/${sbomId}`);
            console.log("DocMgr.getOssAnalysis response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async getVersions(id: string): Promise<GetVersions[] | null> {
        try {
            const response = await this.http.get(`${REACT_APP_ODS_SERVER}/api/queries/getVersions/${encodeURIComponent(id)}`);
            console.log("DocMgr.getVersions response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async getSoftwareThatUsesLibrary(callback: any, library: UsesLibrary) {
        console.log("DocMgr.getSoftwareThatUsesLibrary() library=", library);
        try {
            await this.http.getStream(`${REACT_APP_ODS_SERVER}/api/queries/getSoftwareThatUsesLibrary?library=` + JSON.stringify(library) , undefined, callback);
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async searchSboms(callback: any, data: any) {
        console.log("DocMgr.searchSboms()");
        try {
            await this.http.postStream(`${REACT_APP_ODS_SERVER}/api/queries/searchSboms`, data, undefined, callback);
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async getRemoteCollectionNames(surveyorUrl:string, user: string, pw: string): Promise<string[] | null> {
        try {
            const response = await this.http.post(`${REACT_APP_ODS_SERVER}/api/backup/getRemoteCollectionNames`, {surveyorUrl: surveyorUrl, user: user, pass: pw});
            console.log("DocMgr.getRemoteCollectionNames response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async importDataFromTarget(names:string, surveyorUrl:string, user: string, pw: string, deleteCollection=false): Promise<void> {
        try{
            const namesArray = names.split(",")
            const namesObjArray = [];
            for (const name of namesArray) {
                namesObjArray.push({name: name, match: {}, options: {}})
            }
            const response = await this.http.post(`${REACT_APP_ODS_SERVER}/api/backup/importCollections`, {names: namesObjArray, surveyorUrl: surveyorUrl, user: user, pass: pw, deleteCollection: deleteCollection});
            console.log("DocMgr.importDataFromTarget response=", response.data);
            const body = response.data;
            return body;
        }catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    async getStatus(): Promise<any> {
        try {
            const response = await this.http.get(`${REACT_APP_ODS_SERVER}/api/status`);
            // console.log("status response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }
}
