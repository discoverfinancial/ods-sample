/**
 * Copyright (c) 2025 Capital One
*/

import { UserContext, Logger, throwErr, Person, LogLevel } from "ods-framework";
import { ETL, STATUS } from "ods-framework";
import { SbomClient } from "./bom";
import { CdxgenClient } from "./cdxgen";
import { DepsdevClient } from "./depsdev";
import { AppMgr } from "../appMgr";
const log = new Logger("etlTest", LogLevel.Debug);


export class EtlTest {
    etl: ETL;

    constructor(etl: any) {
        this.etl = etl;
    }
    

    test = async (ctx: UserContext, type: string) => {
        const etl = this.etl;
        log.debug(`test(${type})`)
        try {
        if (type == "sbom") {
            const sbomClient = new SbomClient(etl);
            // const docs = await sbomClient.getAllSboms();
            // log.debug("sboms=", docs);
            // return docs;

            // 66bb9f2343abaa7589d65d98
            // let id = "66d30091baf2d2ced7efab27"
            let id = {name: 'ac-details-spa', version: 'v10.96.0'};
            const doc = await sbomClient.getSbomById(ctx, id);
            log.debug("doc=", doc);

            const newDoc = {...doc, _test: Date.now()};
            const update = await sbomClient.updateSbom(ctx, newDoc, id);
            log.debug("update=", update);
            return update;

        }
        else if (type == "cdxgen") {
            const cdxgenClient = new CdxgenClient(etl);
            const r = await cdxgenClient.test();
            log.debug("r=", r);
            return r;
        }
        else if (type == "depsdev") {
            const depsdevClient = new DepsdevClient(etl);
            const r = await depsdevClient.test();
            log.debug("r=", r);
            return r;

            // const depsdev = await depsdevClient.getPackageFromPurl("pkg:npm/axios@1.7.7");
            // log.debug("depsdev=", JSON.stringify(depsdev,null,4));
            // return depsdev;
        }
        else if (type == "script") {
            const r = await etl.runTestScript(ctx, "");
            log.debug("r=", r);
            return r;
        }
        } catch (e) {
            log.info(`Error running ETL text {$type}:` + e);
            etl.setStatus(STATUS.IDLE, `ETL test ${type}`, "Done with Error " + e);
            return "Error";
        }
    }
}