var _ = require('lodash')
var Promise = require('bluebird')
var express = require('express')
var request = require('request')
var server = require('../src/server')

Promise.promisifyAll(request)

Promise.onPossiblyUnhandledRejection(function(e, promise) {
    throw e
})

exports.requestTestPage = function(page) {
  return request.getAsync('http://127.0.0.1:5000/render/http://127.0.0.1:5011/' + page)
  .then(function(response) {
    return {
      status: response[0].statusCode,
      body: response[1]
    }
  })
}

exports.requestThreadInfo = function() {
  return request.getAsync('http://127.0.0.1:5000/info/')
  .then(function(response) { return JSON.parse(response[1]) })
}

exports.setupTestServers = function(config) {
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