/**
 * Copyright (c) 2025 Capital One
*/

import { Person, UserGroupInfo } from '../common';
import { DocMgr } from './DocMgr';

export class Admin {
    
    defaultMembers: any = {
        "Admin": [
            "enteryouremail@here.com",
        ],
    }
    async init() {
        console.log("Admin.init()")
        const docMgr = DocMgr.getInstance();
        for (var name in this.defaultMembers) {
            let emails = this.defaultMembers[name];
            let members:Person[] = [];
            for (var email of emails) {
                console.log("email=",email)
                const profile = await docMgr.getUserProfile(email);
                if (!profile || profile.error || profile.length == 0) {
                    members.push({
                            email: email,
                            name: email.split("@")[0],
                            department: "",
                            title: "",
                            employeeNumber: "",
                    })
                }
                else{
                    for(let i = 0; i < profile.length; i++){
                        members.push({
                            email: profile[i].user.email,
                            name: profile[i].user.name,
                            department: profile[i].user.department,
                            title: profile[i].user.title,
                            employeeNumber: profile[i].user.employeeNumber,
                        });
                    }
                }
            }
            let r = await docMgr.getUserGroup(name);
            let m = r.members;
            console.log(" -- members=", m);
            //await docMgr.deleteUserGroup(name);
            if (!m) {
                console.log("-- creating ",name," to ",members);
                await docMgr.createUserGroup(name, members);
            }
            else if (m.length === 0) {
                console.log("-- setting ",name," to ",members);
                await docMgr.setUserGroup(name, members);
            }
        }
    }

    async setMembers(group:string, members: any):Promise<void> {
        console.log(`setMembers(${group}, ${members})`);
        await DocMgr.getInstance().setUserGroup(group, members);
    }

    async getGroups():Promise<UserGroupInfo[]> {
        console.log("getGroups()")
        const groups = await DocMgr.getInstance().getUserGroups();
        return groups;
    }

    async getMembers(group:string):Promise<Person[]> {
        console.log(`getMembers(${group})`)
        const r = await DocMgr.getInstance().getUserGroup(group);
        return r.members;
    }

    async getGroup(group:string):Promise<UserGroupInfo> {
        console.log(`getGroup(${group})`)
        const r = await DocMgr.getInstance().getUserGroup(group);
        return r;
    }

    async addGroup(group: string): Promise<UserGroupInfo> {
        console.log(`addGroup(${group})`);
        let groups = await this.getGroups();
        for (var g of groups) {
            if (g.id == group) {
                return g;
            }
        }
        await DocMgr.getInstance().createUserGroup(group, []);
        return await this.getGroup(group);
    }

    async deleteGroup(group: string) : Promise<boolean> {
        console.log(`deleteGroup(${group})`);
        let r = await DocMgr.getInstance().deleteUserGroup(group);
        return r;
    }


}
