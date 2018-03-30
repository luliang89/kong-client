
import 'mocha'
import assert = require('assert');

import { HmacAuth } from '../src';

//https://getkong.org/plugins/hmac-authentication/

describe('HmacAuth', function () {

    var credential = {
        username: 'alice123',
        secret: 'secret'
    }

    before(function () {

    });

    it('request', function (done) {

        var headers: any = {
            'Host': 'hmac.com',
            'Date': 'Thu, 22 Jun 2017 17:15:21 GMT'
        }

        let auth = new HmacAuth({
            credential: credential,
            enforceHeaders: ['Date', 'request-line']
        });
        auth.digest('GET', '/requests', headers);

        //console.log(header['Authorization']);

        let result = headers['Authorization'] === 'hmac username="alice123", algorithm="hmac-sha256", headers="date request-line", signature="ujWCGHeec9Xd6UD2zlyxiNMCiXnDOWeVFMu5VeRUxtw="';

        assert.equal(result, true);

        done();

    })

    it('validating request body', function (done) {

        var headers: any = {
            'Host': 'hmac.com',
            'Date': 'Thu, 22 Jun 2017 21:12:36 GMT'
        }

        let auth = new HmacAuth({
            credential: credential,
            enforceHeaders: ['Date', 'request-line', 'Digest']
        });
        auth.digest('GET', '/requests', headers, "A small body");

        //console.log(headers['Digest'], headers['Authorization']);

        let result = headers['Authorization'] === 'hmac username="alice123", algorithm="hmac-sha256", headers="date request-line digest", signature="gaweQbATuaGmLrUr3HE0DzU1keWGCt3H96M28sSHTG8="'
            && headers['Digest'] === 'SHA-256=SBH7QEtqnYUpEcIhDbmStNd1MxtHg2+feBfWc1105MA=';

        assert.equal(result, true);

        done();

    })


})