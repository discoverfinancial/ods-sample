/**
 * Copyright (c) 2025 Capital One
*/

import * as express from "express";
import { Controller, Get, Path, Route, Request, Query } from "tsoa";
import { AppMgr } from "../appMgr";
import { MyUserProfileService } from "../myUserProfileService";
import { Logger } from "ods-framework";
const log = new Logger("DfsServicesController");

@Route("/api")
export class OdsServicesController extends Controller {

    @Get("/profile/{email}")
    public async getProfile(@Request() req: express.Request, @Path() email: string, @Query() details?: string): Promise<any> {
        try {
            const userProfile = new MyUserProfileService();
            const mgr = AppMgr.getInstance();
            mgr.getCtx(req);
            const data = await userProfile.get(email, details ? true : false);
            return data;
        } catch (e: any) {
            return { error: e.message };
        }
    }

    @Get("/logout")
    public async doLogout(@Request() req: express.Request): Promise<any> {
        log.info("logout")
        const mgr = AppMgr.getInstance();
        const ctx = mgr.getCtx(req);
        mgr.logout(ctx);
        return req.res?.redirect('/logout');
    }

}