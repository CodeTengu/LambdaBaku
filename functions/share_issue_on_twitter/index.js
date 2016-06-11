'use strict';

const fetch = require('node-fetch');
const Twit = require('twit');

const utils = require('./libs/utils');

exports.handle = (event, context, callback) => {
  const issueNumber = parseInt(event.issue_number, 10);

  if (!Number.isInteger(issueNumber)) {
    const err = new Error('Invalid issueNumber');
    callback(err);
  }

  utils.loadPreference(['curatedAPIConfig', 'twitterAPIConfig'])
  .then((response) => {
    const headers = {
      Authorization: `Token token="${response.curatedAPIConfig.apiKey}"`,
    };

    fetch(`https://api.curated.co/codetengu/api/v1/issues/${issueNumber}/`, { method: 'GET', headers })
    .then(utils.checkHTTPStatus)
    .then((res) => {
      return res.json();
    })
    .then((curatedIssue) => {
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
    })
    .catch((err) => {
      callback(err);
    });
  });
};
