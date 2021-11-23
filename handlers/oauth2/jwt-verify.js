'use strict';

const fs = require('fs');
const jwt = require('jsonwebtoken');

let response;

/**
 * Verifies a signed JSON web token (JWT) with signature when a user passes it in the 
 * request Authoirzation header. Here, the supported OAuth flow is the client credentials 
 * flow. After verifying the JWT, the payload within the JWT is decoded and attached into
 * the return value. 
 *  
 *
 * @param {Object} req - Incoming HTTP request, or use API Gateway Lambda Proxy Input Format
 * 
 * 
 * @returns {Promise<Object>} response - Contains a boolean `isAuthorized` to determine if 
 *                                       the request/JWT is valid or not. Also contains 
 *                                       the decoded payload extracted from JWT. 
 * 
 * @throws If invalid JWTs are given in request, the boolean `isAuthorized` is returned as 
 *         false, along with the specific reason why the JWT is invalid e.g. invalid 
 *         signature, expired token 
 */
async function verifySignedJwt(req) {
    var token = req.headers && (req.headers.Authorization || req.headers.authorization);

    if (!token) {
        // No token provided in request
        console.log("Empty token");            
        response = {
            "isAuthorized": false,
            "context": {
                "message": "Empty token"
            }
        }
        return response;
    }

    // Remove Bearer from string if any before next step
    token = token.replace(/^Bearer\s+/, "");

    // Retrieve public key from certs folder and use it to verify the signature of the JWT
    // After that, verify the audience and issuer within the JWT
    var cert = fs.readFileSync('./oauth2/certs/public.key');  
    try {
        const decoded = await verifyToken(token, cert, { audience: 'admin', issuer: 'https://127.0.0.1:4000/' });
        //console.log(decoded);

        // Forward the query in payload to integration within API GW
        response = {
            "isAuthorized": true,
        }
    } 
    catch (err) {
        // Errors generated from jsonwebtoken library e.g. invalid token, expired token
        //console.log(JSON.stringify(err));
        response = {
            "isAuthorized": false,
            "context": {
                "message": err.message
            }
        }
    } 
    return response
};

/**
 * Helper function to promisify the jwt.verify() asynchronous function (i.e. requiring callback)
 * See: https://www.npmjs.com/package/jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback 
 *  
 * @param {string} token - JWT string to verify. The prefix "Bearer" in front should have been
 *                         removed prior
 * 
 * @param {jwt.Secret} key - Public key, ideally this should be retrieved from OpenID Connect
 *                           Protocol (OIDC)
 * 
 * @param {Object} claims - Valid claims for this specific endpoint i.e. the claims that are 
 *                          allowed for this endpoint should match the ones in JWT
 * 
 * @returns {Promise<jwt.Jwt>} Jwt - Contains the decoded JWT if token is valid 
 * 
 * @throws If token is invalid, the error message will contain the reason why the JWT is 
 *         invalid e.g. invalid signature, expired token 
 */
async function verifyToken(token, key, claims) {
    if (!token) 
        return {};
    return new Promise((resolve, reject) =>
        jwt.verify(token, key, claims, (err, decoded) => err ? reject(err) : resolve(decoded))
    );
}

module.exports = {
    verifySignedJwt
};
