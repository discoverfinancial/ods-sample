/**
 * Copyright (c) 2025 Capital One
*/

import { assertGuard } from "@nrfcloud/ts-json-schema-transformer";
import { PostDocs, throwErr, Validate } from "ods-framework";
import { validatePostDocs, validateGetDocs } from "ods-framework";
import {
    GuidanceCreate,
    GuidanceUpdate,
    CdxgenCreate,
    CdxgenUpdate,
    DepsdevCreate,
    DepsdevUpdate,
    EndoflifeCreate,
    EndoflifeUpdate,
} from "./common";

export const validateGuidance: Validate = {
    postDocs: validatePostDocs,
    getDocs: validateGetDocs,
    createDoc(type, body) {
        try {
            assertGuard<GuidanceCreate>(body);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
    updateDoc(type, id, args) {
        try {
            assertGuard<GuidanceUpdate>(args);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
}

export const validateDepsdev: Validate = {
    postDocs: validatePostDocs,
    getDocs: validateGetDocs,
    createDoc(type, body) {
        try {
            assertGuard<DepsdevCreate>(body);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
    updateDoc(type, id, args) {
        try {
            assertGuard<DepsdevUpdate>(args);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
}

export const validateCdxgen: Validate = {
    postDocs: validatePostDocs,
    getDocs: validateGetDocs,
    createDoc(type, body) {
        try {
            assertGuard<CdxgenCreate>(body);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
    updateDoc(type, id, args) {
        try {
            assertGuard<CdxgenUpdate>(args);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
}

export const validateEndoflife: Validate = {
    postDocs: validatePostDocs,
    getDocs: validateGetDocs,
    createDoc(type, body) {
        try {
            assertGuard<EndoflifeCreate>(body);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
    updateDoc(type, id, args) {
        try {
            assertGuard<EndoflifeUpdate>(args);
        } catch (e: any) {
            console.log("Validation error =", JSON.stringify(e.cause,null,4));
            return throwErr(422, JSON.stringify(e.cause));
        }
    },
}
