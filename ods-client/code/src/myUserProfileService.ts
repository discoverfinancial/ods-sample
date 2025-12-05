/**
 * Copyright (c) 2025 Capital One
*/

import { UserContext } from 'dlms-base';
import { Config, throwErr } from 'dlms-server';

export const Role = {
    Administrator: "Admin",
    Editor: "Editor",
    Employee: "Employee",
}

export const users = [
    {
        id: 'employee',
        name: 'Employee',
        roles: [Role.Employee],
        department: 'Product Development',
        email: 'requestor@test.com',
        title: 'Project Lead',
        employeeNumber: '1234',
    },
    {
        id: 'admin',
        name: 'Admin',
        roles: [Role.Administrator, Role.Editor, Role.Employee],
        department: 'Computer Room',
        email: 'admin@test.com',
        title: 'Tech Guru',
        employeeNumber: '3456',
    },
    {
        id: 'editor',
        name: 'Editor',
        roles: [Role.Editor, Role.Employee],
        department: 'Product Development',
        email: 'editor@test.com',
        title: 'Director',
        employeeNumber: '9876',
    },
];

const passwords: any = {
    admin: 'pw',
    employee: 'pw',
    editor: 'pw',
};

export class MyUserProfileService {
    /**
     * Get profile object from claims
     *
     * @param {any} claimsOrUid - The user claims or UID to retrieve the profile.
     * @param details Return entire profile object.  Currently not supported.
     * @returns {Promise<UserContext[]>} LDAP profile object
     */
    async getProfile(claimsOrUid: any, details=false): Promise<UserContext[]> {
        console.log(`MyUserProfileService.get: claims=${claimsOrUid}`);
        const email =
            typeof claimsOrUid === 'string' ? claimsOrUid : claimsOrUid.email;
        for (const u of users) {
            if (u.email == email || u.id == email) {
                return [
                    {
                        user: u,
                    },
                ];
            }
        }
        throwErr(
            500,
            'Get profile from claims failed - try to log in again later.'
        );
    }

    /**
     * Get profile object from claims
     *
     * @param {any} claimsOrUid - The user claims or UID to retrieve the profile.
     * @param details Return entire profile object.  Currently not supported.
     * @returns {Promise<UserContext[]>} LDAP profile object
     */
    async get(claimsOrUid: any, details=false): Promise<UserContext[]> {
        console.log(`MyUserProfileService.get: claims=${claimsOrUid}`);
        return this.getProfile(claimsOrUid, details);
    }

    /**
     * Verify user authentication based on provided user ID and password.
     *
     * @param {string} uid - The user ID to verify.
     * @param {string} pwd - The password associated with the user ID.
     * @returns {Promise<UserContext>} The user context object upon successful verification.
     */
    async verify(uid: string, pwd: string): Promise<UserContext> {
        console.log(`MyUserProfileService.verify: uid=${uid}`);
        if (!passwords.hasOwnProperty(uid) && !(passwords[uid] == pwd)) {
            throwErr(500, 'Authentication failed.');
        }
        return (await this.get(uid))[0];
    }

    /**
     * Log out the current user context
     * 
     * @param ctx The user context.
     */
    async logout(ctx: UserContext) {
        console.log(`MyUserProfileService.logout: ctx=${JSON.stringify(ctx)}`);
        // currently does nothing
    }

    /**
     * Build a management chain 
     */
    async getManagementChain(users: string[]): Promise<any[]> {
        return [];
    }
}
