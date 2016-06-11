'use strict';

const fetch = require('node-fetch');

const utils = require('./libs/utils');
const weekly = require('./libs/weekly');

exports.handle = (event, context, callback) => {
  const issueNumber = parseInt(event.issue_number, 10);

  utils.loadPreference('curatedAPIConfig')
  .then((response) => {
    const headers = {
      Authorization: `Token token="${response.curatedAPIConfig.apiKey}"`,
    };

    // http://support.curated.co/integrations/fetching-issue-data-with-the-api/
    fetch(`https://api.curated.co/codetengu/api/v1/issues/${issueNumber}/`, { method: 'GET', headers })
    .then(utils.checkHTTPStatus)
    .then((res) => {
      return res.json();
    })
    .then((curatedIssue) => {
      return new Promise((resolve, reject) => {
        weekly.saveIssue(curatedIssue)
        .then(() => {
          resolve(curatedIssue);
        })
        .catch((err) => {
          reject(err);
        });
      });
    })
    .then((curatedIssue) => {
      let i = 0;
      const tasks = [];

      for (const curatedCategory of curatedIssue.categories) {
        for (const curatedPost of curatedCategory.items) {
          curatedPost.issue = curatedIssue;
          curatedPost.category = curatedCategory;
          i = i + 1;

          const promise = weekly.savePost(curatedPost, i)
          .then((post) => {
            const payload = {
              issue_number: post.issueNumber,
              post_id: post.id,
              post_type: post.type,
              post_title: post.title,
            };
            return utils.invokeLambdaFunction('lambdabaku_retrieve_post_url', payload);
          });

          tasks.push(promise);
        }
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
