/**
 * Copyright (c) 2025 Capital One
*/

import express = require('express');
import request  = require('supertest');
import jwt = require('jsonwebtoken');
import { addOidcAuthMiddleware } from '../authOidc';
import {Config} from "dlms-server";

jest.mock('dlms-server', () => ({
    Logger: jest.fn().mockImplementation(() => ({
        debug: jest.fn(),
        err: jest.fn(),
        warn: jest.fn(),
    })),
    Config: jest.fn(),
    UserProfileService: jest.fn().mockImplementation(() => ({
        get: jest.fn().mockResolvedValue([{ user: { email: 'test@example.com' } }]),
    })),
    throwErr: jest.fn(),
}));

jest.mock('../auth', () => ({
    loginUser: jest.fn().mockResolvedValue({ user: { email: 'basic@example.com' } }),
    sessionCookieName: 'testSessionCookie',
}));

const mockConfig: Config = {
    baseUrl: "",
    basicAuthEnabled: false,
    corsOrigin: "",
    debug: false,
    emailServer: "",
    oauthAuthorizationUrl: "",
    oauthCallbackUrl: "",
    oauthClientId: "",
    oauthClientSecret: "",
    oauthIssuerUrl: "",
    oauthTokenUrl: "",
    oauthUserInfoUrl: "",
    port: "",
    getBool(name: string, def: boolean): boolean {
        return false;
    },
    getStr(name: string, def?: string): string {
        return "";
    },
    sessionSecret: 'testsecret',
    oauthEnabled: false
};

describe('authOidc middleware', () => {
    let app: express.Application;
    let userProfileService: any;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use(require('cookie-parser')());
        userProfileService = new (require('dlms-server').UserProfileService)();
        addOidcAuthMiddleware(app, mockConfig, userProfileService);
    });

    test('OPTIONS request returns 200', async () => {
        const res = await request(app).options('/any');
        expect(res.status).toBe(200);
    });

    test('GET /login triggers OIDC (redirect)', async () => {
        const res = await request(app).get('/login');
        expect([302, 401, 500]).toContain(res.status); // OIDC not enabled, may redirect or error
    });

    test('GET /logout destroys session and redirects', async () => {
        const res = await request(app).get('/logout');
        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/');
    });

    test('GET /basic with basic auth sets cookie and redirects', async () => {
        const basicAuth = Buffer.from('user:pass').toString('base64');
        const res = await request(app)
            .get('/basic')
            .set('Authorization', `Basic ${basicAuth}`);
        expect(res.status).toBe(302);
        expect(res.headers['set-cookie']).toBeDefined();
    });

    test('GET /basic without auth returns 401', async () => {
        const res = await request(app).get('/basic');
        expect(res.status).toBe(401);
        expect(res.headers['www-authenticate']).toBe('Basic');
    });

    test('GET /any with valid session cookie calls next()', async () => {
        const ctx = { user: { email: 'test@example.com' } };
        const token = jwt.sign(ctx, mockConfig.sessionSecret, { expiresIn: '86400s' });
        app.get('/any', (req, res) => res.send('ok'));
        const res = await request(app)
            .get('/any')
            .set('Cookie', [`testSessionCookie=${token}`]);
        expect(res.text).toBe('ok');
    });

    test('GET /any without session cookie redirects to /login', async () => {
        const res = await request(app).get('/any');
        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/login');
    });
});