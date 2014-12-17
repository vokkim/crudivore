var _ = require('lodash')
var Promise = require('bluebird')
var expect = require('chai').expect
var request = require('request')
var utils = require('./TestUtils')

describe('Basic rendering', function() {
  this.timeout(10000)
  utils.setupTestServers({initialThreadCount: 1, timeout: 5000})
 
  it("Returns correct HTML", function(done) {
    utils.requestTestPage('simpleTest.html').then(function(response) {
      expect(response.status).to.equal(200)
      expect(response.body).to.contain('Async content loaded!')
      expect(response.body).not.to.contain('Loading')
    }).finally(done)
  })

   it("Strips script tags", function(done) {
    utils.requestTestPage('simpleTest.html').then(function(response) {
      expect(response.body).to.not.contain('<script>')
    }).finally(done)
  })

  it("Starts up only one PhantomJS thread", function(done) {
    utils.requestThreadInfo().then(function(info) {
      expect(info.length).to.equal(1)
    }).finally(done)
  })
})

describe('Concurrent requests', function() {
  this.timeout(10000)
  utils.setupTestServers({initialThreadCount: 1, timeout: 5000})
 
  it("Returns correct HTML", function(done) {
    var current = Promise.resolve()
    Promise.all([utils.requestTestPage('simpleTest.html'), utils.requestTestPage('simpleTest.html')])
    .then(function(responses) {
      expect(responses.length).to.equal(2)
      _.each(responses, function(response) {
        expect(response.status).to.equal(200)
        expect(response.body).to.contain('Async content loaded!')
      })
    }).finally(done)
  })

  it("Starts up another PhantomJS thread", function(done) {
    utils.requestThreadInfo().then(function(info) {
      expect(info.length).to.equal(2)
    }).finally(done)
  })
})
