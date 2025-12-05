/**
 * Copyright (c) 2025 Capital One
*/

import { UserContext, Logger } from "ods-framework";
import { SbomDocumentInfo, Role } from "ods-framework";
import { AppMgr } from "./appMgr";

const log = new Logger("test");

async function main() {
    // Done
    log.debug("Passed");
    process.exit(0);
}


function createUserContext(id: string): UserContext {
    return {
        user: {
           id,
           name: id,
           department: id,
           email: `${id}@acme.com`,
           roles: [Role.Employee],
           title: "chief flunky",
           employeeNumber: id,
        },
    };
}

function myAssert(pass: boolean, err: string) {
   if (!pass) {
      throw Error(err);
   }
}

main();
