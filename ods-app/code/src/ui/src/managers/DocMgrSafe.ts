/**
 * Copyright (c) 2025 Capital One
*/

import { DocMgr } from './DocMgr';

export class DocMgrSafe extends DocMgr {

    private static instanceSafe: DocMgrSafe;

    public static init(): DocMgrSafe {
        if (this.instanceSafe !== undefined) {
            return this.instanceSafe;
        }
        this.instanceSafe = new DocMgrSafe();
        return this.instanceSafe;
    }

    async runAction(type: string, document: any, data: any): Promise<any | null> {
        throw new Error("Not allowed")
    }

    async getRemoteCollectionNames(surveyorUrl:string, user: string, pw: string): Promise<string[] | null> {
        throw new Error("Not allowed")
    }

    async importDataFromTarget(names:string, surveyorUrl:string, user: string, pw: string, deleteCollection=false): Promise<void> {
        throw new Error("Not allowed")
    }

    async getStatus(): Promise<any> {
        throw new Error("Not allowed")
    }    
}
