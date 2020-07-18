#!/bin/bash

# Upload dist/retweeter.zip to S3
aws s3api put-object --bucket ww2twitterbot-retweeter --key ww2twitterbotCode --region eu-central-1 --body dist/retweeter.zip

# Trigger update of Lambda function code for retweeter
aws lambda update-function-code --function-name ww2botretweeter --s3-bucket ww2twitterbot-retweeter --s3-key ww2twitterbotCode
