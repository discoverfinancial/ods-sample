/**
 * Copyright (c) 2025 Capital One
*/

//import axios from "axios";
//import fs from "fs";
//import nodeCron from "node-cron";
//import crypto from 'crypto';
//import * as path from 'path';
import axios, { AxiosResponse } from "axios";
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

export class OdsAppTest {

    public static async createSbom(url: string) {
        try {
            const ods = new OdsAppTest();
            await ods.doCreateSbom(url);
        } catch (e: any) {
            console.error(`ERROR: createSbom from ${url} failed: ${e.stack}`);
        }
    }

    public async doCreateSbom(url: string) {
        try {
            const cli = await (eval('import("@cyclonedx/cdxgen")') as Promise<typeof import("@cyclonedx/cdxgen")>);
            let retry = 0;
            while (retry < 5) {
                try {
                    const bom = await cli.createBom(url, { projectType: ["github"] });
                    console.log("SINGLE BOM=", JSON.stringify(bom,null,4));
                    // console.log("NEW SBOM=", JSON.stringify(sbom,null,4));
                    retry = 9999;
                } catch (e) {
                    console.log("Error getting BOM from =", url + " --> retry =", retry);
                    console.log("Error:", e);
                    retry++;
                }
            }
            if (retry < 9999 ) {
                console.log(">>> ABORTED: Error getting BOM from file =", url + " --> retries exhausted =", retry);
            }
        } catch (e) {
            console.log("Error in doCreateSbom: ", e);
        }
    }

}


function cfg(name: string, def?: string): string {
    const rtn = process.env[name];
    if (!rtn) {
        if (def) {
            return def;
        }
        return fatal(`${name} environment variable is not set`);
    }
    return rtn;
}
    
function throwErr(msg: string): never {
    throw new Error(msg);
}

function fatal(msg: string): never {
    console.error(`ERROR: ${msg}`);
    process.exit(1);
}

function usage(msg?: string) {
    if (msg) {
        console.log(`Error: ${msg}`);
    }
    console.log(`Usage: node odsTestApp { createSbom } <from_github_url>`);
    process.exit(1);
}

async function getSbomsWithFilter(): Promise<any> {
    const body = {
        params: {
            match: {
                aggregate: [{
                    "$sort": { "dateCreated": -1 }
                }]
            }
        }
    }

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
        // const usingCompression = body.stream;
        // const newBody = {...body, stream: "compress"};
        // const origRequest = req;
        // const {headers, ...postConfig} =  config();
        // const r = await axios.post(`${odsServerUrl}/api/docs/sbom2`, newBody, { ...postConfig, proxy: false, responseType: 'text', maxRedirects: 0, onDownloadProgress: async (e: any): Promise<void> => {
        //     try {
        //         const start = Date.now();
        //         let count = 0;
        //         let origChars = 0;
        //         let sentChars = 0;
        //         let pause = 0;
        //         let waitingForDrain = 0;
        //         const res = (origRequest.res as any) as express.Response;
        //         const req = e.event.target as XMLHttpRequest;
        //         if (!req) return;
        //         console.log(">>postStream: e =",e, "readyState =", req.readyState);
        //         let chunk = req.responseText;
        //         // console.log("CHUNK=",chunk)
        //         // if the caller isn't expecting compression, decompress
        //         //  chunk now
        //         if (!usingCompression) {
        //             chunk = decompress(chunk);
        //         }
        //         const r = res.write(chunk);
        //         if (!r) {
        //             waitingForDrain++;
        //             pause = 10;
        //             res.once("drain", ()=> {
        //                 pause = 0;
        //             })
        //         }
        //         while (pause) {
        //             pause = pause + 10;
        //             if (pause > drainTimeout) {
        //                 log.debug("Error: Drain not received, so closing stream");
        //                 res.status(500);
        //                 res.end();
        //                 break;
        //             }
        //             await sleep(10);
        //         }
        //     } catch (e) {
        //         console.log(">>>>> got stream error here: ", e);
        //         throw(e);
        //     }
        // }
        // });
        // if (r.status !== 200 || !r.data || typeof r.data !== "object") {
        //     console.log(`POST odsServer/docs/sbom2 error: ${r.status}`);
        // } else {

        // }
        // return r.data;
        //const usingCompression = body.stream;
        //const {stream, ...newBody} = body;
        const newBody = body;
        const {headers, ...postConfig} =  config();
        const r = await axios.post(`http://localhost:3000/api/docs/sbom2`, {...newBody, stream: "compress"}, { ...postConfig, proxy: false, responseType: 'text', maxRedirects: 0, onDownloadProgress: async (e: any): Promise<void> => {
            console.log(`>>> progress loaded: ${e.loaded} total: ${e.total}`);
        }
        });
        if (r.status !== 200 || !r.data || typeof r.data !== "object") {
            console.log(`POST odsServer/docs/sbom2 error: ${r.status}`);
        }
        return r.data;
    }

    async function getSbomsWithFilterTypeStream(): Promise<any> {
    const body = {
        params: {
            match: {
                aggregate: [{
                    "$sort": { "dateCreated": -1 }
                }]
            }
        }
    }

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

    const newBody = body;
    const {headers, ...postConfig} =  config();
    const response = await axios.post(`http://localhost:3000/api/docs/sbom2`, {...newBody, stream: "nocompress"}, { ...postConfig, proxy: false, responseType: 'stream', maxRedirects: 0});
    response.data.on('data', (chunk:any) => {
      // Each 'chunk' is a Buffer containing a portion of the response body.
      // You may need to parse it if sending structured data like JSON.
      const dataString = chunk.toString();
      console.log('Received chunk:', dataString);

      // If sending JSON lines, you might parse each line:
      try {
        const parsedChunk = JSON.parse(dataString);
        console.log('Parsed chunk:', parsedChunk);
      } catch (error) {
        console.error('Error parsing chunk:', error);
      }
    });

    response.data.on('end', () => {
      console.log('Stream finished.');
    });

    response.data.on('error', (err:any) => {
      console.error('Stream error:', err);
    });

}

async function main() {
    const args = process.argv.slice(2);
    if (args.length == 0) {
        usage();
    }
    const cmd = args[0];

    if (cmd === 'createSbom') {
        if (args.length == 2) {
            const url = args[1];
            if (url) {
                await OdsAppTest.createSbom(url);
            }
            else {
                usage();
            }
        }
        else {
            usage();
        }
    } else if (cmd === 'streamDocs') {
        //await getSbomsWithFilter();
        await getSbomsWithFilterTypeStream();
    } else {
        usage(`invalid command: '${cmd}'`);
    }
}

main();
