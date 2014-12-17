var express = require('express')
var Bacon = require('baconjs')
var Crudivore = require('./crudivore')
var app = express()

function start(config, onSuccess) {
  var render = Crudivore(config)

  app.set('port', (process.env.PORT || 5000))

  var server = app.listen(app.get('port'), function() {
    console.log("Running on port " + app.get('port'))
    if (onSuccess) onSuccess()
  })

  app.get('/render/*', function(req, res) {
    var pageUrl = decodeURIComponent(req.params[0])
    console.log('Requesting page ',  pageUrl)

    var renderingResult = render.renderPage(pageUrl)
    renderingResult.onError(function(e) {
      console.log(e)
      res.status(400).end()
    })

    renderingResult.onValue(function(result) {
      res.status(result.status).send(result.content)
    })
  })

  app.get('/info/', function(req, res) {
    res.send(render.threadInfo())
  })

  return server
}

module.exports = start
