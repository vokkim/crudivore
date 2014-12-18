/*
  These functions are evaluated by PhantomJS within the target page.
  See http://phantomjs.org/api/webpage/method/evaluate.html for detailed information.
*/

function pageReady() {
  return window.pageReady
}

function getHeaders() {
  var meta = document.getElementsByTagName('meta')
  var result = []
  for (var a=0; a < meta.length; a++) {
    if (meta[a].name === "prerender-header" || meta[a].name === "http-header") return result.push(meta[a].content)
  }
  return result
}


function getStatus() {
  var meta = document.getElementsByTagName('meta')
  for (var a=0; a < meta.length; a++) {
    if (meta[a].name === "prerender-status-code" || meta[a].name === "http-status-code") return meta[a].content
  }
  return 200
}

function getContent() {
  var scripts = document.getElementsByTagName('script')
  for (var a=0; a < scripts.length; a++) {
    var script = scripts[a]
    if (script.parentElement) script.parentElement.removeChild(script)
  }
  return document.getElementsByTagName('html')[0].outerHTML
}

module.exports = {
  pageReady: pageReady,
  getHeaders: getHeaders,
  getStatus: getStatus,
  getContent: getContent
}