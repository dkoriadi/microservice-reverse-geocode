'use strict';

const fs = require('fs');
const jwt = require('jsonwebtoken');
const model = require('./model');

/**
 * Generate a signed JSON web token (JWT) with signature after OAuth authentication of user 
 * credentials is done. Here, the supported OAuth flow is the client credentials flow i.e.
 * only the client_id and the client_secret are checked. An in-memory cache is simulated as 
 * the database to store user credentials. 
 * 
 * NOTE:
 * In real-life, an actual database should be used to add or remove user credentials/tokens,
 * along with proper security measures. Refer to https://github.com/oauthjs/express-oauth-server/tree/master/examples
 * for an actual implementation of OAuth database using MongoDB/PostgreSQL.
 *
 * @param {Object} req - Incoming HTTP request, or use API Gateway Lambda Proxy Input Format
 * 
 * 
 * @returns {Promise<string>} token - JSON web token (JWT) that is signed using private key, 
 *                                    including the payload too
 * 
 * @throws If invalid credentials are given in request, null is returned instead
 * 
 */
async function generateSignedJwt(req) {
    // OAuth standards say that the credentials are to be submitted in the request body as 
    // "Form URL Encoded". This is to parse the request body
    // NOTE: The "querystring" module can also be used, but it is deprecated.
    var oAuthParams;
    if (req.isBase64Encoded && req.isBase64Encoded === true) {
        // Handle the API GW HTTP API (v2.0) Lambda Proxy Input format
        let buff = Buffer.from(req.body, "base64");
        let reqBodyStr = buff.toString('UTF-8');
        oAuthParams = new URLSearchParams(reqBodyStr);
    }
    else {
        // Handle the API GW REST API (v1.0) Lambda Proxy Input format
        oAuthParams = new URLSearchParams(req.body);
    }

    try {
        // Authenticate the user by checking if the client_id and client_secret are valid
        var client = authenticateUser(oAuthParams.get("client_id"), oAuthParams.get("client_secret"))
        if (!client) {
            // Invalid credentials
            return null;
        }

        // Load private key for signing JWT
        const privateKey = fs.readFileSync('./oauth2/certs/private.key')
        
        // Create and sign the token along with payload
        const token = jwt.sign(
            {
                client_id : client.clientId
            },
            privateKey,
            { 
                algorithm: 'RS256',
                expiresIn: '1H',   // Tokens last for 1 hour before expiry
                audience: 'admin', // Must match audience in HTTP API authorizer (if applicable)
                issuer: 'https://127.0.0.1:4000/',
                keyid: 'my-key-id' // Must match "kid" in jwks.json
            }
        );    
        //console.log(token)
        return token;
    }
    catch (error) {
        console.log(error);   
        return null; 
    }
}

/**
 * Helper function to authenticate user credentials. 
 * 
 * Any future modifications to the storage or authentication of user credentials should 
 * be done in this function. In addition, override the `model.js` with methods to CRUD
 * the database.
 * 
 * Refer to https://github.com/oauthjs/express-oauth-server/tree/master/examples for an 
 * actual implementation of OAuth database using MongoDB/PostgreSQL.
 *
 * @param {string} client_id - Client ID from incoming HTTP request
 * 
 * @param {string} client_secret - Client secret from incoming HTTP request
 * 
 * 
 * @returns {Object} client - A dictionary of the client in the model, containing client ID,
 *                                   client secret and redirect URIs. 
 * 
 * @throws If client does not exist, false boolean is returned instead
 * 
 */
function authenticateUser(client_id, client_secret) {
    var database = new model();
    //database.dump();        
    return database.getClient(client_id, client_secret);
}

module.exports = {
    generateSignedJwt
};
