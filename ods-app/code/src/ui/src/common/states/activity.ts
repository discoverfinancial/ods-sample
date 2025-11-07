/**
 * Copyright (c) 2025 Capital One
*/

import {OdsDocStates, Role, Roles} from "./base";

// Roles for ActivityTracker documents
export const activityRoles: Roles = {
    Administrator: {
        name: "Admin",
        getMembers: "Admin",
    },
    Employee: {
        name: "Employee",
        getMembers: "Employee",
    },
}

export const ActivityAdministrator = activityRoles.Administrator.name;
export const ActivityEmployee = activityRoles.Employee.name;

export const activityStates: OdsDocStates = {
    created: {
        label: "Created",
        description: "Created",
        entry: [Role.Employee],
        read: [Role.Employee],
        write: [Role.Administrator],
        nextStates: {
            active: {
                groups: [Role.Administrator]
            },
            updated: {
                groups: [Role.Administrator]
            },
            deleted: {
                groups: [Role.Administrator]
            },
        },
    },
    active: {
        label: "Active",
        description: "Active",
        entry: [Role.Employee],
        read: [Role.Employee],
        write: [Role.Administrator],
        nextStates: {
            created: {
                groups: [Role.Administrator]
            },
            updated: {
                groups: [Role.Administrator]
            },
            deleted: {
                groups: [Role.Administrator]
            },
        },
    },
    updated: {
        label: "Updated",
        description: "Updated",
        entry: [Role.Employee],
        read: [Role.Employee],
        write: [Role.Administrator],
        nextStates: {
            created: {
                groups: [Role.Administrator]
            },
            active: {
                groups: [Role.Administrator]
            },
            deleted: {
                groups: [Role.Administrator]
            },
        },
    },
    deleted: {
        label: "Deleted",
        description: "Deleted",
        entry: [Role.Employee],
        read: [Role.Employee],
        write: [Role.Administrator],
        nextStates: {
            created: {
                groups: [Role.Administrator]
            },
            active: {
                groups: [Role.Administrator]
            },
            updated: {
                groups: [Role.Administrator]
            },
        },
    },
}
