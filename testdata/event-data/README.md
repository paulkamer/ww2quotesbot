# Directory test/event-data

This directory is used when testing the event handler locally, using `lambda-local` (part of `serverless`).

`lambda-local` requires passing an "Event data file name", using the `-e option`.

The files in this directory are used for this.

- `specifictweet.js` returns an object that contains a `tweetId`.
  - This results in a specific tweet being tweeted.
- `randomtweet.js` contains an empty object.
  - An empty event results in a random tweet being selected and tweeted.
