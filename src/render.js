var phantom = require('phantom')
var Bacon = require('baconjs')
var _ = require('lodash')

var evaluate = require('./evaluate')

var TIMEOUT = process.env.CRUDIVORE_TIMEOUT || 5 * 1000 
var POLL_INTERVAL = process.env.CRUDIVORE_POLL_INTERVAL || 50
var PHANTOM_PORT_RANGE = {
  start: process.env.CRUDIVORE_PHANTOM_PORT_START || 10000,
  end:   process.env.CRUDIVORE_PHANTOM_PORT_END ||10100
}
var INITIAL_THREAD_COUNT = process.env.CRUDIVORE_INITIAL_THREAD_COUNT || 10

var threads = []
createInitialThreads()

exports.renderPage = function (pageUrl) {
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
    }).take(TIMEOUT/POLL_INTERVAL).flatMap(_.identity) //TODO Fix take/takeWhile
    .filter(function(isReady) { return isReady === true })

    var evaluationTimeout = phantomSuccess.bufferWithTime(TIMEOUT).map(_.first).doAction(function() {
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
  return _.times(INITIAL_THREAD_COUNT, function() {
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
  for (var i = PHANTOM_PORT_RANGE.start; i < PHANTOM_PORT_RANGE.end; i++) {
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

exports.threadInfo = function() {
  return _.map(threads, function(thread) {
    return {
      port: thread.port,
      status: thread.available ? 'available' : 'busy'
    }
  })
}
