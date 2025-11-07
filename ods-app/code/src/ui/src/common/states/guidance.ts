/**
 * Copyright (c) 2025 Capital One
*/

import { guidanceType } from "ods-common";
import { OdsDocStates, Role, StateCallbackContext } from "./base";
import { StateActionCallbackReturn } from "dlms-base";

export const guidanceStates: OdsDocStates = {
    // Guidance is created but not active yet
    created: {
        label: "Created",
        description: "Created",
        entry: [Role.Employee],
        read: [Role.Employee],
        write: [Role.Editor, Role.Administrator],
        action: async function (ctx) {
            return await handleAction(ctx);
        },
        nextStates: {
            active: {
                groups: [Role.Administrator],
            },
            closed: {
                groups: [Role.Administrator],
            }
        },
    },
    // All attestations based on this guidance are required & any new products are required to follow it
    active: {
        label: "Active",
        description: "Active",
        entry: [Role.Employee],
        read: [Role.Employee],
        write: [Role.Editor, Role.Administrator],
        action: async function (ctx) {
            return await handleAction(ctx);
        },
        nextStates: {
            closed: {
                groups: [Role.Administrator],
            }
        },
    },
    // No longer active, but attestations still must be done
    closed: {
        label: "Closed",
        description: "Closed",
        entry: [Role.Employee],
        read: [Role.Employee],
        write: [Role.Editor, Role.Administrator],
        nextStates: {},
    },
    // Cancel guidance & cancel all attestations based on it
    cancelled: {
        label: "Cancelled",
        description: "Cancelled",
        onEntry: async function (ctx) {
            console.log("Entering 'cancelled' state for Guidance")
            console.log("Document =", ctx.document);

            return {};
        },
        entry: [Role.Employee],
        read: [Role.Employee],
        write: [Role.Editor, Role.Administrator],
        nextStates: {},
    }
}

const handleAction = async (ctx: StateCallbackContext) : Promise<StateActionCallbackReturn> => {
    console.log("states.ts: action() handleAction() called for state=", ctx.document.state);
    const userContext = ctx.getUserContext();
    
    if (ctx.updates.action == "cancelAllGuidances") {

        // Set all active guidances to cancelled
        try {
            const guidances = await ctx.getDocMgr().getDocs(userContext, guidanceType, {"item.basePurl": ctx.document.item.basePurl, state: "active"});
            // console.log("handleAction: guidances=", guidances);
            for (const guidance of guidances) {
                const cancelled = await ctx.getDocMgr().updateDoc(userContext, {type: guidanceType, id: guidance.id}, {state: "cancelled"});
                console.log("handleAction: cancelled guidance =", cancelled);
            }
        }
        catch (e) {
            console.error(e);
        }
    }

    else if (ctx.updates.action == "updateAttestations") {
        
        //@TODO: Need to call directly now
        // It should only update attestations for the changed guidance, not all

        // Call ETL Service to update attestations
        try {
            // const ETL_SERVICE_URL = process.env["ETL_SERVICE_URL"];
            // if(ETL_SERVICE_URL){
            //     const response = await axios.get(ETL_SERVICE_URL + `/api/service/process/updateAttestations`, config(ctx.getUserContext().user.email));
            //     console.log("attestation response=", response)
            //     const body = response.data;
            //     return body;
            // }else{
            //     console.error(`ETL_SERVICE_URL not set`)
            // }
        }catch (e : any){
            console.error(e);
        }
    }
    return {};
}

// const config = (email: string) => {
//     return {
//         headers: {
//             "Content-Type": "application/json"
//         },
//         auth: {
//             username: email,
//             password: process.env["API_TOKEN"] || "",
//         }
//     }
// }
