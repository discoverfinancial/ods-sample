/**
 * Copyright (c) 2025 Capital One
*/

import { Http } from '../Http'
import { DocError } from './Managers';

const REACT_APP_ODS_SERVER = process.env.REACT_APP_ODS_SERVER || "";

export class SurveyorMgr {

    http: Http = Http.getInstance();
    private static instance: SurveyorMgr;

    constructor() { }

    public static init(): SurveyorMgr {
        if (this.instance !== undefined) {
            return this.instance;
        }
        this.instance = new SurveyorMgr();
        return this.instance;
    }

    public static getInstance(): SurveyorMgr {
        return this.init();
    }


    /**
     * Process a command
     * 
     * @param cmd The command to run
     * @returns 
     */
    async process(cmd: string): Promise<any> {
        try {
            const response = await this.http.get(`${REACT_APP_ODS_SERVER}/api/surveyor/process/${cmd}`);
            console.log("retrieveNew response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    /**
     * Process a command with post
     * 
     * @param cmd The command to run
     * @returns 
     */
    async processPost(cmd: string, data: any): Promise<any> {
        try {
            const response = await this.http.post(`${REACT_APP_ODS_SERVER}/api/surveyor/process/${cmd}`, data);
            console.log("retrieveNew response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    /**
     * Process a command
     * 
     * @param cmd The command to run
     * @returns 
     */
    async processDelete(cmd: string): Promise<any> {
        try {
            const response = await this.http.delete(`${REACT_APP_ODS_SERVER}/api/surveyor/process/${cmd}`);
            console.log("retrieveNew response=", response)
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    
}


