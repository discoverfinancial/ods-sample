/**
 * Copyright (c) 2025 Capital One
*/

import { Http } from '../Http'
import { DocError } from './Managers';

const REACT_APP_ODS_SERVER = process.env.REACT_APP_ODS_SERVER || "";
const urlPath = `${REACT_APP_ODS_SERVER}/api/notebook`;

export class NotebookMgr {

    http: Http = Http.getInstance();
    private static instance: NotebookMgr;

    constructor() { }

    public static init(): NotebookMgr {
        if (this.instance !== undefined) {
            return this.instance;
        }
        this.instance = new NotebookMgr();
        return this.instance;
    }

    public static getInstance(): NotebookMgr {
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
            const response = await this.http.get(`${urlPath}/${cmd}`);
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
            const response = await this.http.post(`${urlPath}/${cmd}`, data);
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
            const response = await this.http.delete(`${urlPath}/${cmd}`);
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
     * Looks up the notebook id and cell id from the notebook and cell name.
     * 
     * @param notebookName The name of the notebook.  If there are multiple notebooks with the same name, it returns the most recent one.
     * @param cellNameOrNumber The cell name or number in the notebook.
     * @returns Object {notebookId, cellId}
     */
    async lookupNotebookCell(notebookName: string, cellNameOrNumber: string | number): Promise<any> {
        const q = {
            type: "notebook",
            name: notebookName,
        }
        const scriptMgr = ScriptMgr.getInstance();
        const _scriptNotebooks = await scriptMgr.getDocuments({ params: { match: q, options: { sort: { dateUpdated: -1}}} });
        console.log("_scriptPages=", _scriptNotebooks);
        const nbId = _scriptNotebooks[0].id;
        const script = JSON.parse(_scriptNotebooks[0].script);
        console.log("script=", script);
        for (var i = 0; i < script.cells.length; i++) {
            const cell = script.cells[i];
            if ("" + cellNameOrNumber === "" + i) {
                return { notebookId: nbId, cellId: cell.id };
            }
            if ("" + cellNameOrNumber === cell.name) {
                return { notebookId: nbId, cellId: cell.id };
            }
        }
        return null;
    }

    /**
     * Gets the notebook cell data given the notebook and cell name.
     * 
     * @param notebookName The name of the notebook.  If there are multiple notebooks with the same name, it returns the most recent one.
     * @param cellNameOrNumber The cell name or number in the notebook.
     * @returns Object
     */
    async getNotebookCell(notebookName: string, cellNameOrNumber: string | number) : Promise<any> {
        try {
            const ids = await this.lookupNotebookCell(notebookName, cellNameOrNumber);
            console.log("ids=", ids);
            if (!ids) {
                throw new Error("Notebook name or cell name not found");
            }
            const http = Http.getInstance();
            const response = await http.get(`/api/notebook/getNotebookvar/${ids.notebookId}/cellResult_${ids.cellId}`);
            return (response.data);
        } catch (e) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }        
    }
}


