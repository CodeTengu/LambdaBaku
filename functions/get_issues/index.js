'use strict';

const weekly = require('./libs/weekly');

exports.handle = (event, context, callback) => {
  weekly.getIssues()
  .then((response) => {
    callback(null, response);
  })
  .catch((err) => {
    callback(err);
  });
};
