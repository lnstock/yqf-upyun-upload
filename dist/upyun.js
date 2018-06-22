/**
  * UPYUN js-sdk 1.0.0
  * (c) 2018
  * @license MIT
  */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('axios')) :
	typeof define === 'function' && define.amd ? define(['axios'], factory) :
	(global.upyun = factory(global.axios));
}(this, (function (axios) { 'use strict';

axios = 'default' in axios ? axios['default'] : axios;

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

function createReq(endpoint, bucket, authorization, xdate) {
    var req = axios.create({
        baseURL: endpoint + '/' + bucket,
        maxRedirects: 0
    });

    req.interceptors.request.use(function (config) {
        var method = config.method.toUpperCase();
        config.url = encodeURI(config.url);

        config.headers.common = {
            'Authorization': authorization,
            'X-Date': xdate
        };
        return Promise.resolve(config);
    }, function (error) {
        throw new Error('upyun - request failed: ' + error.message);
    });

    req.interceptors.response.use(function (response) {
        return response;
    }, function (error) {
        var response = error.response;

        if (typeof response === 'undefined') {
            throw error;
        }

        if (response.status !== 404) {
            throw new Error('upyun - response error: ' + error.message);
        } else {
            return response;
        }
    });
    return req;
}

var endpoint = {
    domain: 'v0.api.upyun.com',
    protocol: 'https'
};

var upyun = function () {
    function upyun() {
        classCallCheck(this, upyun);
    }

    createClass(upyun, null, [{
        key: 'upload',
        value: function upload(bucket, getHeaderSign, localFile) {
            getHeaderSign(bucket, method).then(function (sign) {
                var req = createReq(endpoint.protocol + '://' + endpoint.domain, bucket, sign.Authorization, sign.XDate);
                req.put(remotePath, localFile).then(function (_ref) {
                    var responseHeaders = _ref.headers,
                        status = _ref.status;

                    if (status !== 200) {
                        return Promise.reject(status);
                    }

                    return Promise.resolve(headers);
                });
            });
        }
    }]);
    return upyun;
}();

var index = {
    upload: upyun.upload
};

return index;

})));
