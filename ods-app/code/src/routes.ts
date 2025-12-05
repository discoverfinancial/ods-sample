/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { QueriesController } from './controllers/surveyorController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SurveyorController } from './controllers/surveyorController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { OdsServicesController } from './controllers/odsServicesController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ServiceController } from './controllers/etlController';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "MostUsed": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "group": {"dataType":"string","required":true},
            "basePurl": {"dataType":"string","required":true},
            "count": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OssAnalysis": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "version": {"dataType":"string","required":true},
            "purl": {"dataType":"string","required":true},
            "basePurl": {"dataType":"string","required":true},
            "latestVersion": {"dataType":"string","required":true},
            "scorecard": {"dataType":"any","required":true},
            "guidance": {"dataType":"any","required":true},
            "links": {"dataType":"any","required":true},
            "packageKey": {"dataType":"any","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "GetVersions": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "version": {"dataType":"string","required":true},
            "group": {"dataType":"string","required":true},
            "basePurl": {"dataType":"string","required":true},
            "count": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsQueriesController_getMostUsed: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                directDependency: {"default":false,"in":"query","name":"directDependency","dataType":"boolean"},
        };
        app.get('/api/queries/getMostUsed',
            ...(fetchMiddlewares<RequestHandler>(QueriesController)),
            ...(fetchMiddlewares<RequestHandler>(QueriesController.prototype.getMostUsed)),

            async function QueriesController_getMostUsed(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsQueriesController_getMostUsed, request, response });

                const controller = new QueriesController();

              await templateService.apiHandler({
                methodName: 'getMostUsed',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsQueriesController_getOssAnalysis: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                sbomId: {"in":"path","name":"sbomId","required":true,"dataType":"string"},
        };
        app.get('/api/queries/getOssAnalysis/:sbomId',
            ...(fetchMiddlewares<RequestHandler>(QueriesController)),
            ...(fetchMiddlewares<RequestHandler>(QueriesController.prototype.getOssAnalysis)),

            async function QueriesController_getOssAnalysis(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsQueriesController_getOssAnalysis, request, response });

                const controller = new QueriesController();

              await templateService.apiHandler({
                methodName: 'getOssAnalysis',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsQueriesController_getVersions: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                id: {"in":"path","name":"id","required":true,"dataType":"any"},
        };
        app.get('/api/queries/getVersions/:id',
            ...(fetchMiddlewares<RequestHandler>(QueriesController)),
            ...(fetchMiddlewares<RequestHandler>(QueriesController.prototype.getVersions)),

            async function QueriesController_getVersions(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsQueriesController_getVersions, request, response });

                const controller = new QueriesController();

              await templateService.apiHandler({
                methodName: 'getVersions',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsQueriesController_getSoftwareThatUsesLibrary: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                library: {"in":"query","name":"library","required":true,"dataType":"string"},
                stream: {"in":"query","name":"stream","required":true,"dataType":"string"},
        };
        app.get('/api/queries/getSoftwareThatUsesLibrary',
            ...(fetchMiddlewares<RequestHandler>(QueriesController)),
            ...(fetchMiddlewares<RequestHandler>(QueriesController.prototype.getSoftwareThatUsesLibrary)),

            async function QueriesController_getSoftwareThatUsesLibrary(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsQueriesController_getSoftwareThatUsesLibrary, request, response });

                const controller = new QueriesController();

              await templateService.apiHandler({
                methodName: 'getSoftwareThatUsesLibrary',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsQueriesController_searchSboms: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                body: {"in":"body","name":"body","required":true,"dataType":"any"},
        };
        app.post('/api/queries/searchSboms',
            ...(fetchMiddlewares<RequestHandler>(QueriesController)),
            ...(fetchMiddlewares<RequestHandler>(QueriesController.prototype.searchSboms)),

            async function QueriesController_searchSboms(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsQueriesController_searchSboms, request, response });

                const controller = new QueriesController();

              await templateService.apiHandler({
                methodName: 'searchSboms',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSurveyorController_surveyorProcessCommand: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                cmd: {"in":"path","name":"cmd","required":true,"dataType":"string"},
        };
        app.get('/api/surveyor/process/:cmd',
            ...(fetchMiddlewares<RequestHandler>(SurveyorController)),
            ...(fetchMiddlewares<RequestHandler>(SurveyorController.prototype.surveyorProcessCommand)),

            async function SurveyorController_surveyorProcessCommand(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSurveyorController_surveyorProcessCommand, request, response });

                const controller = new SurveyorController();

              await templateService.apiHandler({
                methodName: 'surveyorProcessCommand',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOdsServicesController_getProfile: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                email: {"in":"path","name":"email","required":true,"dataType":"string"},
                details: {"in":"query","name":"details","dataType":"string"},
        };
        app.get('/api/profile/:email',
            ...(fetchMiddlewares<RequestHandler>(OdsServicesController)),
            ...(fetchMiddlewares<RequestHandler>(OdsServicesController.prototype.getProfile)),

            async function OdsServicesController_getProfile(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOdsServicesController_getProfile, request, response });

                const controller = new OdsServicesController();

              await templateService.apiHandler({
                methodName: 'getProfile',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOdsServicesController_doLogout: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/api/logout',
            ...(fetchMiddlewares<RequestHandler>(OdsServicesController)),
            ...(fetchMiddlewares<RequestHandler>(OdsServicesController.prototype.doLogout)),

            async function OdsServicesController_doLogout(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOdsServicesController_doLogout, request, response });

                const controller = new OdsServicesController();

              await templateService.apiHandler({
                methodName: 'doLogout',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsServiceController_postCommand: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                cmd: {"in":"path","name":"cmd","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"dataType":"any"},
        };
        app.post('/api/service/process/:cmd',
            ...(fetchMiddlewares<RequestHandler>(ServiceController)),
            ...(fetchMiddlewares<RequestHandler>(ServiceController.prototype.postCommand)),

            async function ServiceController_postCommand(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsServiceController_postCommand, request, response });

                const controller = new ServiceController();

              await templateService.apiHandler({
                methodName: 'postCommand',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsServiceController_processCommand: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                cmd: {"in":"path","name":"cmd","required":true,"dataType":"string"},
        };
        app.get('/api/service/process/:cmd',
            ...(fetchMiddlewares<RequestHandler>(ServiceController)),
            ...(fetchMiddlewares<RequestHandler>(ServiceController.prototype.processCommand)),

            async function ServiceController_processCommand(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsServiceController_processCommand, request, response });

                const controller = new ServiceController();

              await templateService.apiHandler({
                methodName: 'processCommand',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsServiceController_processCommand2: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                cmd: {"in":"path","name":"cmd","required":true,"dataType":"string"},
                cmd2: {"in":"path","name":"cmd2","required":true,"dataType":"string"},
        };
        app.get('/api/service/process/:cmd/:cmd2',
            ...(fetchMiddlewares<RequestHandler>(ServiceController)),
            ...(fetchMiddlewares<RequestHandler>(ServiceController.prototype.processCommand2)),

            async function ServiceController_processCommand2(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsServiceController_processCommand2, request, response });

                const controller = new ServiceController();

              await templateService.apiHandler({
                methodName: 'processCommand2',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
