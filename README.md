# LambdaBaku

Using AWS Lambda to automate routine tasks of [CodeTengu](http://codetengu.com/).

See [CodeTengu/headquarters#62](https://github.com/CodeTengu/headquarters/issues/62).

## Usage

```bash
# install apex to manage AWS Lambda functions
$ curl https://raw.githubusercontent.com/apex/apex/master/install.sh | sh

$ apex deploy
$ apex invoke sync_published_issues --logs
$ apex invoke get_issues --logs
$ apex invoke check_post_urls --logs
$ echo -n '{"issue_number": 42}' | apex invoke sync_issue --logs
$ echo -n '{"issue_number": 42}' | apex invoke get_issue_detail --logs
$ echo -n '{"issue_number": 42}' | apex invoke share_issue_on_twitter --logs
```

References:

- https://github.com/apex/apex
- http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html
- http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html

## HTTP API

You must add to each request a custom header named `x-api-key`. It's now in private beta, you may need to contact us for requesting an API key.

- https://lfsfm1czqg.execute-api.ap-northeast-1.amazonaws.com/v1/issues
- https://lfsfm1czqg.execute-api.ap-northeast-1.amazonaws.com/v1/issues/1

References:

- http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-api-keys.html
