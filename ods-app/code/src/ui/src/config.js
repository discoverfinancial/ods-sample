/**
 * Copyright (c) 2025 Capital One
*/

const CLIENT_ID = process.env.CLIENT_ID || '{clientId}';
const ISSUER = process.env.ISSUER || 'https://{yourOauthDomain}.com/oauth2/default';
const OAUTH_TESTING_DISABLEHTTPSCHECK = process.env.OAUTH_TESTING_DISABLEHTTPSCHECK || false;
const BASENAME = import.meta.env.BASE_URL || '';
// BASENAME includes trailing slash
const REDIRECT_URI = `${window.location.origin}${BASENAME}login/callback`;

export default {
  oidc: {
    clientId: CLIENT_ID,
    issuer: ISSUER,
    redirectUri: REDIRECT_URI,
    scopes: ['openid', 'profile', 'email'],
    pkce: true,
    disableHttpsCheck: OAUTH_TESTING_DISABLEHTTPSCHECK,
  },
  resourceServer: {
    messagesUrl: 'http://localhost:8000/api/messages',
  },
  app: {
    basename: BASENAME,
  },
};