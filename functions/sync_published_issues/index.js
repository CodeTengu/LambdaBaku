'use strict';

const fetch = require('node-fetch');

const utils = require('./libs/utils');

exports.handle = (event, context, callback) => {
  utils.loadPreference('curatedAPIConfig')
  .then((response) => {
    const headers = {
      Authorization: `Token token="${response.curatedAPIConfig.apiKey}"`,
    };

    // http://support.curated.co/integrations/fetching-issue-data-with-the-api/
    fetch('https://api.curated.co/codetengu/api/v1/issues/?page=1&per_page=250', { method: 'GET', headers })
    .then(utils.checkHTTPStatus)
    .then((res) => {
      return res.json();
    })
    .then((curatedIssues) => {
      const tasks = [];

      for (const curatedIssue of curatedIssues.issues) {
        const promise = utils.invokeLambdaFunction('lambdabaku_sync_issue', { issue_number: curatedIssue.number });
        tasks.push(promise);
      }

      return Promise.all(tasks);
    })
    .then((results) => {
      callback(null, results);
    })
    .catch((err) => {
      callback(err);
    });
  });
};
