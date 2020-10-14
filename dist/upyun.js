/**
  * YIQIFEI upyun-sdk 1.0.2
  * (c) 2020
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

    req.interceptors.request.use(function (request) {
        request.url = encodeURI(request.url);
        request.headers.common = {
            'Authorization': authorization,
            'X-Date': xdate
        };
        return request;
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
        value: function upload(bucket, localFile, getHeaderSign) {
            return getHeaderSign(bucket, 'PUT', localFile.name).then(function (sign) {
                var authorization = sign.Authorization || sign.authorization;
                var xDate = sign.XDate || sign.xDate || sign.xdate;
                var path = sign.Path || sign.path;

                var req = createReq(endpoint.protocol + '://' + endpoint.domain, bucket, authorization, xDate);
                return req.put(sign.Path, localFile).then(function (_ref) {
                    var responseHeaders = _ref.headers,
                        status = _ref.status;

                    return Promise.resolve({
                        bucket: bucket,
                        path: path
                    });
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
