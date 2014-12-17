#!/usr/bin/env node

var server = require('./src/server')

var config = {
  timeout: process.env.CRUDIVORE_TIMEOUT,
  pollInterval: process.env.CRUDIVORE_POLL_INTERVAL,
  phantomPortRange: {
    start: process.env.CRUDIVORE_PHANTOM_PORT_START || 10000,
    end:  process.env.CRUDIVORE_PHANTOM_PORT_END || 10100 
  },
  initialThreadCount: process.env.CRUDIVORE_INITIAL_THREAD_COUNT
}

server(config)