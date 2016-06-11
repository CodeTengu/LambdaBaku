'use strict';

const util = require('util');

const fetch = require('node-fetch');

const utils = require('./libs/utils');

function invokeSyncIssue(issueNumber) {
  return new Promise((resolve, reject) => {
    const params = {
      FunctionName: 'lambdabaku_sync_issue',
      InvocationType: 'Event', // asynchronous execution
      Payload: JSON.stringify({ issue_number: issueNumber }),
    };

    utils.lambda.invoke(params, (err, data) => {
      if (err) {
        console.log('FAIL', params);
        console.log(util.inspect(err));

        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

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
        tasks.push(invokeSyncIssue(curatedIssue.number));
      }

      Promise.all(tasks)
      .then((results) => {
        callback(null, results);
      })
      .catch((err) => {
        callback(err);
      });
    });
  });
};
