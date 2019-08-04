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
    
    req.body.events.forEach(async function(event){
      if (event.type == 'message' && event.message.type == 'text'){
        const negative = await analyzeSentiment(event);
        if (negative) {
          const content = await getContent();
          await postMessage(content);
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
async function analyzeSentiment(event) {
  const apiKey = process.env.GCNL_API_KEY;
  const url    = `https://language.googleapis.com/v1/documents:analyzeSentiment?key=${apiKey}`;
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
  
  return score < 0 ? true : false;
}

/**
 * GIPHY APIを叩いて、コンテンツを取得する
 *
 * @return array content
 */
async function getContent() {
  try {
    const apiKey   = process.env.GIPHY_API_KEY;
    const url      = `https://api.giphy.com/v1/gifs/random?api_key=${apiKey}&tag=pomeranian&rating=G`;
    const response = await axios.get(url);
    console.log(response['data']['data'])
    console.log(response['data']['images']['480w_still']['url'])
  } catch (e) {
    console.error(`try catch with await: ${e}`);
  }
}

/**
 * LINEで動画を送信する
 *
 * @param array content
 * @return void
 */
 function postMessage(content) {
  try {
    client.replyMessage(event.replyToken,{
      type               : 'video',
      // 'https://media2.giphy.com/media/12cPXJ36UX5nO0/giphy-loop.mp4?cid=1dfacafe5d466baf536b67752ee4ea11&rid=giphy-loop.mp4'
      originalContentUrl : content['originalContentUrl'],
      // 'https://media3.giphy.com/media/12cPXJ36UX5nO0/480w_s.jpg?cid=1dfacafe5d466baf536b67752ee4ea11&rid=480w_s.jpg'
      previewImageUrl    : content['previewImageUrl']
    });
  } catch (e) {
    console.error(`try catch with await: ${e}`);
  }
}
