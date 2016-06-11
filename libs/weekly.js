'use strict';

const util = require('util');

const string = require('string');

const utils = require('./utils');

class CodeTenguWeekly {
  constructor() {
    this.dynamodbClient = utils.dynamodbClient;
  }

  getIssues() {
    return new Promise((resolve, reject) => {
      const params = {
        TableName: 'CodeTengu_WeeklyIssue',
        IndexName: 'publication_publishedAt',
        KeyConditionExpression: 'publication = :publication',
        ExpressionAttributeValues: {
          ':publication': 'CodeTengu Weekly',
        },
        ScanIndexForward: false,
      };

      this.dynamodbClient.query(params, (err, data) => {
        if (err) {
          console.log('FAIL', params);
          console.log(util.inspect(err));

          reject(err);
        }

        const response = {
          total_count: data.Count,
          items: data.Items,
        };

        resolve(response);
      });
    });
  }

  getIssue(issueNumber) {
    return new Promise((resolve, reject) => {
      const params = {
        TableName: 'CodeTengu_WeeklyIssue',
        Key: {
          number: issueNumber,
        },
      };

      this.dynamodbClient.get(params, (err, data) => {
        if (err) {
          console.log('FAIL', params);
          console.log(util.inspect(err));

          reject(err);
        } else {
          const response = data.Item;

          resolve(response);
        }
      });
    });
  }

  getPostsByIssue(issueNumber) {
    return new Promise((resolve, reject) => {
      const params = {
        TableName: 'CodeTengu_WeeklyPost',
        KeyConditionExpression: 'issueNumber = :issueNumber',
        ExpressionAttributeValues: {
          ':issueNumber': issueNumber,
        },
        ScanIndexForward: true,
      };

      this.dynamodbClient.query(params, (err, data) => {
        if (err) {
          console.log('FAIL', params);
          console.log(util.inspect(err));

          reject(err);
        } else {
          const response = data.Items;

          resolve(response);
        }
      });
    });
  }

  getPostsByCategory(categoryCode) {
    return new Promise((resolve, reject) => {
      const params = {
        TableName: 'CodeTengu_WeeklyPost',
        IndexName: 'categoryCode_id',
        KeyConditionExpression: 'categoryCode = :categoryCode',
        ExpressionAttributeValues: {
          ':categoryCode': categoryCode,
        },
        ScanIndexForward: false,
      };

      this.dynamodbClient.query(params, (err, data) => {
        if (err) {
          console.log('FAIL', params);
          console.log(util.inspect(err));

          reject(err);
        } else {
          const response = data.Items;

          resolve(response);
        }
      });
    });
  }

  saveIssue(curatedIssue) {
    return new Promise((resolve, reject) => {
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

      this.dynamodbClient.put(params, (err, data) => {
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

  savePost(curatedPost, i) {
    return new Promise((resolve, reject) => {
      // primary key -> issueNumber + id
      // global secondary index -> categoryCode + id
      const post = {
        issueNumber: curatedPost.issue.number,
        categoryCode: curatedPost.category.code,
        categoryName: curatedPost.category.name,
        id: curatedPost.issue.number * 1000 + i,
        title: curatedPost.title,
        contentText: string(curatedPost.description).stripTags().s,
        contentHTML: curatedPost.description,
        type: curatedPost.type,
        url: curatedPost.url || curatedPost.issue.url,
        permalink: curatedPost.url || curatedPost.issue.url,
        createdAt: parseInt(new Date(curatedPost.issue.published_at).getTime() / 1000, 10),
        randomKey: Math.random(),
      };

      const params = {
        TableName: 'CodeTengu_WeeklyPost',
        Item: post,
      };

      this.dynamodbClient.put(params, (err, data) => {
        if (err) {
          console.log('FAIL', params);
          console.log(util.inspect(err));

          reject(err);
        } else {
          console.log('DATA', data);

          resolve(post);
        }
      });
    });
  }

  updatePost(issueNumber, id, attributeUpdates) {
    return new Promise((resolve, reject) => {
      const params = {
        TableName: 'CodeTengu_WeeklyPost',
        Key: {
          issueNumber,
          id,
        },
        AttributeUpdates: attributeUpdates,
      };

      this.dynamodbClient.update(params, (err, data) => {
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
}

module.exports = new CodeTenguWeekly();
