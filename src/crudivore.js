var phantom = require('phantom')
var Bacon = require('baconjs')
var _ = require('lodash')

var evaluate = require('./evaluate')

module.exports = function(config) {
  config = _.defaults(config, {
    timeout: 5 * 1000,
    pollInterval: 50,
    phantomPortRange: {start: 10000, end: 10100},
    initialThreadCount: 1
  })
  return Crudivore(config)
}

function Crudivore(config) {
  var threads = []
  createInitialThreads()

  return {
    renderPage: renderPage,
    threadInfo: threadInfo
  }

  function renderPage(pageUrl) {
    var myThread = _.find(threads, 'available')
    if (!myThread) {
      console.log('Cant find open thread, creating a new')
      myThread = createThread()
      threads.push(myThread)
    }
    myThread.available = false
    
    var result = myThread.phantom.flatMap(function(phantom) {
      return getPageHtml(phantom, pageUrl)
    })

    result.mapError(true).onValue(function() {
      myThread.available = true
    })
    return result
  }

  function getPageHtml(phantom, pageUrl) {
    return Bacon.fromCallback(phantom.createPage).flatMap(function(page) {
      var pageOpen = Bacon.fromCallback(page.open, pageUrl)
      var phantomError = pageOpen.filter(function(status) { return status === 'fail' })
      var phantomSuccess = pageOpen.filter(function(status) { return status === 'success' })

      var evaluationReady = Bacon.fromPoll(50, function() {
        return Bacon.fromCallback(page.evaluate, evaluate.pageReady)
      }).take(config.timeout / config.pollInterval).flatMap(_.identity) //TODO Fix take/takeWhile
      .filter(function(isReady) { return isReady === true })

      var evaluationTimeout = phantomSuccess.bufferWithTime(config.timeout).map(_.first).doAction(function() {
        console.log('Evaluation timeout ', pageUrl)
      })

      var ready = evaluationReady.merge(phantomError).merge(evaluationTimeout)

      var result = ready.take(1).flatMap(function(status) {
        if (status === 'fail') {
          return new Bacon.Error('Failed to open page: ' + pageUrl)
        }
        return Bacon.combineTemplate({
          status: Bacon.fromCallback(page.evaluate, evaluate.getStatus),
          content: Bacon.fromCallback(page.evaluate, evaluate.getContent),
          headers: Bacon.fromCallback(page.evaluate, evaluate.getHeaders)
        })
      })

      return result
    })
  }

  function createInitialThreads() {
    return _.times(config.initialThreadCount, function() {
      var thread = createThread()
      threads.push(thread)
    })
  }

  function createThread() {
    var port = findFreePort()
    return { phantom: createPhantomInstance(port), available: true, port: port }
  }

  function findFreePort() {
    //TODO Check that the port is actually free!
    for (var i = config.phantomPortRange.start; i < config.phantomPortRange.end; i++) {
      var portIsFree = _.all(threads, function(thread) { return thread.port !== i})
      if (portIsFree) { return i }
    }
    throw 'Unable to find free port!'
  }

  function createPhantomInstance(port) {
    var onExit = function(msg) {
      console.log('PHANTOM CRASHED: ', port + ' : ' + msg) //TODO Survive crash!
    }
    return Bacon.fromCallback(phantom.create, '--ignore-ssl-errors=yes', '--load-images=no', '--ssl-protocol=any', { port: port, onExit: onExit }).toProperty()
  }

  function threadInfo() {
    return _.map(threads, function(thread) {
      return {
        port: thread.port,
        status: thread.available ? 'available' : 'busy'
      }
    })
  }
}

