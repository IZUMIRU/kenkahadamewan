// main();

/**
 * メイン処理
 */
// function main() {
  const server = require('express')();
  const line   = require('@line/bot-sdk');
  const config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRE,
    apiKey: process.env.GCNL_API_KEY
  };
  server.listen(process.env.PORT || 3000);
  const bot = new line.Client(config);

  server.post('/bot/webhook', line.middleware(config), (req, res, next) => {
    res.sendStatus(200);

    let events_processed = [];

    req.body.events.forEach((event) => {
      if (event.type == 'message' && event.message.type == 'text'){
        if (event.message.text == 'こんにちは'){
          events_processed.push(bot.replyMessage(event.replyToken, {
            type: 'text',
            text: 'あいうえお'
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
// }
