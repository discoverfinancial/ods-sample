/**
 * Copyright (c) 2025 Capital One
*/

import { OdsDocStates, Roles } from "./base";

// Roles for Depsdev documents
export const depsdevRoles: Roles = {
    Administrator: {
        name: "Admin",
        getMembers: "Admin",
    },
    Employee: {
        name: "Employee",
        getMembers: "Employee",
    },
}

export const DepsdevAdministrator = depsdevRoles.Administrator.name;
export const DepsdevEmployee = depsdevRoles.Employee.name;

export const depsdevStates: OdsDocStates = {
    created: {
        label: "Created",
        description: "Created",
        entry: [DepsdevEmployee],
        read: [DepsdevAdministrator],
        write: [DepsdevAdministrator],
        nextStates: {},
    }
}
