/**
 * Copyright (c) 2025 Capital One
*/

import { OdsDocStates, Roles } from "./base";

// Roles for Cdxgen documents
export const cdxgenRoles: Roles = {
    Administrator: {
        name: "Admin",
        getMembers: "Admin",
    },
    Employee: {
        name: "Employee",
        getMembers: "Employee",
    },
}

export const CdxgenAdministrator = cdxgenRoles.Administrator.name;
export const CdxgenEmployee = cdxgenRoles.Employee.name;

export const cdxgenStates: OdsDocStates = {
    created: {
        label: "Created",
        description: "Created",
        entry: [CdxgenEmployee],
        read: [CdxgenAdministrator],
        write: [CdxgenAdministrator],
        nextStates: {},
    }
}
