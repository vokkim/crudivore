var express = require('express')
var Crudivore = require('./crudivore')
var _ = require('lodash')
var app = express()
var log = require('./logger')

function start(config, onSuccess) {
  var render = Crudivore(config)

  app.set('port', (process.env.PORT || 5000))

  var server = app.listen(app.get('port'), function() {
    log.info('Running on port %s', app.get('port'))
    if (onSuccess) onSuccess()
  })

  app.get('/render/*', function(req, res) {
    var pageUrl = decodeURIComponent(req.params[0])
    log.info('Requesting page ',  pageUrl)

    var renderingResult = render.renderPage(pageUrl)
    renderingResult.onError(function(e) {
      log.error(e)
      res.status(500).end()
    })

    renderingResult.onValue(function(result) {
      _(result.headers).each(function(value, name) {
        res.setHeader(name, value)
      })
      res.status(result.status).send(result.content)
    })
  })

  app.get('/info/', function(req, res) {
    res.send(render.threadInfo())
  })

  return server
}

module.exports = start
