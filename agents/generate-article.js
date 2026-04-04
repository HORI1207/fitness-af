#!/usr/bin/env node
/**
 * 記事生成エージェント
 * 使い方: node agents/generate-article.js "キーワード" "カテゴリ"
 * 例:    node agents/generate-article.js "プロテイン おすすめ 初心者" "サプリ"
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ===========================
// 設定
// ===========================
const ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');
const TODAY = new Date().toLocaleDateString('ja-JP', {
  year: 'numeric', month: '2-digit', day: '2-digit'
}).replace(/\//g, '.');

// ===========================
// 引数チェック
// ===========================
const keyword = process.argv[2];
const category = process.argv[3] || '筋トレ';

if (!keyword) {
  console.error('❌ キーワードを指定してください');
  console.error('例: node agents/generate-article.js "プロテイン おすすめ 初心者" "サプリ"');
  process.exit(1);
}

console.log(`\n🤖 記事生成開始`);
console.log(`   キーワード: ${keyword}`);
console.log(`   カテゴリ:   ${category}\n`);

// ===========================
// プロンプト
// ===========================
const prompt = `
あなたは筋トレ・ダイエット専門のWEBライターです。
以下の条件で記事HTMLを生成してください。

【キーワード】${keyword}
【カテゴリ】${category}
【文字数】2000〜3000文字
【対象読者】筋トレ初心者〜中級者

【出力形式】
以下のHTMLテンプレートの{{...}}部分を埋めて、完全なHTMLを出力してください。
コードブロック（\`\`\`html など）は不要です。HTMLだけ出力してください。

<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{{130文字以内のメタディスクリプション}}">
  <title>{{記事タイトル}}｜FitLab</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;600;700&display=swap">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>

  <header class="site-header">
    <div class="container">
      <a href="/" class="site-logo">FitLab</a>
      <nav>
        <ul class="site-nav" id="site-nav">
          <li><a href="/articles/">記事一覧</a></li>
          <li><a href="/articles/?cat=training">筋トレ</a></li>
          <li><a href="/articles/?cat=diet">ダイエット</a></li>
          <li><a href="/articles/?cat=supplement">サプリ</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main>
    <article>
      <div class="article-header">
        <div class="container">
          <p class="article-category">${category}</p>
          <h1 class="article-title">{{記事タイトル}}</h1>
          <p class="article-meta">${TODAY}</p>
        </div>
      </div>

      <div class="container">
        <div class="article-body">
          {{リード文（2〜3段落）}}

          <h2>{{H2見出し1}}</h2>
          {{本文（箇条書き・表を交えて）}}

          <div class="cta-box">
            <p class="cta-box-title">{{CTAタイトル（商品・サービス紹介）}}</p>
            <p class="cta-box-desc">{{CTAの説明文}}</p>
            <a href="#" class="btn" target="_blank" rel="noopener noreferrer">{{ボタンテキスト}} →</a>
          </div>

          <h2>{{H2見出し2}}</h2>
          {{本文}}

          <h2>{{H2見出し3}}</h2>
          {{本文}}

          <h2>まとめ</h2>
          {{まとめ文}}
          <ul>
            <li>{{まとめポイント1}}</li>
            <li>{{まとめポイント2}}</li>
            <li>{{まとめポイント3}}</li>
          </ul>
        </div>

        <div class="section">
          <h2 class="section-title">関連記事</h2>
          <div class="card-grid"></div>
        </div>
      </div>
    </article>
  </main>

  <footer class="site-footer">
    <div class="container">
      <p>&copy; 2026 FitLab. All rights reserved.</p>
      <p style="margin-top:8px;">
        <a href="/privacy.html">プライバシーポリシー</a>
        &nbsp;
        <a href="/disclaimer.html">免責事項</a>
      </p>
    </div>
  </footer>

  <script src="../js/main.js"></script>
</body>
</html>
`;

// ===========================
// Claude CLIで記事生成
// ===========================
console.log('⏳ Claude が記事を生成中...\n');

let html;
try {
  // CLAUDECODE変数をunsetしてネスト制限を回避
  const env = { ...process.env };
  delete env.CLAUDECODE;

  // プロンプトを一時ファイルに書き出してからclaudeに渡す
  const os = require('os');
  const tmpFile = path.join(os.tmpdir(), `fitlab-prompt-${Date.now()}.txt`);
  fs.writeFileSync(tmpFile, prompt, 'utf8');

  let result;
  try {
    result = spawnSync(
      'powershell',
      ['-Command', `Get-Content -Raw '${tmpFile}' | & 'C:\\Users\\seven\\AppData\\Local\\Volta\\bin\\claude.cmd' -p -`],
      {
        cwd: ROOT,
        maxBuffer: 1024 * 1024 * 10,
        timeout: 120000,
        env,
        encoding: 'utf8',
      }
    );
  } finally {
    fs.unlinkSync(tmpFile);
  }

  if (result.status !== 0) {
    throw new Error(result.stderr || result.error?.message || 'claude コマンド失敗');
  }
  html = result.stdout.trim();
} catch (err) {
  console.error('❌ Claude CLIの実行に失敗しました');
  console.error(err.message);
  process.exit(1);
}

// コードブロックが混入した場合の除去
html = html.replace(/^```html\s*/i, '').replace(/```\s*$/, '').trim();

// ===========================
// ファイル名を生成
// ===========================
function toSlug(str) {
  return str
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .toLowerCase()
    .slice(0, 60);
}

const slug = toSlug(keyword) + '-' + Date.now();
const filename = `${slug}.html`;
const filepath = path.join(POSTS_DIR, filename);

// ===========================
// タイトルを抽出
// ===========================
const titleMatch = html.match(/<h1[^>]*class="article-title"[^>]*>(.*?)<\/h1>/s)
  || html.match(/<title>(.*?)｜FitLab<\/title>/s);
const title = titleMatch ? titleMatch[1].trim() : keyword;

// ===========================
// ファイル保存
// ===========================
fs.writeFileSync(filepath, html, 'utf8');
console.log(`✅ 記事ファイルを保存しました: posts/${filename}`);

// ===========================
// index.html の新着記事カードに追記
// ===========================
const indexPath = path.join(ROOT, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

const newCard = `
        <article class="card">
          <div class="card-body">
            <p class="card-category">${category}</p>
            <h3 class="card-title">
              <a href="/posts/${filename}">${title}</a>
            </h3>
            <p class="card-meta">${TODAY}</p>
          </div>
        </article>`;

indexHtml = indexHtml.replace(
  '<!-- 追加記事カードはここに -->',
  `${newCard}\n\n        <!-- 追加記事カードはここに -->`
);
fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('✅ index.html を更新しました');

// ===========================
// articles/index.html のリストに追記
// ===========================
const articlesPath = path.join(ROOT, 'articles', 'index.html');
let articlesHtml = fs.readFileSync(articlesPath, 'utf8');

const newListItem = `
          <div class="article-list-item">
            <div class="article-list-meta">
              <span class="article-list-date">${TODAY}</span>
              <span class="article-list-category">${category}</span>
            </div>
            <h2 class="article-list-title">
              <a href="/posts/${filename}">${title}</a>
            </h2>
          </div>`;

articlesHtml = articlesHtml.replace(
  '<!-- 追加記事はここに -->',
  `${newListItem}\n\n          <!-- 追加記事はここに -->`
);
fs.writeFileSync(articlesPath, articlesHtml, 'utf8');
console.log('✅ articles/index.html を更新しました');

// ===========================
// GitHubにpush
// ===========================
console.log('\n⏳ GitHubにpush中...');
try {
  execSync(`git add . && git commit -m "feat: 記事追加「${title}」" && git push origin main`, {
    cwd: ROOT,
    stdio: 'inherit',
  });
  console.log('\n🚀 デプロイ完了！');
  console.log(`   URL: https://fitness-af.sevenstars3579.workers.dev/posts/${filename}\n`);
} catch (err) {
  console.error('❌ git pushに失敗しました');
  console.error(err.message);
}
