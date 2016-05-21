'use strict';

const util = require('util');

const aws = require('aws-sdk');
const fetch = require('node-fetch');

const loadPreference = require('./dynamodb').loadPreference;

exports.handle = (event, context, callback) => {
  loadPreference('curated_api_config')
  .then((response) => {
    const headers = {
      Authorization: `Token token="${response.curated_api_config.apiKey}"`,
    };

    // http://support.curated.co/integrations/fetching-issue-data-with-the-api/
    fetch('https://api.curated.co/codetengu/api/v1/issues/?page=1&per_page=250', { method: 'GET', headers })
    .then((res) => {
      return res.json();
    })
    .then((curatedIssues) => {
      const lambda = new aws.Lambda({ apiVersion: '2015-03-31', region: 'ap-northeast-1' });

      for (const curatedIssue of curatedIssues.issues) {
        const params = {
          FunctionName: 'LambdaBaku_syncIssue',
          InvocationType: 'Event', // asynchronous execution
          Payload: JSON.stringify({ issue_number: curatedIssue.number }),
        };

        lambda.invoke(params, (err, data) => {
          if (err) {
            console.log('FAIL', params);
            console.log(util.inspect(err));
          } else {
            console.log(data);
          }
        });
      }

      callback(null, 'DONE');
    });
  });
};
