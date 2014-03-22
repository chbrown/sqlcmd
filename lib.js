/*jslint node: true */
var util = require('util');

// --------------
// tried and true

var extend = exports.extend = function(target /*, sources... */) {
  if (target === undefined) target = {};
  // var sources = Array.prototype.slice.call(arguments, 1);
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
  }
  return target;
};

exports.pushAll = function(array, xs) {
  return Array.prototype.push.apply(array, xs);
};

exports.slice = function(array, begin, end) {
  return Array.prototype.slice.call(array, begin, end);
};

// ------------
// non-standard

exports.clone = function(obj) {
  // not really comprehensive...
  if (Array.isArray(obj)) {
    return obj.slice(0);
  }
  else if (typeof(obj) === 'object') {
    return extend({}, obj);
  }
  return obj;
};

exports.inherit = function(Class, SuperClass) {
  util.inherits(Class, SuperClass);
  extend(Class, SuperClass);
};
