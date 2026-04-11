/**
 * X（Twitter）自動投稿スクリプト
 *
 * 動作：
 * - articles.json から今日の記事をローテーションで選択
 * - X API v2 で投稿
 * - GitHub Actions から毎日定期実行される
 *
 * 必要な環境変数（GitHub Secrets に設定）：
 * - X_API_KEY
 * - X_API_SECRET
 * - X_ACCESS_TOKEN
 * - X_ACCESS_TOKEN_SECRET
 */

const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');
const path = require('path');

// ===== 設定 =====
const SITE_BASE_URL = 'https://hori1207.github.io/fitness-af/posts/';
const ARTICLES_FILE = path.join(__dirname, 'articles.json');
const STATE_FILE = path.join(__dirname, 'last-posted.json');
// ================

// X APIクライアントの初期化
const client = new TwitterApi({
  appKey:            process.env.X_API_KEY,
  appSecret:         process.env.X_API_SECRET,
  accessToken:       process.env.X_ACCESS_TOKEN,
  accessSecret:      process.env.X_ACCESS_TOKEN_SECRET,
});

// 記事リストを読み込む
const articles = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));

// 前回投稿したインデックスを取得（なければ-1）
let lastIndex = -1;
if (fs.existsSync(STATE_FILE)) {
  try {
    lastIndex = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')).lastIndex;
  } catch (e) {
    lastIndex = -1;
  }
}

// 次の記事を選択（ローテーション）
const nextIndex = (lastIndex + 1) % articles.length;
const article = articles[nextIndex];

// ツイート本文を生成
const hashtags = article.tags.map(t => `#${t}`).join(' ');
const url = `${SITE_BASE_URL}${article.file}`;

// X は280文字制限（日本語は1文字2バイト扱いで140文字相当）
const tweet = `【FitLab】${article.title}

${url}

${hashtags}`;

console.log('--- 投稿内容 ---');
console.log(tweet);
console.log(`文字数: ${tweet.length}`);
console.log('----------------');

// 投稿実行
(async () => {
  try {
    const rwClient = client.readWrite;
    const result = await rwClient.v2.tweet(tweet);
    console.log('✅ 投稿成功！ Tweet ID:', result.data.id);

    // 投稿済みインデックスを保存
    fs.writeFileSync(STATE_FILE, JSON.stringify({
      lastIndex: nextIndex,
      lastPostedAt: new Date().toISOString(),
      lastTitle: article.title,
      lastTweetId: result.data.id,
    }, null, 2));

    console.log(`次回は「${articles[(nextIndex + 1) % articles.length].title}」を投稿します`);
  } catch (err) {
    console.error('❌ 投稿失敗:', err.message || err);
    process.exit(1);
  }
})();
