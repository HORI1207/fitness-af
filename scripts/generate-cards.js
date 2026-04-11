/**
 * Instagram用 記事カード画像生成スクリプト
 *
 * 動作：
 * - articles.json の全記事分の 1080×1080px カード画像を生成
 * - images/cards/ に保存（GitHub Pages で公開される）
 *
 * 使い方：
 *   npm install @napi-rs/canvas
 *   node scripts/generate-cards.js
 */

const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const articles = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'articles.json'), 'utf8')
);

// 出力先ディレクトリ
const OUTPUT_DIR = path.join(__dirname, '..', 'images', 'cards');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// カテゴリごとのカラーテーマ
const CATEGORY_COLORS = {
  '筋トレ':   { bg: '#1a1a2e', accent: '#e94560', sub: '#16213e' },
  'ダイエット': { bg: '#1a2e1a', accent: '#4caf50', sub: '#163516' },
  'サプリ':   { bg: '#1a1e2e', accent: '#2196f3', sub: '#161a36' },
};

/**
 * テキストを指定幅で自動折り返して描画する
 */
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split('');
  let line = '';
  let currentY = y;
  // 日本語は1文字ずつ折り返し
  for (let i = 0; i < text.length; i++) {
    const testLine = line + text[i];
    if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY);
      line = text[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY;
}

function generateCard(article) {
  const SIZE = 1080;
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  const theme = CATEGORY_COLORS[article.category] || CATEGORY_COLORS['筋トレ'];

  // ── 背景 ──
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // ── グラデーションオーバーレイ ──
  const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grad.addColorStop(0, theme.sub + 'cc');
  grad.addColorStop(1, theme.bg + '00');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // ── アクセントライン（上部） ──
  ctx.fillStyle = theme.accent;
  ctx.fillRect(0, 0, SIZE, 8);

  // ── ロゴ ──
  ctx.font = 'bold 52px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('FitLab', 80, 110);

  // ── ロゴ下ライン ──
  ctx.fillStyle = theme.accent;
  ctx.fillRect(80, 125, 120, 4);

  // ── カテゴリバッジ ──
  const badgeX = 80;
  const badgeY = 200;
  ctx.fillStyle = theme.accent;
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, 180, 52, 26);
  ctx.fill();
  ctx.font = 'bold 28px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(article.category, badgeX + 90, badgeY + 36);
  ctx.textAlign = 'left';

  // ── タイトル ──
  ctx.font = 'bold 68px sans-serif';
  ctx.fillStyle = '#ffffff';
  const lastY = drawWrappedText(ctx, article.title, 80, 360, SIZE - 160, 90);

  // ── 区切りライン ──
  ctx.fillStyle = theme.accent + '88';
  ctx.fillRect(80, lastY + 60, SIZE - 160, 3);

  // ── ハッシュタグ ──
  ctx.font = '34px sans-serif';
  ctx.fillStyle = theme.accent;
  const tags = article.tags.slice(0, 3).map(t => `#${t}`).join('  ');
  ctx.fillText(tags, 80, lastY + 120);

  // ── URL ──
  ctx.font = '28px sans-serif';
  ctx.fillStyle = '#ffffff88';
  ctx.fillText('hori1207.github.io/fitness-af', 80, SIZE - 80);

  // ── アクセントライン（下部） ──
  ctx.fillStyle = theme.accent;
  ctx.fillRect(0, SIZE - 8, SIZE, 8);

  // ── 保存 ──
  const slug = article.file.replace('.html', '');
  const outPath = path.join(OUTPUT_DIR, `${slug}.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outPath, buffer);
  console.log(`✅ 生成: ${slug}.png`);
}

console.log(`\n${articles.length} 件のカード画像を生成します...\n`);
for (const article of articles) {
  generateCard(article);
}
console.log(`\n完了！ images/cards/ に保存されました`);
