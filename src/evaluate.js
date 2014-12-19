/* jshint browser:true */
/*
  These functions are evaluated by PhantomJS within the target page.
  See http://phantomjs.org/api/webpage/method/evaluate.html for detailed information.
*/

function pageReady() {
  return typeof window.crudivore === 'object' && window.crudivore.pageReady === true
}

function getResultObject() {
  return typeof window.crudivore === 'object' ? window.crudivore : {}
}

function getContent() {
  var scripts = document.getElementsByTagName('script')
  for (var a=0; a < scripts.length; a++) {
    var script = scripts[a]
    if (script.parentElement) script.parentElement.removeChild(script)
  }
  return document.getElementsByTagName('html')[0].outerHTML
}

function selfXHRStatus() {
  var request = new XMLHttpRequest();
  request.open('HEAD', document.location.href, false);  // `false` makes the request synchronous
  request.send(null);

  return request.status
}

module.exports = {
  pageReady: pageReady,
  getResultObject: getResultObject,
  getContent: getContent,
  selfXHRStatus: selfXHRStatus
}