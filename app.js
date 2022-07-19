const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// "レビュー" を含むメッセージをリッスンします
app.message('レビュー', async ({ message, say }) => {
    if (message.text.indexOf('https://github.com/') !== -1) {
      const firstReviewerNumber = Math.floor(Math.random() * reviewers.length)
      const firstReviewer = reviewers[firstReviewerNumber]
      reviewers.splice(firstReviewerNumber, 1)
      const secondReviewerNumber = Math.floor(Math.random() * reviewers.length)
      const secondReviewer = reviewers[secondReviewerNumber]

      await say(`レビューお願いたします。 first: <@${firstReviewer}>, second: <@${secondReviewer}>!`);
    }
});

(async () => {
  // アプリを起動します
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ RevieeKun Activate');
})();

let reviewers = [
  'glorymanchesteru',
  'hoge',
  'fuga',
  'hoge2',
  'fuga2',
];



// GitHubで管理をする
// ファイルはGitHubアクションでlambdaにデプロイをする仕組みを作成する。