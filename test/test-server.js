
var chai = require( 'chai' );
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

chai.use(chaiHttp);

// Unit tests for authoriziation
describe('Authorization Checks (/auth/isAuthorized)', function () {
	
	// With all valid parameters with right access-token
	it('Valid parameters, Valid access-token', function (done) {
		this.timeout(15000);
		chai.request(server)
	    .get('/auth/isAuthorized?resource=%2Fpratilipis&method=GET&id=5630498248327168%2C5728236268945408')
	    .set('Access-Token', '0063983d-5ac2-4e64-93d6-7157972cf8b9')
	    .end(function(err, res){
	      res.should.have.status(200);
	      res.should.be.json;
	      res.body.should.be.a('object');
	      res.body.resource.should.equal("/pratilipis");
	      res.body.method.should.equal("GET");
	      res.body.data.should.be.a('array');
	      res.body.data[0].id.should.equal(5630498248327168);
	      res.body.data[0].code.should.equal(200);
	      res.body.data[0].isAuthorized.should.equal(true);
	      res.body.data[1].id.should.equal(5728236268945408);
	      res.body.data[1].code.should.equal(200);
	      res.body.data[1].isAuthorized.should.equal(true);
	      done();
	    });
    });
	
	
	// With all valid parameters with right user-id
	it('Valid parameters, Valid user-id', function (done) {
		this.timeout(15000);
		chai.request(server)
	    .get('/auth/isAuthorized?resource=%2Fpratilipis&method=GET&id=5630498248327168%2C5728236268945408')
	    .set('User-Id', '1234512345')
	    .end(function(err, res){
	      res.should.have.status(200);
	      res.should.be.json;
	      res.body.should.be.a('object');
	      res.body.resource.should.equal("/pratilipis");
	      res.body.method.should.equal("GET");
	      res.body.data.should.be.a('array');
	      res.body.data[0].id.should.equal(5630498248327168);
	      res.body.data[0].code.should.equal(200);
	      res.body.data[0].isAuthorized.should.equal(true);
	      res.body.data[1].id.should.equal(5728236268945408);
	      res.body.data[1].code.should.equal(200);
	      res.body.data[1].isAuthorized.should.equal(true);
	      done();
	    });
    });
	
	
	// With invalid parameters
	it('No parameters', function (done) {
		this.timeout(15000);
		chai.request(server)
	    .get('/auth/isAuthorized')
	    .set('Access-Token', '0063983d-5ac2-4e64-93d6-7157972cf8b9')
	    .end(function(err, res){
	      res.should.have.status(400);
	      res.should.be.json;
	      res.body.should.be.a('object');
	      done();
	    });
    });
	
	
	// With all valid parameters with right user-id and invalid method parameter
	it('Valid parameters, Valid user-id, Invalid method', function (done) {
		this.timeout(15000);
		chai.request(server)
	    .get('/auth/isAuthorized?resource=%2Fpratilipis&method=FOO&id=5630498248327168%2C5728236268945408')
	    .set('User-Id', '1234512345')
	    .end(function(err, res){
	    	res.should.have.status(400);
		    res.should.be.json;
		    res.body.should.be.a('object');
		    done();
	    });
    });
	
	
	// With all valid parameters but no access-token or user-id
	it('Valid parameters, No access-token, No user-id', function (done) {
		this.timeout(15000);
		chai.request(server)
	    .get('/auth/isAuthorized?resource=%2Fpratilipis&method=GET&id=5630498248327168%2C5728236268945408')
	    .end(function(err, res){
	      res.should.have.status(200);
	      res.should.be.json;
	      res.body.should.be.a('object');
	      res.body.resource.should.equal("/pratilipis");
	      res.body.method.should.equal("GET");
	      res.body.data.should.be.a('array');
	      res.body.data[0].id.should.equal(5630498248327168);
	      res.body.data[0].code.should.equal(403);
	      res.body.data[0].isAuthorized.should.equal(false);
	      res.body.data[1].id.should.equal(5728236268945408);
	      res.body.data[1].code.should.equal(403);
	      res.body.data[1].isAuthorized.should.equal(false);
	      done();
	    });
    });
	
	
	// With all valid parameters with right access-token, but patch request with wrong owner
	it('Valid parameters, Valid access-token, Update action with wrong owner', function (done) {
		this.timeout(15000);
		chai.request(server)
	    .get('/auth/isAuthorized?resource=%2Fpratilipis&method=PATCH&id=5630498248327168%2C5728236268945408')
	    .set('Access-Token', '0063983d-5ac2-4e64-93d6-7157972cf8b9')
	    .end(function(err, res){
	      res.should.have.status(200);
	      res.should.be.json;
	      res.body.should.be.a('object');
	      res.body.resource.should.equal("/pratilipis");
	      res.body.method.should.equal("PATCH");
	      res.body.data.should.be.a('array');
	      res.body.data[0].id.should.equal(5630498248327168);
	      res.body.data[0].code.should.equal(403);
	      res.body.data[0].isAuthorized.should.equal(false);
	      res.body.data[1].id.should.equal(5728236268945408);
	      res.body.data[1].code.should.equal(403);
	      res.body.data[1].isAuthorized.should.equal(false);
	      done();
	    });
    });
	
	
	// With all valid parameters with right user-id, but patch request request with wrong owner
	it('Valid parameters, Valid user-id, /authors resource, Update action with wrong owner', function (done) {
		this.timeout(15000);
		chai.request(server)
	    .get('/auth/isAuthorized?resource=%2Fauthors&method=PATCH&id=5650622250483712')
	    .set('User-Id', '90000000000')
	    .end(function(err, res){
	      res.should.have.status(200);
	      res.should.be.json;
	      res.body.should.be.a('object');
	      res.body.resource.should.equal("/authors");
	      res.body.method.should.equal("PATCH");
	      res.body.data.should.be.a('array');
	      res.body.data[0].id.should.equal(5650622250483712);
	      res.body.data[0].code.should.equal(403);
	      res.body.data[0].isAuthorized.should.equal(false);
	      done();
	    });
    });
	
	
	// With all valid parameters with right user-id, but patch request request with right owner
	it('Valid parameters, Valid user-id, /authors resource, Update action with right owner', function (done) {
		this.timeout(15000);
		chai.request(server)
	    .get('/auth/isAuthorized?resource=%2Fauthors&method=PATCH&id=5750197846016000')
	    .set('User-Id', '90000000000')
	    .end(function(err, res){
	      res.should.have.status(200);
	      res.should.be.json;
	      res.body.should.be.a('object');
	      res.body.resource.should.equal("/authors");
	      res.body.method.should.equal("PATCH");
	      res.body.data.should.be.a('array');
	      res.body.data[0].id.should.equal(5750197846016000);
	      res.body.data[0].code.should.equal(200);
	      res.body.data[0].isAuthorized.should.equal(true);
	      done();
	    });
    });
});