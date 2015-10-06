'use strict';

var should = require('should'),
    nsmockup = require('../');

/**
 * Test Suites
 */
describe('<Unit Test - Netsuite Create Restlet>', function () {
    this.timeout(5000);
    before(function (done) {
        nsmockup.init({server: false}, done);
    });
    describe('Create Script - Restlet', function () {
        it('create restlet', function (done) {
            let opts = {
                name: 'customscript_add_restlet',
                files: [
                    __dirname + '/_input-files/scripts/fake-restlet.js'
                ],
                funcs: {
                    get: 'FakeRestlet.post'
                },
                params: {
                    'fake-param': 12
                }
            };
            nsmockup.createRESTlet(opts);
            should(FakeRestlet).be.ok();

            let url = nlapiResolveURL('RESTLET', opts.name);
            should(url).be.ok();
            //console.log('>>>', url);
            //let res = nlapiRequestURL(url, null, null, 'GET');
            //should(res).be.ok();
            //let body = res.getBody();
            //should(body).be.equal('12');
            return done();
        });
    });
    after(function (done) {
        nsmockup.destroy(done);
    });
});
