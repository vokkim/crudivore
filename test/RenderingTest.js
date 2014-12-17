var _ = require('lodash')
var expect = require('chai').expect
var express = require('express')
var request = require('request')

var server = require('../src/server')

describe('Basic rendering', function() {
  this.timeout(10000)
  setupTestServers({initialThreadCount: 1, timeout: 5000})
 
  it("Returns correct HTML", function(done) {
    requestTestPage('simpleTest.html', function(error, response, body) {
      expect(response.statusCode).to.equal(200)
      expect(body).to.contain('Async content loaded!')
      expect(body).not.to.contain('Loading')
      done()
    })
  })

   it("Strips script tags", function(done) {
    requestTestPage('simpleTest.html', function(error, response, body) {
      expect(body).to.not.contain('<script>')
      done()
    })
  })

  it("Starts up only one PhantomJS thread", function(done) {
    requestThreadInfo(function(info) {
      expect(info.length).to.equal(1)
      done()
    })
  })
})

function requestTestPage(page, done) {
  request('http://127.0.0.1:5000/render/http://127.0.0.1:5011/' + page, done)
}

function requestThreadInfo(done) {
  request('http://127.0.0.1:5000/info/', function(error, response, body) {
    done(JSON.parse(body))
  })
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
