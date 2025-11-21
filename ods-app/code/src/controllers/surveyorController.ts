/**
 * Copyright (c) 2025 Capital One
*/

import { AppMgr } from "../appMgr";
import express from "express";
import { Controller, Route, Get, Post, Patch, Delete, Body, Request, Path, Query, Put } from "tsoa";
import { Logger } from "ods-framework";
import { MostUsed, GetVersions, OssAnalysis } from "../common";
import { Bom } from "ods-framework";

const log = new Logger("surveyorController");

@Route("/api/queries")
export class QueriesController extends Controller {

    @Get("getMostUsed")
    public async getMostUsed(@Request() req: express.Request, @Query() directDependency = false): Promise<MostUsed[]> {
        const mgr = AppMgr.getInstance();
        return await mgr.getMostUsed(directDependency);
    }

    @Get("getOssAnalysis/{sbomId}")
    public async getOssAnalysis(@Request() req: express.Request, @Path() sbomId: string): Promise<OssAnalysis[]> {
        const mgr = AppMgr.getInstance();
        return await mgr.getOssAnalysis(sbomId);
    }

    @Get("getVersions/{id}")
    public async getVersions(@Request() req: express.Request, @Path() id: any): Promise<GetVersions[]> {
        const mgr = AppMgr.getInstance();
        return await mgr.getVersions(id);
    }

    @Get("getSoftwareThatUsesLibrary")
    public async getSoftwareThatUsesLibrary(@Request() req: express.Request, @Query() library: string, @Query() stream: string): Promise<any> {
        const mgr = AppMgr.getInstance();
        try {
            const _library = JSON.parse(library);
            return await mgr.getSoftwareThatUsesLibrary(mgr.getCtx(req), _library, stream, req.res);
        }
        catch (e) {
            console.log("Error: ", e);
            this.setStatus(404);
        }
    }

    @Post("searchSboms")
    public async searchSboms(@Request() req: express.Request, @Body() body: any): Promise<any> {
        const mgr = AppMgr.getInstance();
        try {
            const searchText = body.searchText;
            const searchParam = body.searchParam;
            const searchType = body.searchType;
            const uses = body.uses;
            const vulnerabilities = body.vulnerabilities;
            const usesOrSearch = body.usesOrSearch;
            const onlyVulnerabilities = body.onlyVulnerabilities;
            const nonCompliance = body.nonCompliance;
            const stream = body.stream;
            const res: any = req.res;
            if (stream) {
                await mgr.searchSboms(mgr.getCtx(req), searchText, searchParam, searchType, uses, vulnerabilities, usesOrSearch, onlyVulnerabilities, nonCompliance, stream, res);
            }
            else {
                const result = await mgr.searchSboms(mgr.getCtx(req), searchText, searchParam, searchType, uses, vulnerabilities, usesOrSearch, onlyVulnerabilities, nonCompliance);
                const len: any = result.length;
                res.write(`{"count":${len},"items":[`);
                if (len == 0) {
                }
                else {
                    for (var i = 0; i < len; i++) {
                        res.write(JSON.stringify(result[i]));
                        if (i < len - 1) {
                            res.write(',')
                        }
                    }
                }
                res.write(`]}`)
                res.end();
            }

        }
        catch (e) {
            console.log("Error: ", e);
            this.setStatus(404);
        }
    }

}


@Route("/api/surveyor")
export class SurveyorController extends Controller {

    @Get("process/{cmd}")
    public async surveyorProcessCommand(@Request() req: express.Request, @Path() cmd: string): Promise<any> {
        console.log(">>> processCommand()", cmd);
        const mgr = AppMgr.getInstance();
        const ctx = mgr.getCtx(req);
        const etl = mgr.etl;
        if (!etl) {
            return req.res?.status(404).json({
                message: "ETL is not enabled",
            });
        }

    }

}
