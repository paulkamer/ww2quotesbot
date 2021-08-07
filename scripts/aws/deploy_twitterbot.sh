#!/bin/bash

# Upload dist/lambda.zip to S3
aws s3api put-object --bucket ww2twitterbot-lambda --key ww2twitterbotCode --region eu-central-1 --body dist/lambda.zip

# Trigger update of Lambda function code
aws lambda update-function-code --function-name ww2botlambda --s3-bucket ww2twitterbot-lambda --s3-key ww2twitterbotCode
