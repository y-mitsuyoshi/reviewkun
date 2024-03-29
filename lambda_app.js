const { App, AwsLambdaReceiver } = require('@slack/bolt');
const { Configuration, OpenAIApi } = require("openai");

const openAiConfiguration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(openAiConfiguration);

const openApiSearch = async (text) => {
  let rsp = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: text,
    temperature: 0.9,
    max_tokens: 1024,
    top_p: 1.0,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  return rsp.data.choices[0].text;
};

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,
});

module.exports.handler = async (event, context, callback) => {
  callback(null, {statusCode: 200, body: JSON.stringify({ok: 'ok'})});
  if (event.headers['X-Slack-Retry-Num']){
    console.log('リトライのため終了');
    console.log(event);
    return;
  }

  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
}

// "レビュー" を含むメッセージをリッスンします(すべてのユーザー対象)
app.message('レビュー', async ({ message, say }) => {
  try {
    if (message.text.indexOf('https://github.com/') !== -1) {
      let reviewers = baseReviewers.concat();
      const messageUser = reviewers.indexOf(message.user)
      reviewers.splice(messageUser, 1)
      const firstReviewer = await reviewer(selectReviewers)
      const secondReviewer = await reviewer(selectReviewers)
      if (secondReviewer != 'undefined' || secondReviewer != undefined) {
        await say({text: `レビューお願いいたします。 first: <@${firstReviewer}>, second: <@${secondReviewer}>!`, thread_ts: message.ts})
      }
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

app.message('質問', async ({ message, say }) => {
  try {
    let text = message.text.replace("質問", "")
    let rsp = await openApiSearch(text);
    await say({ text: `<@${message.user}>: ${rsp}`, thread_ts: message.ts });
  } catch (error) {
    console.error(error);
  }
});

// UserIDのリスト
let baseReviewers = [
  'user1',
  'user2',
  'user3',
  'user4',
];

async function isActive(selectReviewer) {
  let result = await app.client.users.getPresence({
    user: selectReviewer
  });
  return result.presence == 'active'
}

async function reviewer(selectReviewers) {
  let reviewer = 'undefined'
  let count = selectReviewers.length
  for (let i = 0; i < count; i++) {
    let num = Math.floor(Math.random() * selectReviewers.length)
    let tmpReviewer = selectReviewers[num]
    selectReviewers.splice(num, 1)
    if (await isActive(tmpReviewer)) {
      reviewer = tmpReviewer
      break
    }
  }
}
