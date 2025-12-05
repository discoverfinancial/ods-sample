/**
 * Copyright (c) 2025 Capital One
*/

import express from "express";
import { Body, Controller, Delete, Get, Patch, Path, Post, Put, Query, Request, Response, Route } from "tsoa";
import { CommentCreate, CommentUpdate, SbomDocumentCreate, SbomDocumentUpdate } from "../ui/src/common/common";
import { Logger, sleep } from "dlms-server";
import { decompress } from "lz-ts";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
const log = new Logger("odsServerController");
const drainTimeout = parseInt("" + process.env["DRAIN_TIMEOUT"]) || 60000;

const odsServerUrl = process.env["ODS_SERVER"] || "http://localhost:3000";

/**
 * odsServerController is meant to be a proxy, forwarding http requests
 * on to the ODS Server and sending the responses back to the caller.
 * It needs to respect the config options that were placed on the
 * original request (e.g. responseType, maxRetries, etc).  But
 * the request to the ODS Server will be made strictly using the user
 * token provided in the application's environment variables so
 * config.auth and Authorization header values supplied by the caller
 * can be ignored.
 */

/**
 * Configures the Axios request headers for the ODS Server API.
 * Returns AxiosRequestConfig. The configured Axios request options.
 */
const config = () => {
    return {
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 60000,
        auth: {
            username: process.env["ODS_SERVER_USER"] || "",
            password: process.env["ODS_SERVER_PASS"] || "",
        }
    }
}

@Route("/api/odsServer")
export class OdsServerController extends Controller {

    @Get("info")
    public async getInfo(@Request() req: express.Request): Promise<any> {
        try {
            const r = await axios.get(`${odsServerUrl}/api/info`, { ...config(), proxy: false });
            if (r.status !== 200 || !r.data || typeof r.data !== "object") {
                console.log("odsServer/info error: ", r.status);
            }
            return r.data;
        } catch(err: any) {
            // error could be an AggregateError, in which case multiple
            //  errors could come back
            console.log("error getting ods server information");
            let error = null;
            if (err.message) {
                console.log("error: ", err.message);
                error = err;
            } else {
                if (Array.isArray(err.errors) && err.errors.length > 0) {
                    console.log("error: ", err.errors[0].message);
                    error = err.errors[0];
                }
            }
            return req.res?.status(500).json({
                statusText: "Error retrieving server info",
                message: error.message,
            });
        }
    }

    @Get("roles")
    public async getRoles(@Request() req: express.Request): Promise<any> {
        const r = await axios.get(`${odsServerUrl}/api/roles`, { ...config(), proxy: false });
        if (r.status !== 200 || !r.data || typeof r.data !== "object") {
            console.log("odsServer/info error: ", r.status);
        }
        return r.data;
    }

}

@Route("/api/odsServer/docs")
export class SbomController extends Controller {

    @Response('401', 'User access denied')
    @Response('500', 'Internal Server Error.  Check database connection')
    @Response('422', 'Validation Error')
    @Get("sbom")
    public async getSboms(@Request() req: express.Request): Promise<any> {
        const r = await axios.get(`${odsServerUrl}/api/docs/sbom`, { ...config(), proxy: false });
        if (r.status !== 200 || !r.data || typeof r.data !== "object") {
            console.log(`GET odsServer/docs/sbom error: ${r.status}`);
        }
        return r.data;
    }

    @Response('401', 'User access denied')
    @Response('404', 'Document does not exist')
    @Response('500', 'Internal Server Error.  Check database connection')
    @Response('422', 'Validation Error')
    @Get("sbom/{id}")
    public async getSbom(@Request() req: express.Request, @Path() id: string): Promise<any> {
        const r = await axios.get(`${odsServerUrl}/api/docs/sbom/${id}`, { ...config(), proxy: false });
        if (r.status !== 200 || !r.data || typeof r.data !== "object") {
            console.log(`GET odsServer/docs/sbom/${id} error: ${r.status}`);
        }
        return r.data;
    }

