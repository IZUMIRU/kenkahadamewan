const server = require('express')();
const line   = require('@line/bot-sdk');
const config = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
server.listen(process.env.PORT || 3000);
const client = new line.Client(config);

main();

/**
 * メイン処理
 */
function main() {
  server.post('/bot/webhook', line.middleware(config), (req, res, next) => {
    res.sendStatus(200);
    req.body.events.forEach((event) => {
      if (event.type == 'message' && event.message.type == 'text'){
        post(event);
      }
    });
  });
}

/**
 * GoogleCloudNaturalLanguageAPIを叩いて、
 * LINEに送信されたテキストがnegativeであれば
 * LINEにメッセージを送信する
 *
 * @param object event
 * @return void
 */
async function post(event) {
  const axios  = require('axios');
  const apiKey = process.env.GCNL_API_KEY;
  const url    = 'https://language.googleapis.com/v1/documents:analyzeSentiment?key=' + apiKey;
  const data   = {
    'document' : {
      'type'     : 'PLAIN_TEXT',
      'language' : 'ja',
      'content'  : event.message.text
    },
    'encodingType': 'UTF8'
  };

  const response = await axios.post(url, data);
  const score    = response.data['documentSentiment']['score'];
  console.log(score);

  if (score < 0) {
    client.replyMessage(event.replyToken, {
      type : 'text',
      text : 'ネガティブ！！'
    });
    client.replyMessage(event.replyToken,{
      type               : 'image',
      originalContentUrl : 'https://i.gyazo.com/e772c3b48a07716226f7184d7f417cda.png',
      previewImageUrl    : 'https://i.gyazo.com/f1fbf098052ee9b1b0ccd16e70051e39.png'
    });
  }
}
