'use strict';

const fetch = require('node-fetch');

const utils = require('./libs/utils');
const weekly = require('./libs/weekly');

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
        const promise = weekly.getPostsByIssue(curatedIssue.number)
        .then((posts) => {
          const subTasks = [];

          for (const post of posts) {
            if (post.url.indexOf('link.codetengu.com') >= 0) {
              console.log(post.issueNumber, post.url);

              const payload = {
                issue_number: post.issueNumber,
                post_id: post.id,
                post_type: post.type,
                post_title: post.title,
              };

              const subPromise = utils.invokeLambdaFunction('lambdabaku_retrieve_post_url', payload);

              subTasks.push(subPromise);
            }
          }

          return Promise.all(subTasks);
        });

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
