/**
 * Copyright (c) 2025 Capital One
*/

const compression = require('compression');
import express, { NextFunction, Response, Request } from "express";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import * as path from "path";
import { Server, Config, Logger, ServerArgs } from "dlms-server";
import swaggerUi from "swagger-ui-express";
import { RegisterRoutes } from "./routes";

import { addBasicAuthMiddleware } from './authBasic';
import { addNoAuthMiddleware } from './authNone';
import { MyUserProfileService } from './myUserProfileService';


import { ValidateError } from "tsoa";
import { setupProxy } from "./proxyConfig";
setupProxy();
const axios = require("axios")
const { spawn } = require("child_process");
const log = new Logger("surveyor-app");
import { Role } from "./ui/src/common/util";
const cfg = new Config();

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
const dbApp = process.env["DB_APP"] || "odsapp";
const odsServer = process.env["ODS_SERVER"] || "http://localhost:3000";

const userLog: any = {}; // [email]: date
let logHttpResponseBody = process.env.LOG_HTTP_RESPONSE_BODY;


function trimString(string: string, length: number) {
    if (string.length > length) {
        return string.substring(0, length) + '...';
    }
    return string;
}


// Logger middleware
function logger(req: Request, res: Response, next: NextFunction) {
    const url = trimString(req.originalUrl, 100);
    log.info(`Received request: ${req.method} ${url}`);
    const oldWrite = res.write;
    const oldEnd = res.end;
    const chunks: any = [];
    let contentType: string | undefined;
    function handleChunk(chunk: any) {
        if (logHttpResponseBody && chunk) {
            if (!contentType) {
                contentType = res.getHeader('content-type')?.toString();
            }
            if (!contentType?.startsWith('image')) {
                chunks.push(convertChunk(chunk));
            }
        }
    }
    res.write = function (chunk: any, ...args) {
        handleChunk(chunk);
        return oldWrite.apply(res, [chunk, ...args] as any);
    };
    (res as any).end = function (chunk: any, ...args: any[]) {
        log.info(`Sent response: ${res.statusCode} ${url}`);
        handleChunk(chunk);
        if (chunks.length > 0) {
            const body = Buffer.concat(chunks).toString('utf8');
            log.debug(`Response body: ${body}`);
        }
        oldEnd.apply(res, [chunk, ...args] as any);
    };
    res.on('error', (err: any) => {
        log.warn(
            `Error from ${req.method} ${url}: ${JSON.stringify(err)}`
        );
    });
    next();
}

function convertChunk(chunk: any): any {
    if (typeof chunk === 'string') {
        chunk = Buffer.from(chunk, 'utf-8');
    }
    return chunk;
}

// Error handling middleware
function handleError(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (err instanceof ValidateError) {
        log.warn(
            `Caught validation error for ${req.path}: ${JSON.stringify(err.fields)}`
        );
        return res.status(422).json({
            code: 422,
            message: `Validation failed: ${JSON.stringify(err?.fields)}`,
        });
    }
    if (err) {
        const code = err.scode || 500;
        const message = err.msg || err.message;
        log.warn(
            `Caught error for ${req.path} (${code}): ${err.stack}`
        );
        return res.status(code).json({ code, message });
    }
    next();
}

// Cross-domain middleware
function allowCrossDomain(_req: Request, res: Response, next: NextFunction) {
    let authRequest = false;
    if (_req.headers?.['access-control-request-headers']?.includes('authorization') || _req.headers?.authorization) {
        authRequest = true;
    }

    const originHeader = _req.headers?.origin || cfg.corsOrigin;
    // console.log("allowCrossDomain: origin header=", originHeader)
    res.header('Access-Control-Allow-Origin', originHeader);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Request-Headers', '*');
    if (authRequest) {
        res.header('Access-Control-Allow-Headers', 'authorization,content-type');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Expose-Headers', 'content-type');
    }
    else {
        res.header('Access-Control-Allow-Headers', '*');
        res.header('Access-Control-Expose-Headers', '*');
    }

    next();
}

