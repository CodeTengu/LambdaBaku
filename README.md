# LambdaBaku

用 AWS Lambda 來自動化 [CodeTengu](http://codetengu.com/) 的例行事項、瑣事。

詳見 [CodeTengu/headquarters#62](https://github.com/CodeTengu/headquarters/issues/62)。

## Usage

```bash
# install apex to manage AWS Lambda functions
$ curl https://raw.githubusercontent.com/apex/apex/master/install.sh | sh

$ apex deploy
$ apex invoke syncPublishedIssues --logs
$ echo -n '{"issue_number": 42}' | apex invoke syncIssue --logs
$ echo -n '{"issue_number": 42}' | apex invoke postToTwitter --logs

$ apex build postToTwitter > out.zip
```

References:

- https://github.com/apex/apex
- http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html
- http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html
