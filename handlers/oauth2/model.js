'use strict';

// Directly retrieved from: 
// https://github.com/oauthjs/express-oauth-server/blob/master/examples/memory/model.js

/**
 * Constructor.
 * 
 * Simulates a database that stores user identities. Adding a user or client is as simple as 
 * adding a dictionary entry in the array.
 * 
 */
function InMemoryCache() {
    this.clients = [{ clientId: '456', clientSecret: 'rlgl', redirectUris: [''] }];
    this.tokens = [];
    this.users = [{ id: '001', username: 'front_man', password: 'vips' }];
}

/**
 * Dump the cache for debugging.
 */
InMemoryCache.prototype.dump = function () {
    console.log('clients', this.clients);
    console.log('tokens', this.tokens);
    console.log('users', this.users);
};

/*
 * Get access token.
 * Used in OAuth Client Credentials Flow.
 */
InMemoryCache.prototype.getAccessToken = function (bearerToken) {
    var tokens = this.tokens.filter(function (token) {
        return token.accessToken === bearerToken;
    });

    return tokens.length ? tokens[0] : false;
};

/**
 * Get refresh token.
 */
InMemoryCache.prototype.getRefreshToken = function (bearerToken) {
    var tokens = this.tokens.filter(function (token) {
        return token.refreshToken === bearerToken;
    });

    return tokens.length ? tokens[0] : false;
};

/**
 * Get client.
 * Used in OAuth Client Credentials Flow.
 */
InMemoryCache.prototype.getClient = function (clientId, clientSecret) {
    var clients = this.clients.filter(function (client) {
        return client.clientId === clientId && client.clientSecret === clientSecret;
    });

    return clients.length ? clients[0] : false;
};

/**
 * Save token.
 */
InMemoryCache.prototype.saveToken = function (token, client, user) {
    this.tokens.push({
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        clientId: client.clientId,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        userId: user.id
    });
};

/*
 * Get user. 
 * Used in OAuth Authorization Code Grant. 
 */
InMemoryCache.prototype.getUser = function (username, password) {
    var users = this.users.filter(function (user) {
        return user.username === username && user.password === password;
    });

    return users.length ? users[0] : false;
};

/**
 * Export constructor.
 */
module.exports = InMemoryCache;