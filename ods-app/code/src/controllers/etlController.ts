/**
 * Copyright (c) 2025 Capital One
*/

import { AppMgr } from "../appMgr";
import express from "express";
import { Controller, Route, Get, Post, Body, Request, Path } from "tsoa";
import { Logger } from "dlms-server";
import { CdxgenClient } from "../etl/cdxgen";
import { DepsdevClient } from "../etl/depsdev";
import { EndoflifeClient } from "../etl/endoflife";
import { EtlTest } from "../etl/etlTest";
import { GuidanceProcessor } from "../etl/guidance";
const log = new Logger("etlController");

/**
 * Controller for ETL (Extract, Transform, Load) service API endpoints.
 * Provides endpoints to process, refresh, and test ETL jobs and related data sources.
 */
@Route("/api/service")
export class ServiceController extends Controller {

    /**
     * Executes a POST ETL command with the specified name and request body.
     * @param req Express request object.
     * @param cmd The command to execute.
     * @param body Request body containing command parameters.
     * @returns The status of the ETL process or error message.
     */
    @Post("process/{cmd}")
    public async postCommand(@Request() req: express.Request, @Path() cmd: string, @Body() body: any) {
        console.log(">>> postCommand()", cmd);
        const mgr = AppMgr.getInstance();
        const ctx = mgr.getCtx(req);
        const etl = mgr.etl;
        if (!etl) {
            return req.res?.status(404).json({
                message: "ETL is not enabled",
            });
        }

    }

    /**
     * Executes a GET ETL command with the specified name.
     * Supports commands for status, refresh, process, update, and test operations.
     * @param req Express request object.
     * @param cmd The command to execute.
     * @returns The result of the command or error message.
     */
    @Get("process/{cmd}")
    public async processCommand(
        @Request() req: express.Request,
        @Path() cmd: string
    ): Promise<any> {
        console.log(">>> processCommand()", cmd);
        const mgr = AppMgr.getInstance();
        const ctx = mgr.getCtx(req);
        const etl = mgr.etl;
        if (!etl) {
            return req.res?.status(404).json({
                message: "ETL is not enabled",
            });
        }
        try {
            if (cmd == "status") {
                const status = etl.getStatus();
                return status;
            }
            if (cmd == "refreshCachedCdxgen") {
                const cdxgenClient = new CdxgenClient(etl);
                cdxgenClient.refreshCache(ctx);
                const status = etl.getStatus();
                return status;
            }
            if (cmd == "updateCdxgenSboms") {
                const cdxgenClient = new CdxgenClient(etl);
                cdxgenClient.updateData(ctx, true);
                const status = etl.getStatus();
                return status;
            }
            if (cmd == "refreshCachedDepsdev") {
                const depsdevClient = new DepsdevClient(etl);
                depsdevClient.refreshCache(ctx);
                const status = etl.getStatus();
                return status;
            }
            if (cmd == "updateGuidance") {
                const guidanceProcessor = new GuidanceProcessor(etl);
                guidanceProcessor.process(ctx);
                const status = etl.getStatus();
                return status;
            }
            if (cmd == "refreshCachedEndoflife") {
                const eolClient = new EndoflifeClient(etl);
                eolClient.refreshCache(ctx, false);
                const status = etl.getStatus();
                return status;
            }
            if (cmd == "deleteEndoflife") {
                const eolClient = new EndoflifeClient(etl);
                eolClient.deleteAllEndoflife(ctx);
                const status = etl.getStatus();
                return status;
            }
            if (cmd == "getLogs") {
                const r = await etl.getLogs(ctx);
                return r;
            }
            if (cmd == "stop") {
                etl.stop()
                const status = etl.getStatus();
                return status;
            }

            const etlTest = new EtlTest(etl);
            if (cmd == "testSbom") {
                const r = await etlTest.test(ctx, "sbom");
                return r;
            }
            if (cmd == "testCdxgen") {
                const r = await etlTest.test(ctx, "cdxgen");
                return r;
            }
            if (cmd == "testDepsdev") {
                const r = await etlTest.test(ctx, "depsdev");
                return r;
            }
            if (cmd == "testScript") {
                const r = await etlTest.test(ctx, "script");
                return r;
            }
            if (cmd == "testSnow") {
                const r = await etlTest.test(ctx, "snow");
                return r;
            }
            if (cmd == "testDatadog") {
                const r = await etlTest.test(ctx, "datadog");
                return r;
            }
            if (cmd == "testEol") {
                const r = await etlTest.test(ctx, "eol");
                return r;
            }
        }
        catch (err) {
            console.log("err=", err);
            console.log("err=", JSON.stringify(err, null, 4));
            const scode = (err as any).scode;
            let message = (err as any)?.message || "Internal Server Error";
            if (scode == 404) {
                message = "Not Found";
            }
            return req.res?.status(scode).json({
                message: message,
            });

        }
    }

    /**
     * Executes a GET ETL command with two path parameters.
     * Supports commands for deleting logs.
     * @param req Express request object.
     * @param cmd The main command to execute.
     * @param cmd2 The secondary command or identifier.
     * @returns The result of the command or error message.
     */
    @Get("process/{cmd}/{cmd2}")
    public async processCommand2(
        @Request() req: express.Request,
        @Path() cmd: string,
        @Path() cmd2: string
    ): Promise<any> {
        console.log(">>> processCommand2()", cmd, "cmd2=", cmd2);
        const mgr = AppMgr.getInstance();
        const ctx = mgr.getCtx(req);
        const etl = mgr.etl;
        if (!etl) {
            return req.res?.status(404).json({
                message: "ETL is not enabled",
            });
        }

        if (cmd == "deleteLog") {
            const r = await etl.deleteLog(ctx, cmd2);
            return r;
        }
        if (cmd == "deleteLogs") {
            const r = await etl.deleteLogs(ctx, cmd2);
            return r;
        }
    }

}