async function addCustomRoutes(app: express.Application) {

    const shouldCompress = (req: express.Request, res: express.Response) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        console.log("Compressing result " + req.url);
        return compression.filter(req, res);
    };

    app.use(compression({
        filter: shouldCompress,
        threshold: 0
    }));

    app.get("/api/info", function (_req: express.Request, res: express.Response) {
        const port = process.env["PORT"] || "3010";
        const baseUrl = process.env["BASE_URL"] || "http://localhost:" + port;
        const oauthEnabled = process.env["OAUTH_ENABLED"] || false;
        const basicAuthEnabled = process.env["BASIC_AUTH_ENABLED"] || false;
        res.send({ baseUrl, port, oauthEnabled, basicAuthEnabled, dbApp });
    });

    const swaggerDocument = require("../build/swagger.json");
    app.use("/api/ods-app-swagger", swaggerUi.serveFiles(swaggerDocument), swaggerUi.setup(swaggerDocument));

    RegisterRoutes(app);

    app.use(async function handler(req: express.Request, res: express.Response, next: express.NextFunction) {
        const url = req.originalUrl;
        const ctx = (req as any)._ctx;
        if (ctx?.user?.email) {
            const now = Date.now();
            // If user not found or not accessed in last 5 min, then log user
            if (!userLog[ctx.user.email] || (userLog[ctx.user.email] < (now - 5 * 60 * 1000))) {
                // await appMgr.writeLog(ctx, "User logged in: " + ctx.user.email)
            }
            userLog[ctx.user.email] = now;
        }
        next();
    })

    app.use(function errorHandler(
        err: unknown,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ): express.Response | void {
        if (err instanceof ValidateError) {
            console.warn(`Caught Validation Error for ${req.path}:`, JSON.stringify(err.fields, null, 4));
            console.warn("request was ", JSON.stringify(req.body, null, 4))
            return res.status(422).json({
                message: "Validation Failed",
                details: err?.fields,
            });
        }
        if (err instanceof Error) {
            console.log("err =", err);
            console.log("err json =", JSON.stringify(err, null, 4));
            const scode = (err as any).scode || 500;
            console.log(">>> scode =", scode);
            let message = err.message || "Internal Server Error";
            console.log(">>> message =", message);
            let statusText = err.name || "Internal Server Error";
            console.log(">>> statusText =", statusText);
            if (scode == 404) {
                message = "Not Found";
            }
            if (scode == 422) {
                return res.status(422).json({
                    statusText: "Validation Failed",
                    message: message,
                });
            }
            return res.status(scode).json({
                statusText: statusText,
                message: message,
            });
        }

        next();
    });

    if (process.env.NODE_ENV !== "production") {
        // Check if React dev server is running on PORT+1
        const port = parseInt(process.env["PORT"] || "3010");
        let reactPort = port + 1;
        let found = 0;
        while (found < 2) {
            try {
                log.info("Looking for React dev server on port", reactPort);
                const r = await axios.get(`http://127.0.0.1:${reactPort}`, { proxy: false });
                // If found on port, then done
                if (r.data.indexOf("Surveyor") > -1) {
                    log.info("Found React Dev server running on port ", reactPort);
                    found = 2;
                }
                else {
                    reactPort++;
                }
            }
            catch (e) {
                if ((e as any).code == "ECONNREFUSED") {
                    log.info("Not running on port, so start it")
                    const subprocess = spawn(`cd src/ui && PORT=${reactPort} REACT_APP_SERVER=${port} REACT_APP_DB_APP=${dbApp} REACT_APP_ODS_SERVER=${odsServer} BROWSER=none npm run start`, {
                        shell: true,
                    });
                    subprocess.unref();
                    subprocess.stdout.on("data", (data: Buffer) => {
                        log.info("React: ", data.toString());
                    })
                    found = 2;
                }
                else {
                    log.info("Error:", e);
                    log.info("Error starting React Dev server - Exiting")
                    process.exit(1);
                }
            }
        }

        app.get('/*', async function (_req: express.Request, res: express.Response, next: express.NextFunction) {
            let url = _req.url;
            log.info(`GET ${url}`);

            // Get url
            const getUrl = async (url: string) => {
                try {
                    const r = await axios.get(`http://127.0.0.1:${reactPort}${url}`, { responseType: "arraybuffer", proxy: false });
                    const buffer = Buffer.from(r.data);
                    const contentType = r.headers["content-type"];
                    res.setHeader("content-type", contentType)
                    res.status(200).send(buffer);
                    return true;
                }
                catch (e) {
                    log.info("e=", e);
                    return false;
                }
            }

            // If file with extension, then try to get file
            if (url.indexOf(".") > -1) {
                if (await getUrl(url)) { return }
            }

            // If no extension, then send to React dev server
            if (await getUrl("")) { return }

            // If not found, then try to get file
            if (await getUrl(url)) { return }

            // If still not found, then send to next handler
            next();
        });
    }
    else {
        let dirname = __dirname;
        const i = __dirname.indexOf("/build");
        if (i > -1) {
            dirname = __dirname.substring(0, i) + "/src/";
        }
        log.debug("dirname=", dirname);
        app.use(express.static(path.join(dirname, 'ui/build')));
        app.get('/*', function (_req: express.Request, res: express.Response) {
            res.sendFile(path.join(dirname, 'ui/build', 'index.html'));
        });
    }
}

export const users = [
    {
        id: "employee",
        name: "Employee",
        roles: [Role.Employee],
        department: "Product Development",
        email: "reviewer@test.com",
        title: "Director",
        employeeNumber: "9876",
    },
    {
        id: "editor",
        name: "Editor",
        roles: [Role.Editor, Role.Employee],
        department: "Product Development",
        email: "requestor@test.com",
        title: "Project Lead",
        employeeNumber: "1234",
    },
    {
        id: "admin",
        name: "Admin",
        roles: [Role.Administrator, Role.Editor, Role.Employee],
        department: "Computer Room",
        email: "admin@test.com",
        title: "Tech Guru",
        employeeNumber: "3456",
    },
];

async function main() {
    const userId = "employee"; //config.getStr("USER", "admin");
    let user = users[0];
    for (const _user of users) {
        if (_user.id == userId) {
            user = _user;
        }
    }
    log.info("Default user=", user);

    const app = express();
    app.set('json spaces', 2);
    // Add middleware
    app.use(logger);
    app.use(allowCrossDomain);
    app.use(express.urlencoded({ extended: false }));

    app.get(
        '/health',
        function (_req: express.Request, res: express.Response) {
            res.send('OK');
        }
    );

    app.use(cookieParser());
    const myUserProfileService = new MyUserProfileService();
    if (cfg.basicAuthEnabled) {
        addBasicAuthMiddleware(
            app,
            cfg,
            myUserProfileService
        );
    } else {
        addNoAuthMiddleware(
            app,
            users[0],
            cfg
        );
    }
    app.use(
        '/api/*',
        bodyParser.urlencoded({
            parameterLimit: 100000,
            limit: '200mb',
            extended: true,
        })
    );
    app.use('/api/*', bodyParser.json({ limit: '200mb' }));
    // Register routes generated by tsoa from the controllers
    // await RegisterRoutes(app);
    // Register any custom routes
    await addCustomRoutes(app);
    app.use(handleError);
    const port = parseInt(cfg.port);
    app.listen(port, () => {
        log.info(`Listening on port ${port}`);
    });
}

main();
