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
    if (message.text.indexOf('https://github.com/') !== -1) {
      const messageUser = reviewers.indexOf(message.user);
      reviewers.splice(messageUser, 1)
      const firstReviewerNumber = Math.floor(Math.random() * reviewers.length)
      const firstReviewer = reviewers[firstReviewerNumber]
      reviewers.splice(firstReviewerNumber, 1)
      const secondReviewerNumber = Math.floor(Math.random() * reviewers.length)
      const secondReviewer = reviewers[secondReviewerNumber]

      await say(`レビューお願いたします。 first: <@${firstReviewer}>, second: <@${secondReviewer}>!`);
    }
});

module.exports.handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
}

// GitHubでユーザーを管理をする
// ファイルはServerless Frameworkでlambdaにデプロイをする仕組みを作成する。
// slackに存在するユーザー名を登録する。
let reviewers = [
  'user1',
  'user2',
  'user3',
  'user4',
];
