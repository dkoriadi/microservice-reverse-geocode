'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;

var token;

let standardResponse = function(result, statusCode) {
    expect(result).to.be.an('object');
    expect(result.headers["Content-Type"]).to.be.equal("application/json");
    expect(result.statusCode).to.equal(statusCode);
    expect(result.body).to.be.an('string');
};

describe('Tests lambda handler POST requests', function () {
    it('verifies return valid JWT upon valid client_id and valid client_secret', async () => {
        const event = {
            httpMethod : "POST",
            body  : "client_id=456&client_secret=rlgl&grant_type=client_credentials",
        }
        const result = await app.lambdaHandler(event)

        expect(standardResponse(result, 200));

        let response = JSON.parse(result.body);
        token = response.access_token;

        expect(response).to.be.an('object');
        expect(response.token_type).to.be.an('string');
        expect(response.token_type).to.be.equal("Bearer");
        // Just check if expires_in is a valid integer, not the actual duration
        expect(response.expires_in).to.be.an('number'); // JS only has number type not int
        expect(response.expires_in % 1).to.equal(0); // Check if valid int
        expect(response.access_token).to.be.an('string');
        expect(response.access_token).satisfy(token => token.startsWith('eyJ'));;
    });
    it('verifies 401 error upon missing client_id and missing client_secret', async () => {
        const event = {
            httpMethod : "POST",
            body  : "grant_type=client_credentials",
        }
        const result = await app.lambdaHandler(event)

        expect(standardResponse(result, 401));

        let response = JSON.parse(result.body);

        expect(response).to.be.an('string');
        expect(response).to.be.equal("Bad credentials");
    });
    it('verifies 401 error upon valid client_id and invalid client_secret', async () => {
        const event = {
            httpMethod : "POST",
            body  : "client_id=456&client_secret=badcredential&grant_type=client_credentials",
        }
        const result = await app.lambdaHandler(event)

        expect(standardResponse(result, 401));

        let response = JSON.parse(result.body);

        expect(response).to.be.an('string');
        expect(response).to.be.equal("Bad credentials");
    });
    it('verifies 401 error upon valid client_id and missing client_secret', async () => {
        const event = {
            httpMethod : "POST",
            body  : "client_id=456&grant_type=client_credentials",
        }
        const result = await app.lambdaHandler(event)

        expect(standardResponse(result, 401));

        let response = JSON.parse(result.body);

        expect(response).to.be.an('string');
        expect(response).to.be.equal("Bad credentials");
    });
    it('verifies 401 error upon missing client_id and valid client_secret', async () => {
        const event = {
            httpMethod : "POST",
            body  : "client_secret=rlgl&grant_type=client_credentials",
        }
        const result = await app.lambdaHandler(event)

        expect(standardResponse(result, 401));

        let response = JSON.parse(result.body);

        expect(response).to.be.an('string');
        expect(response).to.be.equal("Bad credentials");
    });
});


