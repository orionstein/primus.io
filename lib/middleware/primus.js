'use strict';

/**
 * Serve the client library that is shipped and compiled within Primus.
 *
 * @returns {Function}
 * @api public
 */

module.exports = function configure() {
  var uglify = require('uglify-js')
    , primusjs = this.pathname +'/primus.io.js'
    , primusjsmin = this.pathname + '/primus.io.min.js'
    , primus = this
    , library
    , jslibrary = new Buffer(primus.library())
    , jsminlibrary = new Buffer(uglify.minify(primus.library(), {fromString: true}).code)
    , length;

  /**
   * The actual HTTP middleware.
   *
   * @param {Request} req HTTP request.
   * @param {Response} res HTTP response.
   * @api private
   */

  function client(req, res) {
    if (req.uri.pathname !== primusjs && req.uri.pathname !== primusjsmin) return;

    if (req.uri.pathname === primusjs)
    {
      library = library || jslibrary;
    }
    else
    {
      library = library || jsminlibrary;
    }

    length = length || library.length;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
    res.setHeader('Content-Length', length);
    res.end(library);

    return true;
  }

  //
  // We don't serve our client-side library over HTTP upgrades.
  //
  client.upgrade = false;

  return client;
};
