/*global before,after */
var promise = require('bluebird')
var express = require('express')
var _ = require('lodash')
var request = require('request')
var server = require('../src/server')
var fork = require('child_process').fork

promise.promisifyAll(request)

promise.onPossiblyUnhandledRejection(function(e) {
    throw e
})

exports.requestTestPage = function(page) {
  return request.getAsync({
    uri: 'http://127.0.0.1:5000/render/http://127.0.0.1:5011/' + encodeURIComponent(page),
    followRedirect: false
  })
  .then(function(response) {
    return {
      status: response[0].statusCode,
      headers: response[0].headers,
      body: response[1]
    }
  })
}

exports.requestThreadInfo = function() {
  return request.getAsync('http://127.0.0.1:5000/info/')
  .then(function(response) { return JSON.parse(response[1]) })
}

exports.setupTestServers = function(threadCount) {
  var contentServer, appServer
  var childEnv = _.merge({CRUDIVORE_INITIAL_THREAD_COUNT: threadCount || 1}, process.env)

  before(function(done) {
    contentServer = initTestServer(done)
  })
  before(function(done) {
    appServer = fork('./index', [], {env: childEnv})
    setTimeout(done, 1000)
  })

  after(function() {
    contentServer.close()
    appServer.kill()
  })
}

function initTestServer(done) {
  var app = express()
  app.set('port', 5011)
  app.use(express.static(__dirname + '/static'))
  return app.listen(app.get('port'), done)
}