describe('Tests lambda handler GET requests', function () {
    describe('Testing JWT', function () {
        it('verifies return valid address upon valid JWT', async () => {
            const event = {
                requestContext : {
                    httpMethod: "GET",
                },
                headers : {
                    authorization: `Bearer ${token}`
                },
                queryStringParameters: {
                    lat: "1.295764",
                    lon: "103.858165"
                }
            }
            const result = await app.lambdaHandler(event)

            expect(standardResponse(result, 200));

            let response = JSON.parse(result.body);

            expect(response).to.be.an('object');
            expect(response.lat).to.be.an('string');
            expect(response.lat).to.be.equal(event.queryStringParameters.lat);
            expect(response.lon).to.be.an('string');
            expect(response.lon).to.be.equal(event.queryStringParameters.lon);
            expect(response.address).to.be.an('string');
        });
        it('verifies 401 error upon bad JWT', async () => {
            const event = {
                requestContext : {
                    httpMethod: "GET",
                },
                headers : {
                    authorization: `Bearer invalid_token`
                },
                queryStringParameters: {
                    lat: "1.295764",
                    lon: "103.858165"
                }
            }
            const result = await app.lambdaHandler(event)

            expect(standardResponse(result, 401));

            let response = JSON.parse(result.body);

            expect(response).to.be.an('string');
            expect(response).to.be.equal("jwt malformed"); // JWT library error message
        });
        it('verifies 401 error upon expired JWT', async () => {
            const event = {
                requestContext : {
                    httpMethod: "GET",
                },
                headers : {
                    authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im15LWtleS1pZCJ9.eyJsYXQiOiIxLjI5NDQ2MCIsImxvbiI6IjEwMy44NTMyODAiLCJjbGllbnRfaWQiOiI0NTYiLCJpYXQiOjE2MzYwODQ5ODEsImV4cCI6MTYzNjA4ODU4MSwiYXVkIjoiYWRtaW4iLCJpc3MiOiJodHRwczovLzEyNy4wLjAuMTo0MDAwLyJ9.XBuB1fmN_bJlksrsmGz1YPyvgwHZZA3FnoRzLqA-J-3mScTENfTJSGeYEoUtDKqfKU-ES2aUJIcRHU1qj6kLqGhKK6oMOORkw0Zr4QIUp8K-O2rQwH1tNbo5gRurP1iQaZB5SHMh3O4qdEcUsIDR0x_VOWu_AGdtLAQxJGMjb9Y9w6BZTWsEbp-o-DTGOSejIvTlziJIRB680LZWDY-41h_Dj4TTFeptjfQyqnyLKGza3elsoWE1iO7vOGZQFCemY84yKqrhPlJcp-fK4_xnQduhsfUT3zVX2rLchlrI25gq7FqsWkNAst0A09b2WhBeQOvDRryszhWLDKo23on1PnedL5k9GG7c_1TKQ__ONc50ZmztxAyj5L0ify7BocwdNfhWmcangvISNrtNuKJmqB0H6mfkajce19JZLBAvp0RBmJi4S9tqnrRSGSfqZhxaHbqE7HoKOlOvlo0oFzp0ozXxXv3JvkTyA0bZ260EI4b0xisGsbiwo1Zlv0NOJMmWeFl14JIEinWCwaM_kP9sS6tp1ADwIzepTFWVMblpRCr-5glBZa7s-kS9HMX_2tUogJE8gvgK7rPgkRpH51oGbmvYuZRAWq0RtqmTJ0UbzQTcUvU6muVuESSR4i6RxN_zVd5fcJQfeBPIhjrHbWUTaSvQZng9RFrJHyKrV3IfGdc`
                },
                queryStringParameters: {
                    lat: "1.295764",
                    lon: "103.858165"
                }
            }
            const result = await app.lambdaHandler(event)

            expect(standardResponse(result, 401));

            let response = JSON.parse(result.body);

            expect(response).to.be.an('string');
            expect(response).to.be.equal("jwt expired"); // JWT library error message
        });
        it('verifies 401 error upon invalid JWT signature', async () => {
            const event = {
                requestContext : {
                    httpMethod: "GET",
                },
                headers : {
                    authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im15LWtleS1pZCJ9.eyJsYXQiOiIxLjI5NDQ2MCIsImxvbiI6IjEwMy44NTMyODAiLCJjbGllbnRfaWQiOiI0NTYiLCJpYXQiOjE2MzYwODQ5ODEsImV4cCI6MTYzNjA4ODU4MSwiYXVkIjoiYWRtaW4iLCJpc3MiOiJodHRwczovLzEyNy4wLjAuMTo0MDAwLyJ9.XBuB1fmN_bJlksrsmGz1YPyvgwHZZA3FnoRzLqA-J-3mScTENfTJSGeYEoUtDKqfKU-ES2aUJIcRHU1qj6kLqGhKK6oMOORkw0Zr4QIUp8K-O2rQwH1tNbo5gRurP1iQaZB5SHMh3O4qdEcUsIDR0x_VOWu_AGdtLAQxJGMjb9Y9w6BZTWsEbp-o-DTGOSejIvTlziJIRB680LZWDY-41h_Dj4TTFeptjfQyqnyLKGza3elsoWE1iO7vOGZQFCemY84yKqrhPlJcp-fK4_xnQduhsfUT3zVX2rLchlrI25gq7FqsWkNAst0A09b2WhBeQOvDRryszhWLDKo23on1PnedL5k9GG7c_1TKQ__ONc50ZmztxAyj5L0ify7BocwdNfhWmcangvISNrtNuKJmqB0H6mfkajce19JZLBAvp0RBmJi4S9tqnrRSGSfqZhxaHbqE7HoKOlOvlo0oFzp0ozXxXv3JvkTyA0bZ260EI4b0xisGsbiwo1Zlv0NOJMmWeFl14JIEinWCwaM_kP9sS6tp1ADwIzepTFWVMblpRCr-5glBZa7s-kS9HMX_2tUogJE8gvgK7rPgkRpH51oGbmvYuZRAWq0RtqmTJ0UbzQTcUvU6muVuESSR4i6RxN_zVd5fcJQfeBPIhjrHbWUTaSvQZng9RFrJHyKrV3IfGd`
                },
                queryStringParameters: {
                    lat: "1.295764",
                    lon: "103.858165"
                }
            }
            const result = await app.lambdaHandler(event)

            expect(standardResponse(result, 401));

            let response = JSON.parse(result.body);

            expect(response).to.be.an('string');
            expect(response).to.be.equal("invalid signature"); // JWT library error message
        });
        it('verifies 401 error upon missing JWT', async () => {
            const event = {
                requestContext : {
                    httpMethod: "GET",
                },
                queryStringParameters: {
                    lat: "1.295764",
                    lon: "103.858165"
                }
            }
            const result = await app.lambdaHandler(event)

            expect(standardResponse(result, 401));

            let response = JSON.parse(result.body);

            expect(response).to.be.an('string');
            expect((response) => response.to.be.equal("Empty token") || 
                                 response.to.be.equal("jwt malformed"));
        });
    });
    describe('Testing query parameters', function () {
        it('verifies 400 error upon valid lon but invalid lat', async () => {
            const event = {
                requestContext : {
                    httpMethod: "GET",
                },
                headers : {
                    authorization: `Bearer ${token}`
                },
                queryStringParameters: {
                    lat: "not_valid_lat",
                    lon: "103.858165"
                }
            }
            const result = await app.lambdaHandler(event)

            expect(standardResponse(result, 400));
            let response = JSON.parse(result.body);

            expect(response).to.be.an('string');
            expect(response).to.be.equal("Bad request");
        });
        it('verifies 400 error upon valid lat but invalid lon', async () => {
            const event = {
                requestContext : {
                    httpMethod: "GET",
                },
                headers : {
                    authorization: `Bearer ${token}`
                },
                queryStringParameters: {
                    lat: "1.295764",
                    lon: "not_valid_lon"
                }
            }
            const result = await app.lambdaHandler(event)

            expect(standardResponse(result, 400));

            let response = JSON.parse(result.body);

            expect(response).to.be.an('string');
            expect(response).to.be.equal("Bad request");
        });
        it('verifies 400 error upon invalid lon and invalid lat', async () => {
            const event = {
                requestContext : {
                    httpMethod: "GET",
                },
                headers : {
                    authorization: `Bearer ${token}`
                },
                queryStringParameters: {
                    lat: "not_valid_lat",
                    lon: "not_valid_lon"
                }
            }
            const result = await app.lambdaHandler(event)

            expect(standardResponse(result, 400));

            let response = JSON.parse(result.body);

            expect(response).to.be.an('string');
            expect(response).to.be.equal("Bad request");
        });
        it('verifies 400 error upon missing lon and lat', async () => {
            const event = {
                requestContext : {
                    httpMethod: "GET",
                },
                headers : {
                    authorization: `Bearer ${token}`
                }
            }
            const result = await app.lambdaHandler(event)

            expect(standardResponse(result, 400));

            let response = JSON.parse(result.body);

            expect(response).to.be.an('string');
            expect(response).to.be.equal("Bad request");
        });
        it('verifies 400 error upon valid lon but missing lat', async () => {
            const event = {
                requestContext : {
                    httpMethod: "GET",
                },
                headers : {
                    authorization: `Bearer ${token}`
                },
                queryStringParameters: {
                    lon: "103.858165"
                }
            }
            const result = await app.lambdaHandler(event)

            expect(standardResponse(result, 400));

            let response = JSON.parse(result.body);

            expect(response).to.be.an('string');
            expect(response).to.be.equal("Bad request");
        });
        it('verifies 400 error upon valid lat but missing lon', async () => {
            const event = {
                requestContext : {
                    httpMethod: "GET",
                },
                headers : {
                    authorization: `Bearer ${token}`
                },
                queryStringParameters: {
                    lat: "1.295764",
                }
            }
            const result = await app.lambdaHandler(event)

            expect(standardResponse(result, 400));

            let response = JSON.parse(result.body);

            expect(response).to.be.an('string');
            expect(response).to.be.equal("Bad request");
        });
    });
});
