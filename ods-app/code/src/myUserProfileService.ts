/**
 * Copyright (c) 2025 Capital One
*/

import { UserContext } from 'dlms-base';
import { Config, throwErr } from 'dlms-server';
import { Role } from './ui/src/common/states';
import { EtlProfileService } from 'ods-framework';

// User profiles that can log in
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
        roles: [Role.Administrator],
        department: 'Computer Room',
        email: 'admin@test.com',
        title: 'Tech Guru',
        employeeNumber: '3456',
    },
    {
        id: 'editor',
        name: 'Editor',
        roles: [Role.Employee, Role.Editor],
        department: 'Product Development',
        email: 'editor@test.com',
        title: 'Director',
        employeeNumber: '9876',
    },
];

// Passwords for users
const passwords: any = {
    admin: 'pw',
    employee: 'pw',
    editor: 'pw',
};

export function getDefaultUserForRole(role: string, app?: string) {
    const r = Object.values(Role).find(r => r === role);
    if (r) {
        const u = {
            id: r + 'Role',
            name: r + ' Role' + (app ? ' for '+app : ''),
            roles: [r],
            department: '',
            email: '',
            title: '',
            employeeNumber: '',
        }
        if (r == Role.Administrator) {
            u.roles.push(Role.Editor);
            u.roles.push(Role.Employee);
        }
        else if (r == Role.Editor) {
            u.roles.push(Role.Employee);
        }
        return u;
    }
    return null;
}

export class MyUserProfileService implements EtlProfileService {
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
                return [ { user: u } ];
            }
        }

        const apiToken = process.env['API_TOKEN'] || process.env['DLMS_ADMIN_admin'];
        if (apiToken && claimsOrUid === apiToken) {
            console.log('loginUser matches API_TOKEN, so just get context for admin');
            const ctx = getDefaultUserForRole(Role.Administrator, "Api Token");
            console.log("ctx=", ctx);
            if (ctx) {
                return [{ user: ctx }];
            }
        }

        // If uid is a api key, return default user for the role
        const apiKeys = process.env["API_KEYS"] ? process.env["API_KEYS"].split(",") : [];
        for (const apiKey of apiKeys) {
            const [key, role, app] = apiKey.split(":");
            if (claimsOrUid == key) {
                const u = getDefaultUserForRole(role, app);
                if (u) {
                    return [ { user: u } ];
                }
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
        if (!passwords.hasOwnProperty(uid) || !(passwords[uid] == pwd)) {

            // Get API keys from the environment variable.
            // Format is "key:role:appName" such as "12345678:Editor:DLMS App,876543:Admin:Demo App"
            const apiKeys = process.env['API_KEYS'];

            // If there are API keys and the password matches one of the API keys, get the user context for the user.
            if (apiKeys) {
                const keys = apiKeys.split(",");
                for (const key of keys) {
                    const parts = key.split(":");
                    if (parts.length == 3) {
                        if (pwd === parts[0]) {
                            const app = parts?.[2];
                            const ctxs = await this.getProfile(uid || pwd);  // If no uid, then use key as uid
                            const ctx = ctxs[0];
                    
                            // User must have the specified role
                            if (ctx.user.roles.includes(parts[1])) {
                                console.log('loginUser matches API_KEYS for app '+app+' and role '+parts[1]+', so just get context for user');
                                return ctx;
                            }
                        }
                    }
                }
            }

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
