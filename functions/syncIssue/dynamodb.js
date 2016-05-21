'use strict';

const util = require('util');

const aws = require('aws-sdk');

const dynamodb = new aws.DynamoDB({ apiVersion: '2012-08-10', region: 'ap-northeast-1' });
const dynamodbClient = new aws.DynamoDB.DocumentClient({ service: dynamodb });

function loadPreference(keys) {
  const realKeys = [];

  if (util.isString(keys)) {
    realKeys.push({ name: keys });
  } else if (util.isArray(keys)) {
    for (const keyName of keys) {
      realKeys.push({ name: keyName });
    }
  } else {
    throw new Error('Invalid keys');
  }

  console.log('REALKEYS', realKeys);

  return new Promise((resolve, reject) => {
    const params = {
      RequestItems: {
        CodeTengu_Preference: {
          Keys: realKeys,
        },
      },
    };

    dynamodbClient.batchGet(params, (err, data) => {
      if (err) {
        console.log('FAIL');
        console.log(util.inspect(err));

        reject(err);
      } else {
        const response = {};

        for (const config of data.Responses.CodeTengu_Preference) {
          response[config.name] = config;
        }

        resolve(response);
      }
    });
  });
}

module.exports = {
  client: dynamodbClient,
  loadPreference,
};