    /**
     * If a request for documents comes in a POST request, it is likely
     * to be a stream request.  If it is a streaming request, then this
     * method should pass the request on to the ODS Server as a streaming
     * request and pass the data back as streaming data.  In any event,
     * the request to the ODS Server should always be compressed.
     * @param req
     * @param body
     * @returns Sboms that match the given filter
     */
    @Response('401', 'User access denied')
    @Response('500', 'Internal Server Error.  Check database connection')
    @Response('422', 'Validation Error')
    @Post("sbom")
    public async getSbomsWithFilter(@Request() req: express.Request, @Body() body: any): Promise<any> {
        const useCompression = body.stream && body.stream === "compress" ? true : false;
        const origRequest = req;
        // remove default config headers since we aren't using them
        const {headers, ...postConfig} =  config();
        // TODO: should always compress between here and ODS Server, not pass
        //  thru the caller's body.stream value
        const r = await axios.post(`${odsServerUrl}/api/docs/sbom`, {...body, stream: "compress"}, { ...postConfig, proxy: false, responseType: 'stream', maxRedirects: 0});
        if (body.stream && !useCompression) {
            // caller is indicating that they don't want the stream back
            //  compressed
            if (!origRequest.res) {
                this.setStatus(500);
                return;
            }
            const origRes = origRequest.res;
            
            r.data.on('data', async (chunk:any) => {
                // each 'chunk' is a Buffer containing a portion of the response
                //  body
                try {
                    const start = Date.now();
                    let count = 0;
                    let origChars = 0;
                    let sentChars = 0;
                    let pause = 0;
                    let waitingForDrain = 0;
                    let dataString = chunk.toString();
                    if (dataString.length !== 16 || !parseInt(dataString)) {
                        dataString = decompress(dataString);
                        console.log('decompressed chunk:', dataString);
                    }
                    const writeRes = origRes.write(dataString);
                    // If we can't write the chunk, then we need to wait for
                    //  the pipe to drain.  Waiting for the "drain" event.
                    //  If we wait as long as the drainTimeout, we'll send an
                    //  error and end the streaming.
                    if (!writeRes) {
                        waitingForDrain++;
                        pause = 10;
                        origRes.once("drain", ()=> {
                            pause = 0;
                        })
                    }
                    while (pause) {
                        pause = pause + 10;
                        if (pause > drainTimeout) {
                            log.debug("Error: Drain not received, so closing stream");
                            origRes.status(500);
                            origRes.end();
                            break;
                        }
                        await sleep(10);
                    }
                } catch (e) {
                    console.log(">>>>> got stream error here: ", e);
                    origRes.status(500);
                    origRes.end();
                }
            });

            r.data.on('end', () => {
              console.log('Stream finished.');
            });

            r.data.on('error', (err:any) => {
              console.error('Stream error:', err);
            });
        } else {
            // caller expects compressed results, so can go ahead and fall through
            //  to return the Node http.IncomingMessage stream that is contained
            //  in r.data
        }
        if (r.status !== 200 || !r.data || typeof r.data !== "object") {
            console.log(`POST odsServer/docs/sbom error: ${r.status}`);
        }
        return r.data;
    }

    @Response('401', 'User access denied')
    @Response('404', 'Document does not exist')
    @Response('500', 'Internal Server Error.  Check database connection')
    @Response('422', 'Validation Error')
    @Put("sbom")
    public async createSbom(@Request() req: express.Request, @Body() body: SbomDocumentCreate): Promise<any> {
        const reqConfig = {...config};
        const r = await axios.put(`${odsServerUrl}/api/docs/sbom`, body, { ...config(), headers: req.headers, proxy: false });
        if (r.status !== 200 || !r.data || typeof r.data !== "object") {
            console.log(`PUT odsServer/docs/sbom error: ${r.status}`);
        }
        return r.data;
    }

    @Response('401', 'User access denied')
    @Response('404', 'Document does not exist')
    @Response('500', 'Internal Server Error.  Check database connection')
    @Response('422', 'Validation Error')
    @Patch("sbom/{id}")
    public async updateSbom(@Request() req: express.Request, @Path() id: string, @Body() body: SbomDocumentUpdate): Promise<any> {
        const r = await axios.patch(`${odsServerUrl}/api/docs/sbom/${id}`, body, { ...config(), proxy: false });
        if (r.status !== 200 || !r.data || typeof r.data !== "object") {
            console.log(`PATCH odsServer/docs/sbom/${id} error: ${r.status}`);
        }
        return r.data;
    }

