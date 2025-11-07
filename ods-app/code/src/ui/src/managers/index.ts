/**
 * Copyright (c) 2025 Capital One
*/

import {DocMgr} from "./DocMgr";
import { SbomMgr } from "./SbomMgr";
import { DocError } from './Managers';
import {ApiTokenMgr} from "./ApiTokenMgr";
import {DepsDevMgr} from "./DepsDevMgr";
import {EtlMgr} from "./EtlMgr";
import {LogMgr} from "./LogMgr";
import {QueryMgr} from "./QueryMgr";
import {ScriptMgr} from "./ScriptMgr";
import { NotebookMgr } from "./NotebookMgr";
import {StoreMgr} from "./StoreMgr";

import {DocMgrSafe} from "./DocMgrSafe";
import { SbomMgrSafe } from "./SbomMgrSafe";
import { DepsDevMgrSafe } from './DepsDevMgrSafe';



export const copyDocField = (dest: any, src: any, fieldName: string) => {
    const parts = fieldName.split(".");
    dest[parts[0]] = src[parts[0]];
}

export const getDocField = (document: any, fieldName: string) => {
    const parts = fieldName.split(".");
    let obj = document;
    for (let i=0; i<parts.length; i++) {
        if (obj) {
            obj = obj[parts[i]];
        }
        else {
            return null;
        }
    }
    return obj;
}

export const setDocField = (document: any, fieldName: string, value: any) => {
    const parts = fieldName.split(".");
    let obj = document;
    const lenM1 = parts.length-1;
    for (let i=0; i<lenM1; i++) {
        let isArray = false;
        if (!obj.hasOwnProperty([parts[i]])) {
                if (i < lenM1 &&  parts[i+1] == "0") {
                    obj[parts[i]] = [];
                }
                else {
                    obj[parts[i]] = {};
                }
        }
        obj = obj[parts[i]];
    }
    obj[parts[lenM1]] = value;
}

export const getMgrModels = (runAsEmployee: boolean) => {
    if (runAsEmployee) {
        return {
            DocError, 
            DepsDevMgr: DepsDevMgrSafe, 
            DocMgr: DocMgrSafe,
            SbomMgr: SbomMgrSafe,
        }
    }
    else {
        return {
            DocError, DepsDevMgr, EtlMgr, LogMgr, QueryMgr, ScriptMgr, NotebookMgr, StoreMgr, SbomMgr, DocMgr
        }
    }
}