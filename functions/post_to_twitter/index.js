'use strict';

const util = require('util');

const fetch = require('node-fetch');
const Twit = require('twit');

const loadPreference = require('./dynamodb').loadPreference;

exports.handle = (event, context, callback) => {
  console.log('EVENT', event);

  const issueNumber = parseInt(event.issue_number, 10);

  if (!util.isNumber(issueNumber)) {
    throw new Error('Invalid issue_number');
  }

  loadPreference(['curatedAPIConfig', 'twitterAPIConfig'])
  .then((response) => {
    const headers = {
      Authorization: `Token token="${response.curatedAPIConfig.apiKey}"`,
    };

    fetch(`https://api.curated.co/codetengu/api/v1/issues/${issueNumber}/`, { method: 'GET', headers })
    .then((res) => {
      return res.json();
    })
    .then((curatedIssue) => {
      console.log('CURATEDISSUE', curatedIssue);

      const twitter = new Twit({
        consumer_key: response.twitterAPIConfig.consumerKey,
        consumer_secret: response.twitterAPIConfig.consumerSecret,
        access_token: response.twitterAPIConfig.accessToken,
        access_token_secret: response.twitterAPIConfig.accessTokenSecret,
      });

      const payload = { status: `CodeTengu Weekly - ${curatedIssue.title}\n${curatedIssue.url}` };

      twitter.post('statuses/update', payload, (err, data) => {
        callback(err, data);
      });
    });
  });
};
