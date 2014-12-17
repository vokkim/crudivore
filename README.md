Crudivore
=========

[![Build Status](https://travis-ci.org/Vokkim/crudivore.svg?branch=master)](https://travis-ci.org/Vokkim/crudivore)

Crudivore is a small service for rendering JS heavy sites for search engines.

Greatly influenced by [Prerender](https://github.com/prerender/prerender), Crudivore utilizes [PhantomJS](phantomjs.org) to render JavaScript applications into pure HTML for search engines, Facebook previews etc.


Usage
=====

Install dependencies:

    npm install

Start the server:

    ./index.js
    
    

### REST API

`/crawl/<URL>` Render the requested page and return the resulting HTML

    Example:
    curl http://127.0.0.1:5000/render/https://www.google.com

`/info/` Get a simple JSON object to monitor the status of Crudivore service

    Example:
    curl http://127.0.0.1:5000/info/

<img src="https://raw.github.com/vokkim/crudivore/master/sequence-graph.png" width="750px" />


### Page ready

### Configuration
Crudivore can be configured with environment variables:

`CRUDIVORE_TIMEOUT` defines timeout for each request, defaults to `10s`

`CRUDIVORE_POLL_INTERVAL` defines the frequency in which PhantomJS checks if the page is fully rendered, defaults to `50ms`

`CRUDIVORE_PHANTOM_PORT_START` defines the first port of the port range used by PhantomJS instances, defaults to `10000`

`CRUDIVORE_PHANTOM_PORT_START` defines the first port of the port range used by PhantomJS instances, defaults to `10100`

`CRUDIVORE_INITIAL_THREAD_COUNT` defines the number of threads spawned when the service is started, defaults to `1`

Example:

    CRUDIVORE_TIMEOUT=5000 ./index.js

Concurrency
===========


Test
====

Run all tests:

    ./runtests.sh
