var _ = require('lodash')
var Promise = require('bluebird')
var expect = require('chai').expect
var express = require('express')
var request = require('request')

Promise.promisifyAll(request);

var server = require('../src/server')

describe('Basic rendering', function() {
  this.timeout(10000)
  setupTestServers({initialThreadCount: 1, timeout: 5000})
 
  it("Returns correct HTML", function(done) {
    requestTestPage('simpleTest.html').then(function(response) {
      expect(response.status).to.equal(200)
      expect(response.body).to.contain('Async content loaded!')
      expect(response.body).not.to.contain('Loading')
    }).finally(done)
  })

   it("Strips script tags", function(done) {
    requestTestPage('simpleTest.html').then(function(response) {
      expect(response.body).to.not.contain('<script>')
    }).finally(done)
  })

  it("Starts up only one PhantomJS thread", function(done) {
    requestThreadInfo().then(function(info) {
      expect(info.length).to.equal(1)
    }).finally(done)
  })
})

describe('Concurrent requests', function() {
  this.timeout(10000)
  setupTestServers({initialThreadCount: 1, timeout: 5000})
 
  it("Returns correct HTML", function(done) {
    var current = Promise.resolve()
    Promise.all([requestTestPage('simpleTest.html'), requestTestPage('simpleTest.html')])
    .then(function(responses) {
      expect(responses.length).to.equal(2)
      _.each(responses, function(response) {
        expect(response.status).to.equal(200)
        expect(response.body).to.contain('Async content loaded!')
      })
    }).finally(done)
  })

  it("Starts up another PhantomJS thread", function(done) {
    requestThreadInfo().then(function(info) {
      expect(info.length).to.equal(2)
    }).finally(done)
  })
})

function requestTestPage(page) {
  return request.getAsync('http://127.0.0.1:5000/render/http://127.0.0.1:5011/' + page)
    .then(function(response) {
      return {
        status: response[0].statusCode,
        body: response[1]
      }
    })
}

function requestThreadInfo() {
  return request.getAsync('http://127.0.0.1:5000/info/')
    .then(function(response) { return JSON.parse(response[1]) })
}

function setupTestServers(config) {
  var contentServer, appServer;
  before(function(done) {
    appServer = server(config, done)
  })
  before(function(done) {
    contentServer = initTestServer(done)
  })
  after(function() {
    contentServer.close()
    appServer.close()
  })
}

function initTestServer(done) {
  var app = express()
  app.set('port', 5011)
  app.use(express.static(__dirname + '/static'))
  return app.listen(app.get('port'), done)
}
