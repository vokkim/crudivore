Crudivore
=========

[![Build Status](https://travis-ci.org/vokkim/crudivore.svg?branch=master)](https://travis-ci.org/vokkim/crudivore)

Crudivore is a small service for rendering JS heavy sites for search engines.

Greatly influenced by [Prerender](https://github.com/prerender/prerender), Crudivore utilizes [PhantomJS](phantomjs.org) to render JavaScript applications into pure HTML for search engines, Facebook previews etc.


#### Usage

Install dependencies:

    npm install

Start the server:

    ./index.js

#### REST API

<a name="crudivore_render"></a>
[`/render/<URL>`](#crudivore_render) 
 Render the requested page and return the resulting HTML

    Example:
    curl http://127.0.0.1:5000/render/https://www.google.com

<a name="crudivore_info"></a>
[`/info/`](#crudivore_info) 
 Get a simple JSON object to monitor the status of Crudivore service

    Example:
    curl http://127.0.0.1:5000/info/

    
```
                                                                                                                    
      +-------+                         +------------------+                    +---------+           +---------+
      |Crawler|                         |Application server|                    |Crudivore|           |PhantomJS|
      +---+---+                         +--------+---------+                    +---+-----+           +---------+
          |                                      |                                  |                      |
          | GET                                  |                                  |                      |
          | app.com/?_escaped_fragment_=!/stuff  |                                  |                      |
          +------------------------------------> |                                  |                      |
          |                                      |                                  |                      |
          |                                      | GET                              |                      |
          |                                      | /render/http://app.com|#!/stuff  |                      |
          |                                      +--------------------------------> |                      |
          |                                      |                                  |                      |
          |                                      |                                  | GET                  |
          |                                      |                                  | app.com/#!/stuff     |
          |                                      |                                  +--------------------> |
          |                                      |                                  |                      |
          |                                      |                                  |              SUCCESS |
          |                                      |                                  | <--------------------+
          |                                      |                                  |                      |
          |                                      |                                  | Is the page ready?   |
          |                                      |                                  +--------------------> |
          |                                      |                                  |                      |
          |                                      |                                  |                Ready |
          |                                      |                                  | <--------------------+
          |                                      |                                  |                      |
          |                                      |                                  | Page content, please |
          |                                      |                                  +--------------------> |
          |                                      |                                  |                      |
          |                                      |                                  |            Page HTML |
          |                                      |                                  | <--------------------+
          |                                      |                                  |
          |                                      |                        Page HTML |
          |                                      | <--------------------------------+
          |                                      |
          |                            Page HTML |
          |  <-----------------------------------+
          +
``` 

#### Communicating from the page being rendered to Crudivore

Crudivore works on existing pages without any modifications. The page may want to pass information to Crudivore and may do so with the global variable `window.crudivore`:

    window.crudivore = {
        pageReady: <boolean>,
        status: <int>,
        headers: {
            "<headername>": "<headercontent>"
        }
    }

<a name="crudivore-pageReady"></a>
[`window.crudivore.pageReady`](#crudivore-pageReady)
tells Crudivore that the page has completed loading and rendering. This is not mandatory: if this parameter is never set, Crudivore waits until the timeout.

<a name="crudivore-status"></a>
[`window.crudivore.status`](#crudivore-status)
sets the Crudivore response HTTP status code. Default response code is 200. For example, many single page apps contain a catch-all route that displays a [soft 404](http://en.wikipedia.org/wiki/HTTP_404#Soft_404). Added `window.crudivore.status = 404` causes Crudivore to turn that into a hard 404, which is better for search enginges.

<a name="crudivore-headers"></a>
[`window.crudivore.headers`](#crudivore-headers)
allows setting custom headers from frontend code. An example would be a redirect:

    window.crudivore = {
        pageReady: true,
        status: 302,
        headers: {
            "Location": "http://mysite.com/newurl"
        }
    }

#### Configuration
Crudivore can be configured with environment variables:

Example:

    CRUDIVORE_TIMEOUT=5000 ./index.js

<a name="crudivore_timeout"></a>
[`CRUDIVORE_TIMEOUT`](#crudivore_timeout) 
defines timeout for each request, defaults to `10s`

<a name="crudivore_poll_interval"></a>
[`CRUDIVORE_POLL_INTERVAL`](#crudivore_poll_interval) 
defines the frequency (milliseconds) in which PhantomJS checks if the page is fully rendered. Default value `50`.

<a name="crudivore_phantom_port_start"></a>
[`CRUDIVORE_PHANTOM_PORT_START`](#crudivore_phantom_port_start) 
defines the first port of the port range used by PhantomJS instances. Default value `10000`.

<a name="crudivore_phantom_port_end"></a>
[`CRUDIVORE_PHANTOM_PORT_END`](#crudivore_phantom_port_end) 
defines the last port of the port range used by PhantomJS instances. Default value `10100`.

<a name="crudivore_initial_thread_count"></a>
[`CRUDIVORE_INITIAL_THREAD_COUNT`](#crudivore_initial_thread_count) 
defines the number of PhantomJS threads spawned and warmed up when the service is started. Default value `1`.


#### Test

Run all tests:

    ./runtests.sh
