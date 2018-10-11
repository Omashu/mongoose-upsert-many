'use strict';

const isObject = require('lodash/isObject');
const forEach = require('lodash/forEach');

module.exports = function arrayKeys(obj, path = []) {
  if (!isObject(obj)) {
    return path.length > 0 ? [path.join('.')] : [];
  }

  let keys = [];
  forEach(obj, (next, key) => {
    if (isObject(next)) {
      keys = keys.concat(keys(next, path.concat(key)));
      return;
    }

    keys.push(key);
  });

  return keys;
};
