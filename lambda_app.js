const { App, AwsLambdaReceiver } = require('@slack/bolt');

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,
});

// "レビュー" を含むメッセージをリッスンします(すべてのユーザー対象)
app.message('レビュー', async ({ message, say }) => {
  try {
    if (message.text.indexOf('https://github.com/') !== -1) {
      const messageUser = reviewers.indexOf(message.user)
      reviewers.splice(messageUser, 1)
      const firstReviewerNumber = Math.floor(Math.random() * reviewers.length)
      const firstReviewer = await reviewers[firstReviewerNumber]
      reviewers.splice(firstReviewerNumber, 1)
      const secondReviewerNumber = Math.floor(Math.random() * reviewers.length)
      const secondReviewer = await reviewers[secondReviewerNumber]
      await say({text: `レビューお願いいたします。 first: <@${firstReviewer}>, second: <@${secondReviewer}>!`, thread_ts: message.ts})
    }
  }

  catch (error) {
    await say({text: `エラーが発生したよ: ${error}`, thread_ts: message.ts})
  }
});

// "active review" を含むメッセージをリッスンします(アクティブユーザー対象)
app.message('active review', async ({ message, say }) => {
  try {
    if (message.text.indexOf('https://github.com/') !== -1) {
      activeReviwers(baseReviewers).then(value => reviewers = value)
      const messageUser = reviewers.indexOf(message.user)
      reviewers.splice(messageUser, 1)
      const firstReviewerNumber = Math.floor(Math.random() * reviewers.length)
      const firstReviewer = await reviewers[firstReviewerNumber]
      reviewers.splice(firstReviewerNumber, 1)
      const secondReviewerNumber = Math.floor(Math.random() * reviewers.length)
      const secondReviewer = await reviewers[secondReviewerNumber]
      if (secondReviewer != 'undefined' || secondReviewer != undefined) {
        await say({text: `レビューお願いいたします。 first: <@${firstReviewer}>, second: <@${secondReviewer}>!`, thread_ts: message.ts})
      } else {
        await say({text: `今はアクティブなユーザーがいないから、時間が経ってからレビューを投げてね`, thread_ts: message.ts})
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
let baseReviewers = [
  'user1',
  'user2',
  'user3',
  'user4',
];

let reviewers = [];

async function activeReviwers(reviewers) {
  let activeReviwers = []
  for (let i = 0; i < reviewers.length; i++) {
    let reviewer = reviewers[i]
    let result = await app.client.users.getPresence({
      user: reviewer
    });
    if (await result.presence == 'active') {
      await activeReviwers.push(await reviewer)
    }
  }
  return activeReviwers;
}