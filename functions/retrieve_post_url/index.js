'use strict';

const DOM = require('xmldom').DOMParser;
const fetch = require('node-fetch');
const xpath = require('xpath');

const utils = require('./libs/utils');
const weekly = require('./libs/weekly');

// borrow from http://stackoverflow.com/a/3425925/885524
// magic!
function xpathStringLiteral(s) {
  if (s.indexOf('"') === -1) {
    // return '"' + s + '"';
    return `"${s}"`;
  } else if (s.indexOf("'") === -1) {
    // return "'" + s + "'";
    return `'${s}'`;
  }

  // return 'concat("' + s.replace(/"/g, '",\'"\',"') + '")';
  return `concat("${s.replace(/"/g, '",\'"\',"')}")`;
}

exports.handle = (event, context, callback) => {
  const issueNumber = parseInt(event.issue_number, 10);
  const postID = parseInt(event.post_id, 10);
  const postType = event.post_type;
  const postTitle = event.post_title;

  fetch(`http://weekly.codetengu.com/issues/${issueNumber}`)
  .then(utils.checkHTTPStatus)
  .then((res) => {
    return res.text();
  })
  .then((body) => {
    console.log(body);
    const doc = new DOM().parseFromString(body);

    const postNode = xpath.select(`//div[contains(@class,'item') and .//*[text()=${xpathStringLiteral(postTitle)}]]`, doc)[0];
    const permalinkNode = xpath.select('.//a[@class="permalink"]', postNode)[0];

    let url;
    const permalink = permalinkNode.getAttribute('href').replace('?m=web', '');

    if (postType === 'Link') {
      const titleNode = xpath.select(`//a[text()=${xpathStringLiteral(postTitle)}]`, doc)[0];
      url = titleNode.getAttribute('title');
    } else if (postType === 'Text') {
      url = permalink;
    } else {
      const err = new Error('Invalid postType');
      callback(err);
    }

    const attributeUpdates = {
      url: {
        Action: 'PUT',
        Value: url,
      },
      permalink: {
        Action: 'PUT',
        Value: permalink,
      },
    };

    return weekly.updatePost(issueNumber, postID, attributeUpdates);
  })
  .then((data) => {
    callback(null, data);
  })
  .catch((err) => {
    callback(err);
  });
};
