'use strict';

const util = require('util');

const fetch = require('node-fetch');
const string = require('string');

const dynamodbClient = require('./libs/dynamodb').client;
const loadPreference = require('./libs/dynamodb').loadPreference;

const saveIssue = (curatedIssue) => {
  // primary key -> number
  // global secondary index -> publication + publishedAt
  const issue = {
    publication: 'CodeTengu Weekly',
    number: curatedIssue.number,
    title: curatedIssue.title.replace(/(Issue \d+)/, '').trim(), // strip the "Issue xx" prefix
    summary: curatedIssue.summary,
    url: curatedIssue.url,
    publishedAt: parseInt(new Date(curatedIssue.published_at).getTime() / 1000, 10),
    randomKey: Math.random(),
  };

  const params = {
    TableName: 'CodeTengu_WeeklyIssue',
    Item: issue,
  };

  dynamodbClient.put(params, (err, data) => {
    if (err) {
      console.log('FAIL', params);
      console.log(util.inspect(err));
    } else {
      console.log(data);
    }
  });
};

const savePost = (alteredCuratedItem, i) => {
  // primary key -> issueNumber + id
  // global secondary index -> categoryCode + id
  const post = {
    issueNumber: alteredCuratedItem.issue.number,
    categoryCode: alteredCuratedItem.category.code,
    categoryName: alteredCuratedItem.category.name,
    id: alteredCuratedItem.issue.number * 1000 + i,
    title: alteredCuratedItem.title,
    contentText: string(alteredCuratedItem.description).stripTags().s,
    contentHTML: alteredCuratedItem.description,
    type: alteredCuratedItem.type,
    url: alteredCuratedItem.url || alteredCuratedItem.issue.url,
    createdAt: parseInt(new Date(alteredCuratedItem.issue.published_at).getTime() / 1000, 10),
    randomKey: Math.random(),
  };

  const params = {
    TableName: 'CodeTengu_WeeklyPost',
    Item: post,
  };

  dynamodbClient.put(params, (err, data) => {
    if (err) {
      console.log('FAIL', params);
      console.log(util.inspect(err));
    } else {
      console.log(data);
    }
  });
};

exports.handle = (event, context, callback) => {
  console.log('EVENT', event);

  const issueNumber = parseInt(event.issue_number, 10);

  if (!util.isNumber(issueNumber)) {
    throw new Error('Invalid issue_number');
  }

  loadPreference('curatedAPIConfig')
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
      console.log('CURATEDISSUE', curatedIssue);

      saveIssue(curatedIssue);

      let i = 0;
      for (const curatedCategory of curatedIssue.categories) {
        for (const curatedItem of curatedCategory.items) {
          curatedItem.issue = curatedIssue;
          curatedItem.category = curatedCategory;
          i = i + 1;

          savePost(curatedItem, i);
        }
      }

      callback(null, 'DONE');
    });
  });
};
