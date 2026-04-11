/**
 * Instagram Graph API 自動投稿スクリプト
 *
 * 動作：
 * 1. articles.json からローテーションで次の記事を選択
 * 2. images/cards/{slug}.png をメディアコンテナとして登録
 * 3. Instagram に投稿
 * 4. 投稿済みインデックスを last-posted-ig.json に保存
 *
 * 必要な環境変数（GitHub Secrets に設定）：
 * - IG_USER_ID        : Instagram ビジネスアカウントのユーザーID
 * - IG_ACCESS_TOKEN   : Meta Graph API の長期アクセストークン
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ===== 設定 =====
const SITE_BASE     = 'https://hori1207.github.io/fitness-af';
const CARDS_BASE    = `${SITE_BASE}/images/cards`;
const ARTICLES_FILE = path.join(__dirname, 'articles.json');
const STATE_FILE    = path.join(__dirname, 'last-posted-ig.json');
const API_VERSION   = 'v21.0';
// ================

const IG_USER_ID    = process.env.IG_USER_ID;
const ACCESS_TOKEN  = process.env.IG_ACCESS_TOKEN;

if (!IG_USER_ID || !ACCESS_TOKEN) {
  console.error('❌ 環境変数 IG_USER_ID と IG_ACCESS_TOKEN を設定してください');
  process.exit(1);
}

// 記事リスト読み込み
const articles = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));

// 前回インデックスを取得
let lastIndex = -1;
if (fs.existsSync(STATE_FILE)) {
  try { lastIndex = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')).lastIndex; }
  catch { lastIndex = -1; }
}

// 次の記事を選択
const nextIndex = (lastIndex + 1) % articles.length;
const article   = articles[nextIndex];
const slug      = article.file.replace('.html', '');
const imageUrl  = `${CARDS_BASE}/${slug}.png`;
const postUrl   = `${SITE_BASE}/posts/${article.file}`;

// キャプション生成（Instagramは2,200文字以内）
const hashtags = [
  ...article.tags.map(t => `#${t}`),
  '#FitLab', '#フィットネス', '#筋トレ女子', '#ダイエット記録',
].join(' ');

const caption = `【${article.category}】${article.title}

詳しくはプロフィールのリンクから📖
${postUrl}

${hashtags}`;

console.log('--- 投稿内容 ---');
console.log(`記事: ${article.title}`);
console.log(`画像URL: ${imageUrl}`);
console.log(`キャプション:\n${caption}`);
console.log('----------------');

// Graph API リクエスト（Promise版）
function apiRequest(method, endpoint, params) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(params);
    const options = {
      hostname: 'graph.facebook.com',
      path:     `/${API_VERSION}/${endpoint}`,
      method,
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error(`JSON parse error: ${data}`)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  try {
    // ── Step 1: メディアコンテナ作成 ──
    console.log('\n[1/2] メディアコンテナを作成中...');
    const container = await apiRequest('POST', `${IG_USER_ID}/media`, {
      image_url:    imageUrl,
      caption,
      access_token: ACCESS_TOKEN,
    });

    if (container.error) {
      throw new Error(`コンテナ作成失敗: ${JSON.stringify(container.error)}`);
    }
    console.log('コンテナID:', container.id);

    // ── Step 2: 投稿（公開） ──
    console.log('[2/2] Instagram に投稿中...');
    const result = await apiRequest('POST', `${IG_USER_ID}/media_publish`, {
      creation_id:  container.id,
      access_token: ACCESS_TOKEN,
    });

    if (result.error) {
      throw new Error(`投稿失敗: ${JSON.stringify(result.error)}`);
    }

    console.log(`\n✅ 投稿成功！ Post ID: ${result.id}`);

    // ── 投稿済みインデックスを保存 ──
    fs.writeFileSync(STATE_FILE, JSON.stringify({
      lastIndex:     nextIndex,
      lastPostedAt:  new Date().toISOString(),
      lastTitle:     article.title,
      lastPostId:    result.id,
    }, null, 2));

    const next = articles[(nextIndex + 1) % articles.length];
    console.log(`次回: 「${next.title}」`);

  } catch (err) {
    console.error('❌ エラー:', err.message);
    process.exit(1);
  }
})();
