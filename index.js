main();

/**
 * メイン処理
 */
function main() {
  const server = require('express')();
  const line   = require('@line/bot-sdk');
  const config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
  };
  server.listen(process.env.PORT || 3000);
  const bot = new line.Client(config);

  server.post('/bot/webhook', line.middleware(config), (req, res, next) => {
    res.sendStatus(200);

    let events_processed = [];

    req.body.events.forEach((event) => {
      if (event.type == 'message' && event.message.type == 'text'){
        const sentiment = analyzeSentiment(event.message.text)
          console.log('来てる1');
        if (sentiment === 'negative') {
          console.log('来てる2');
          events_processed.push(bot.replyMessage(event.replyToken, {
            type: 'text',
            text: 'ネガティブ！！'
          }));
        }
      }
    });

    Promise.all(events_processed).then(
      (response) => {
        console.log(`${response.length} event(s) processed.`);
      }
    );
  });
}

/**
 * GoogleCloudNaturalLanguageAPIを叩いて、
 * LINEに送信されたテキストがpositiveかnegativeか判別する
 *
 * @param string message
 * @return string sentiment
 */
function analyzeSentiment(message) {
  const axios  = require('axios');
  const apiKey = process.env.GCNL_API_KEY;
  const url    = 'https://language.googleapis.com/v1/documents:analyzeSentiment?key=' + apiKey;
  const data   = {
    'document' : {
      'type'     : 'PLAIN_TEXT',
      'language' : 'ja',
      'content'  : message
    },
    'encodingType': 'UTF8'
  };

  axios.post(url, data).then(response => {
    const score     = response.data['documentSentiment']['score'];
    const sentiment = score >= 0 ? 'positive' : 'negative';

    console.log(score);
    console.log(sentiment);

    return sentiment;
  });
}
