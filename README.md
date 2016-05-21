# LambdaBaku

## Usage

```bash
# install apex
$ curl https://raw.githubusercontent.com/apex/apex/master/install.sh | sh

$ apex deploy
$ apex invoke syncPublishedIssues --logs
$ echo -n '{"issue_number": 1}' | apex invoke syncIssue --logs
```

References:

- https://github.com/apex/apex
- http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html
- http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html
