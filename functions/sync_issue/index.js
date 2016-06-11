'use strict';

const fetch = require('node-fetch');

const utils = require('./libs/utils');
const weekly = require('./libs/weekly');

exports.handle = (event, context, callback) => {
  const issueNumber = parseInt(event.issue_number, 10);

  if (!Number.isInteger(issueNumber)) {
    const err = new Error('Invalid issueNumber');
    callback(err);
  }

  utils.loadPreference('curatedAPIConfig')
  .then((response) => {
    const headers = {
      Authorization: `Token token="${response.curatedAPIConfig.apiKey}"`,
    };

    // http://support.curated.co/integrations/fetching-issue-data-with-the-api/
    fetch(`https://api.curated.co/codetengu/api/v1/issues/${issueNumber}/`, { method: 'GET', headers })
    .then((res) => {
      return res.json();
    })
    .then((curatedIssue) => {
      const tasks = [];

      tasks.push(weekly.saveIssue(curatedIssue));

      let i = 0;
      for (const curatedCategory of curatedIssue.categories) {
        for (const curatedPost of curatedCategory.items) {
          curatedPost.issue = curatedIssue;
          curatedPost.category = curatedCategory;
          i = i + 1;

          tasks.push(weekly.savePost(curatedPost, i));
        }
      }

      Promise.all(tasks).then((results) => {
        callback(null, results);
      });
    })
    .catch((err) => {
      callback(err);
    });
  });
};
