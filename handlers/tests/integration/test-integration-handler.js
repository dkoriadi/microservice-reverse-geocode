'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;
const axios = require('axios')

var postUrl = "http://localhost:4566/restapis/id123/dev/_user_request_/v1/oauth2";
var getUrl = "http://localhost:4566/restapis/id123/dev/_user_request_/v1/geocode";
var token;

let successResponse = function(result) {
    expect(result).to.be.an('object');
    expect(result.status).to.equal(200);
    expect(result.data).to.be.an('object');
};
let failureResponse = function(error, statusCode, message) {
    expect(error.response.status).to.equal(statusCode);
    expect(error.response.data).to.be.an('string');
    expect(error.response.data).to.be.equal(message);
};

describe('Tests lambda handler POST requests', function () {
    it('verifies return valid JWT upon valid client_id and valid client_secret', async () => {
        const params = new URLSearchParams();
        params.append('client_id', '456');
        params.append('client_secret', 'rlgl');
        params.append('grant_type', 'client_credentials');

        const config = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
        }

        const result = await axios.post(postUrl, params, config);

        expect(successResponse(result));

        let response = result.data;
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
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');

        const config = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
        }

        try {
            const result = await axios.post(postUrl, params, config);
        }
        catch(error) {
            expect(failureResponse(error, 401, "Bad credentials"));
        }        
    });
    it('verifies 401 error upon valid client_id and invalid client_secret', async () => {
        const params = new URLSearchParams();
        params.append('client_id', '456');
        params.append('client_secret', 'badcredential');
        params.append('grant_type', 'client_credentials');

        const config = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
        }

        try {
            const result = await axios.post(postUrl, params, config);
        }
        catch(error) {
            expect(failureResponse(error, 401, "Bad credentials"));
        } 
    });
    it('verifies 401 error upon valid client_id and missing client_secret', async () => {
        const params = new URLSearchParams();
        params.append('client_id', '456');
        params.append('grant_type', 'client_credentials');

        const config = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
        }

        try {
            const result = await axios.post(postUrl, params, config);
        }
        catch(error) {
            expect(failureResponse(error, 401, "Bad credentials"));
        } 
    });
    it('verifies 401 error upon missing client_id and valid client_secret', async () => {
        const params = new URLSearchParams();
        params.append('client_secret', 'rlgl');
        params.append('grant_type', 'client_credentials');

        const config = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
        }

        try {
            const result = await axios.post(postUrl, params, config);
        }
        catch(error) {
            expect(failureResponse(error, 401, "Bad credentials"));
        } 
    });
});


