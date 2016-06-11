'use strict';

const weekly = require('./libs/weekly');

exports.handle = (event, context, callback) => {
  const issueNumber = parseInt(event.issue_number, 10);

  if (!Number.isInteger(issueNumber)) {
    const err = new Error('Invalid issueNumber');
    callback(err);
  }

  const p1 = weekly.getIssue(issueNumber).then((issue) => {
    return issue;
  });

  const p2 = weekly.getPostsByIssue(issueNumber).then((posts) => {
    return posts;
  });

  Promise.all([p1, p2])
  .then((results) => {
    const issue = results[0];
    const posts = results[1];
    issue.posts = posts;

    callback(null, issue);
  })
  .catch((err) => {
    callback(err);
  });
};