    @Response('401', 'User access denied')
    @Response('404', 'Document does not exist')
    @Response('500', 'Internal Server Error.  Check database connection')
    @Response('422', 'Validation Error')
    @Delete("sbom/{id}")
    public async deleteSbom(@Request() req: express.Request, @Path() id: string): Promise<any> {
        const r = await axios.delete(`${odsServerUrl}/api/docs/sbom/${id}`, { ...config(), proxy: false });
        if (r.status !== 200 || !r.data || typeof r.data !== "object") {
            console.log(`DELETE odsServer/docs/sbom/${id}} error: ${r.status}`);
        }
        return r.data;
    }

    @Response('401', 'User access denied')
    @Response('500', 'Internal Server Error.  Check database connection')
    @Response('422', 'Validation Error')
    @Delete("sbom")
    public async deleteSbomWithFilter(@Request() req: express.Request, @Query() match: string): Promise<any> {
        const r = await axios.delete(`${odsServerUrl}/api/docs/sbom?match=${match}`, { ...config(), proxy: false });
        if (r.status !== 200 || !r.data || typeof r.data !== "object") {
            console.log(`DELETE odsServer/docs/sbom?match=${match}} error: ${r.status}`);
        }
        return r.data;
    }

    @Response('401', 'User access denied')
    @Response('404', 'Document does not exist')
    @Response('500', 'Internal Server Error.  Check database connection')
    @Response('422', 'Validation Error')
    @Put("sbom/{id}/comment")
    public async addSbomComment(@Request() req: express.Request, @Path() id: string, @Body() body: CommentCreate): Promise<any> {
        const r = await axios.put(`${odsServerUrl}/api/docs/sbom/${id}/comment`, body, { ...config(), proxy: false });
        if (r.status !== 200 || !r.data || typeof r.data !== "object") {
            console.log(`PUT odsServer/docs/sbom/${id}/comment error: ${r.status}`);
        }
        return r.data;
    }

    @Response('401', 'User access denied')
    @Response('404', 'Document does not exist')
    @Response('500', 'Internal Server Error.  Check database connection')
    @Response('422', 'Validation Error')
    @Patch("sbom/{id}/comment/{commentId}")
    public async updateSbomComment(@Request() req: express.Request, @Path() id: string, @Path() commentId: string, @Body() body: CommentUpdate): Promise<any> {
        const r = await axios.patch(`${odsServerUrl}/api/docs/sbom/${id}/comment/${commentId}`, body, { ...config(), proxy: false });
        if (r.status !== 200 || !r.data || typeof r.data !== "object") {
            console.log(`PUT odsServer/docs/sbom/${id}/comment error: ${r.status}`);
        }
        return r.data;
    }

    @Response('401', 'User access denied')
    @Response('404', 'Document does not exist')
    @Response('500', 'Internal Server Error.  Check database connection')
    @Response('422', 'Validation Error')
    @Delete("sbom/{id}/comment/{commentId}")
    public async deleteSbomComment(@Request() req: express.Request, @Path() id: string, @Path() commentId: string): Promise<any> {
        const r = await axios.delete(`${odsServerUrl}/api/docs/sbom/${id}/comment/${commentId}`, { ...config(), proxy: false });
        if (r.status !== 200 || !r.data || typeof r.data !== "object") {
            console.log(`DELETE odsServer/docs/sbom/${id}/comment/${commentId} error: ${r.status}`);
        }
        return r.data;
    }


    @Put("sbom/{id}/attachments")
    public async addSbomAttachment(@Request() req: express.Request, @Path() id: string, @Body() body: CommentCreate): Promise<any> {
        const r = await axios.put(`${odsServerUrl}/api/docs/sbom/${id}/attachments`, body, { ...config(), headers: req.headers, proxy: false });
        if (r.status !== 200 || !r.data || typeof r.data !== "object") {
            console.log(`PUT odsServer/docs/sbom/${id}/attachments error: ${r.status}`);
        }
        return r.data;
    }

    @Delete("sbom/{id}/attachments/{attachmentId}")
    public async deleteSbomAttachment(@Request() req: express.Request, @Path() id: string, @Path() attachmentId: string): Promise<any> {
        const r = await axios.delete(`${odsServerUrl}/api/docs/sbom/${id}/attachments/${attachmentId}`, { ...config(), proxy: false });
        if (r.status !== 200 || !r.data || typeof r.data !== "object") {
            console.log(`DELETE odsServer/docs/sbom/${id}/attachments/${attachmentId} error: ${r.status}`);
        }
        return r.data;
    }

}