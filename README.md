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


### Communicating from the page being rendered to Crudivore

Crudivore works on existing pages without any modifications. The page may want to pass information to Crudivore and may do so with the global variable `window.crudivore`:

    window.crudivore = {
        pageReady: <boolean>,
        status: <int>,
        headers: {
            "<headername>": "<headercontent>"
        }
    }

#### pageReady

Setting `window.crudivore.pageReady` to true tells Crudivore that the page has completed loading and rendering. This is not mandatory: if this parameter is never set, Crudivore waits until the timeout.

#### status

Causes Crudivore to return this http status code instead of 200. For example, many single page apps contain a catch-all route that displays a [soft 404](http://en.wikipedia.org/wiki/HTTP_404#Soft_404). Added `window.crudivore.status = 404` causes Crudivore to turn that into a hard 404, which is better for search enginges.

#### headers

The headers object allows setting custom headers from frontend code. An example would be a redirect:

    window.crudivore = {
        pageReady: true,
        status: 302,
        headers: {
            "Location": "http://mysite.com/newurl"
        }
    }

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
