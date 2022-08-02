const { App, AwsLambdaReceiver } = require('@slack/bolt');

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,
});

// "レビュー" を含むメッセージをリッスンします
app.message('レビュー', async ({ message, say }) => {
  try {
    if (message.text.indexOf('https://github.com/') !== -1) {
      const messageUser = reviewers.indexOf(message.user)
      reviewers.splice(messageUser, 1)
      reviewers = activeReviwers(reviewers)
      const firstReviewerNumber = Math.floor(Math.random() * reviewers.length)
      const firstReviewer = reviewers[firstReviewerNumber]
      reviewers.splice(firstReviewerNumber, 1)
      const secondReviewerNumber = Math.floor(Math.random() * reviewers.length)
      const secondReviewer = reviewers[secondReviewerNumber]
      if (secondReviewer == undefined) {
        await say({text: `レビューお願いいたします。 first: <@${firstReviewer}>, second: <@${secondReviewer}>!`, thread_ts: message.ts})
      } else {
        await say({text: `今はアクティブなユーザーがいないから、時間が立ってからレビューを投げてね`, thread_ts: message.ts})
      }
    }
  }

  catch (error) {
    await say({text: `エラーが発生したよ: ${error}`, thread_ts: message.ts})
  }
});

module.exports.handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
}

// UserIDのリスト
let reviewers = [
  'user1',
  'user2',
  'user3',
  'user4',
];

function activeReviwers(reviewers) {
  return reviewers.map((userId, _) => {
    let result = app.client.users.getPresence({
      user: userId
    });
    if (result.presence == 'active') {
      return userId;
    }
  });
}