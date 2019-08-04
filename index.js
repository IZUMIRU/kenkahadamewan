const server = require('express')();
const line   = require('@line/bot-sdk');
const axios  = require('axios');
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
  server.post('/bot/webhook', line.middleware(config), function (req, res, next) {
    res.sendStatus(200);
    
    async.each(req.body.events, async function(event, callback){
      if (event.type == 'message' && event.message.type == 'text'){
        const negative = await analyzeSentiment(event);
        if (negative) {
          await postMessage(event);
        }
      }
    });
  });
}

/**
 * GoogleCloudNaturalLanguageAPIを叩いて、
 * positiveかnegativeか判別する
 * negativeであればtrueを返す
 *
 * @param object event
 * @return bool
 */
function analyzeSentiment() {
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
  const response = axios.post(url, data);
  const score    = response.data['documentSentiment']['score'];
  console.log(score);
  
  return score < 0 ? true : false;
}

/**
 * LINEで動画を送信する
 *
 * @param object event
 * @return void
 */
 function postMessage(event) {
  try {
    client.replyMessage(event.replyToken,{
      type               : 'video',
      originalContentUrl : 'https://media2.giphy.com/media/12cPXJ36UX5nO0/giphy-loop.mp4?cid=1dfacafe5d466baf536b67752ee4ea11&rid=giphy-loop.mp4',
      previewImageUrl    : 'https://media3.giphy.com/media/12cPXJ36UX5nO0/480w_s.jpg?cid=1dfacafe5d466baf536b67752ee4ea11&rid=480w_s.jpg'
    });
  } catch (e) {
    console.error('try catch with await: ' + e);
  }
}
