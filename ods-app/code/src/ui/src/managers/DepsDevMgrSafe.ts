/**
 * Copyright (c) 2025 Capital One
*/

import { DepsDevMgr } from './DepsDevMgr';
import { Http } from '../Http'

export class DepsDevMgrSafe extends DepsDevMgr {

    http: Http = Http.getInstance();
    private static instanceSafe: DepsDevMgrSafe;

    public static init(): DepsDevMgrSafe {
        if (this.instanceSafe !== undefined) {
            return this.instanceSafe;
        }
        this.instanceSafe = new DepsDevMgrSafe();
        return this.instanceSafe;
    }

    public static getInstance(): DepsDevMgrSafe {
        return this.init();
    }

    async deleteDocument(id: string): Promise<boolean> {
        throw new Error("Not allowed")
    }

    async deleteDocuments(): Promise<void> {
        throw new Error("Not allowed")
    }

    async deleteMany(match: any) : Promise<any> {
        throw new Error("Not allowed")
    }    

}