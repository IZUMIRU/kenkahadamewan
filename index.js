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
        if(analyzeSentiment(event.message.text) === 'negative') {
          events_processed.push(bot.replyMessage(event.replyToken, {
            type: 'text',
            text: sentiment
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
  const params = {
    'contentType' : 'application/json',
    'method'      : 'post',
    'payload'     : JSON.stringify(data)
  };

  const result    = UrlFetchApp.fetch(url, params);
  const score     = JSON.parse(result)['documentSentiment']['score'];
  const sentiment = score >= 0 ? 'positive' : 'negative';

  return sentiment;
}