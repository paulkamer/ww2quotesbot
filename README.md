# WW2QuotesBot

**AWS Lambda-powered Twitter bot**


In a nutshell:
- This twitter bot sends WWII-related quotes
- The quotes are stored in AWS S3, in a CSV file
- The function supports 2 modes:
  1. Tweeting a specific tweet by ID
  2. Tweeting a random one (see 'Random tweet selection')
- Sent tweets are logged to a log file which is also stored in S3

<br/>

**Random tweet selection**

- Relies on tweets log file to prevent sending same tweet too soon again
- Favor tweets "of same day*
  - otherwise picks a random tweet that's "not in the near future"*

> \* By comparing the current date with the `quote_date` ignoring the year part.

<br/>

**Technologies used**

AWS
- CloudFormation
- Lambda
- S3, for storage and
  - `SelectObjectContent` API, to query tweets CSV file with SQL
- SSM Parameter Store
- KMS

Lambda function code (node.js)
- `twitter-lite`
- `winston`
- `prettier`, `eslint`, `babel`
- `mocha`, `chai`, `sinon`


TODOs
- Build up database of tweets
- Set up CloudWatch event rule, for automatic sending of tweets
- Migrate to TypeScript