describe('Tests lambda handler GET requests', function () {
    describe('Testing JWT', function () {
        it('verifies return valid address upon valid JWT', async () => {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: { lat: "1.295764", lon: "103.858165" } 
            };

            const result = await axios.get(getUrl, config);

            expect(successResponse(result));

            let response = result.data;

            expect(response).to.be.an('object');
            expect(response.lat).to.be.an('string');
            expect(response.lat).to.be.equal(config.params.lat);
            expect(response.lon).to.be.an('string');
            expect(response.lon).to.be.equal(config.params.lon);
            expect(response.address).to.be.an('string');
        });
        it('verifies 401 error upon bad JWT', async () => {
            const config = {
                headers: { Authorization: `Bearer invalid_token` },
                params: { lat: "1.295764", lon: "103.858165" } 
            };

            try {
                const result = await axios.get(getUrl, config);
            }
            catch(error) {
                expect(failureResponse(error, 401, "jwt malformed")); // JWT library error message
            } 
        });
        it('verifies 401 error upon expired JWT', async () => {
            const config = {
                headers: { Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im15LWtleS1pZCJ9.eyJsYXQiOiIxLjI5NDQ2MCIsImxvbiI6IjEwMy44NTMyODAiLCJjbGllbnRfaWQiOiI0NTYiLCJpYXQiOjE2MzYwODQ5ODEsImV4cCI6MTYzNjA4ODU4MSwiYXVkIjoiYWRtaW4iLCJpc3MiOiJodHRwczovLzEyNy4wLjAuMTo0MDAwLyJ9.XBuB1fmN_bJlksrsmGz1YPyvgwHZZA3FnoRzLqA-J-3mScTENfTJSGeYEoUtDKqfKU-ES2aUJIcRHU1qj6kLqGhKK6oMOORkw0Zr4QIUp8K-O2rQwH1tNbo5gRurP1iQaZB5SHMh3O4qdEcUsIDR0x_VOWu_AGdtLAQxJGMjb9Y9w6BZTWsEbp-o-DTGOSejIvTlziJIRB680LZWDY-41h_Dj4TTFeptjfQyqnyLKGza3elsoWE1iO7vOGZQFCemY84yKqrhPlJcp-fK4_xnQduhsfUT3zVX2rLchlrI25gq7FqsWkNAst0A09b2WhBeQOvDRryszhWLDKo23on1PnedL5k9GG7c_1TKQ__ONc50ZmztxAyj5L0ify7BocwdNfhWmcangvISNrtNuKJmqB0H6mfkajce19JZLBAvp0RBmJi4S9tqnrRSGSfqZhxaHbqE7HoKOlOvlo0oFzp0ozXxXv3JvkTyA0bZ260EI4b0xisGsbiwo1Zlv0NOJMmWeFl14JIEinWCwaM_kP9sS6tp1ADwIzepTFWVMblpRCr-5glBZa7s-kS9HMX_2tUogJE8gvgK7rPgkRpH51oGbmvYuZRAWq0RtqmTJ0UbzQTcUvU6muVuESSR4i6RxN_zVd5fcJQfeBPIhjrHbWUTaSvQZng9RFrJHyKrV3IfGdc` },
                params: { lat: "1.295764", lon: "103.858165" } 
            };

            try {
                const result = await axios.get(getUrl, config);
            }
            catch(error) {
                expect(failureResponse(error, 401, "jwt expired")); // JWT library error message
            } 
        });
        it('verifies 401 error upon invalid JWT signature', async () => {
            const config = {
                headers: { Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im15LWtleS1pZCJ9.eyJsYXQiOiIxLjI5NDQ2MCIsImxvbiI6IjEwMy44NTMyODAiLCJjbGllbnRfaWQiOiI0NTYiLCJpYXQiOjE2MzYwODQ5ODEsImV4cCI6MTYzNjA4ODU4MSwiYXVkIjoiYWRtaW4iLCJpc3MiOiJodHRwczovLzEyNy4wLjAuMTo0MDAwLyJ9.XBuB1fmN_bJlksrsmGz1YPyvgwHZZA3FnoRzLqA-J-3mScTENfTJSGeYEoUtDKqfKU-ES2aUJIcRHU1qj6kLqGhKK6oMOORkw0Zr4QIUp8K-O2rQwH1tNbo5gRurP1iQaZB5SHMh3O4qdEcUsIDR0x_VOWu_AGdtLAQxJGMjb9Y9w6BZTWsEbp-o-DTGOSejIvTlziJIRB680LZWDY-41h_Dj4TTFeptjfQyqnyLKGza3elsoWE1iO7vOGZQFCemY84yKqrhPlJcp-fK4_xnQduhsfUT3zVX2rLchlrI25gq7FqsWkNAst0A09b2WhBeQOvDRryszhWLDKo23on1PnedL5k9GG7c_1TKQ__ONc50ZmztxAyj5L0ify7BocwdNfhWmcangvISNrtNuKJmqB0H6mfkajce19JZLBAvp0RBmJi4S9tqnrRSGSfqZhxaHbqE7HoKOlOvlo0oFzp0ozXxXv3JvkTyA0bZ260EI4b0xisGsbiwo1Zlv0NOJMmWeFl14JIEinWCwaM_kP9sS6tp1ADwIzepTFWVMblpRCr-5glBZa7s-kS9HMX_2tUogJE8gvgK7rPgkRpH51oGbmvYuZRAWq0RtqmTJ0UbzQTcUvU6muVuESSR4i6RxN_zVd5fcJQfeBPIhjrHbWUTaSvQZng9RFrJHyKrV3IfGd` },
                params: { lat: "1.295764", lon: "103.858165" } 
            };

            try {
                const result = await axios.get(getUrl, config);
            }
            catch(error) {
                expect(failureResponse(error, 401, "invalid signature")); // JWT library error message
            } 
        });
        it('verifies 401 error upon missing JWT', async () => {
            const config = {
                params: { lat: "1.295764", lon: "103.858165" } 
            };

            try {
                const result = await axios.get(getUrl, config);
            }
            catch(error) {
                expect((error) => failureResponse(error, 401, "Empty token") || 
                                  failureResponse(error, 401, "jwt malformed"));
            } 
        });
    });
    describe('Testing query parameters', function () {
        it('verifies 400 error upon valid lon but invalid lat', async () => {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: { lat: "not_valid_lat", lon: "103.858165" } 
            };

            try {
                const result = await axios.get(getUrl, config);
            }
            catch(error) {
                expect(failureResponse(error, 400, "Bad request"));
            } 
        });
        it('verifies 400 error upon valid lat but invalid lon', async () => {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: { lat: "1.295764", lon: "not_valid_lon" } 
            };

            try {
                const result = await axios.get(getUrl, config);
            }
            catch(error) {
                expect(failureResponse(error, 400, "Bad request"));
            } 
        });
        it('verifies 400 error upon invalid lon and invalid lat', async () => {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: { lat: "not_valid_lat", lon: "not_valid_lon" } 
            };

            try {
                const result = await axios.get(getUrl, config);
            }
            catch(error) {
                expect(failureResponse(error, 400, "Bad request"));
            } 
        });
        it('verifies 400 error upon missing lon and lat', async () => {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            try {
                const result = await axios.get(getUrl, config);
            }
            catch(error) {
                expect(failureResponse(error, 400, "Bad request"));
            } 
        });
        it('verifies 400 error upon valid lon but missing lat', async () => {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: { lon: "103.858165" } 
            };

            try {
                const result = await axios.get(getUrl, config);
            }
            catch(error) {
                expect(failureResponse(error, 400, "Bad request"));
            } 
        });
        it('verifies 400 error upon valid lat but missing lon', async () => {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: { lat: "1.295764" } 
            };

            try {
                const result = await axios.get(getUrl, config);
            }
            catch(error) {
                expect(failureResponse(error, 400, "Bad request"));
            } 
        });
    });
});
