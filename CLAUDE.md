# CLAUDE.md - [fitness-af / FitLab]

## プロジェクト概要
筋トレ・ダイエット特化アフィリエイトブログ「FitLab」の静的HTMLサイト。
最終目標：Claude Codeエージェントチームによる記事生成・SNS投稿・収益化の**全自動化**。

---

## ディレクトリ構造

```
fitness-af/
├── index.html              # トップページ
├── articles/
│   └── index.html          # 記事一覧ページ
├── posts/
│   ├── _template.html      # 記事HTMLテンプレート
│   └── *.html              # 各記事ファイル
├── css/
│   └── style.css
└── js/
    └── main.js
```

---

## 記事HTML生成ルール

### ファイル命名規則
- `posts/` 配下に英数字ハイフン区切りで作成
- 例: `posts/protein-for-beginners.html`

### 必須クラス名（変更禁止）
| クラス名 | 用途 |
|---|---|
| `article-category` | カテゴリラベル |
| `article-title` | 記事タイトル（h1） |
| `article-meta` | 日付 |
| `article-body` | 本文ラッパー |
| `cta-box` | アフィリエイトCTAボックス |
| `cta-box-title` | CTAタイトル |
| `cta-box-desc` | CTA説明文 |
| `btn` | CTAボタン |
| `section` | 関連記事セクション |
| `section-title` | セクションタイトル |
| `card-grid` | 関連記事カードグリッド |
| `article-list-item` | 記事一覧の各アイテム |
| `article-list-meta` | 記事一覧の日付・カテゴリ |
| `article-list-date` | 日付スパン |
| `article-list-category` | カテゴリスパン |
| `article-list-title` | 記事一覧タイトル |

### 共通ヘッダー（全記事共通・変更禁止）
```html
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
```

### 共通フッター（全記事共通・変更禁止）
```html
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
```

### 記事本文の構成パターン
```
リード文（問題提起・記事概要）
  ↓
H2 × 4〜5本（各セクション）
  ↓
CTAボックス（本文途中の適切な位置）
  ↓
H2「まとめ」+ ul 3点
  ↓
関連記事エリア（空のcard-gridを維持）
```

### CTAボックスのアフィリエイトURL
- 現在はすべて `href="#"` のプレースホルダー
- ASP登録後に実際のURLへ差し替える

### メタディスクリプション
- 130字以内で記述

---

## 記事を追加した後の必須作業
記事HTMLを `posts/` に追加したら、**必ず** `articles/index.html` の `<!-- 追加記事はここに -->` の直前に以下を追記する：

```html
<div class="article-list-item">
  <div class="article-list-meta">
    <span class="article-list-date">YYYY.MM.DD</span>
    <span class="article-list-category">カテゴリ名</span>
  </div>
  <h2 class="article-list-title">
    <a href="/posts/ファイル名.html">記事タイトル</a>
  </h2>
</div>
```

---

## カテゴリ一覧
| カテゴリ名 | 説明 |
|---|---|
| 筋トレ | トレーニング種目・フォーム・頻度など |
| ダイエット | 食事管理・カロリー・体脂肪など |
| サプリ | プロテイン・BCAA・クレアチンなど |

---

## 既知の問題・対応済み事項
- `posts/---1775272069281.html` : ファイル名が不正（エージェントがMarkdownコードブロックのまま保存した残骸）。`diet-meal-rules.html` として正しく作り直し済み。リンクも修正済み。削除して構わない。
- `articles/index.html` の記事カテゴリ修正済み（「ダイエットで失敗しない〜」が誤って「サプリ」になっていた）

## 記事一覧（2026.04.07時点・計25本）
| # | ファイル名 | タイトル | カテゴリ |
|---|---|---|---|
| 1 | beginner-muscle-training.html | 筋トレ初心者が最初の3ヶ月でやるべきこと | 筋トレ |
| 2 | diet-meal-rules.html | ダイエットで失敗しない食事管理の5つのルール | ダイエット |
| 3 | protein-for-beginners.html | 初心者におすすめのプロテイン完全ガイド | サプリ |
| 4 | protein-timing.html | プロテインの飲み方・タイミング完全ガイド | サプリ |
| 5 | home-training.html | 自宅でできる筋トレメニュー | 筋トレ |
| 6 | low-carb-diet.html | 糖質制限ダイエットのやり方と注意点 | ダイエット |
| 7 | bcaa-guide.html | BCAAの効果・飲み方・おすすめ商品 | サプリ |
| 8 | muscle-recovery.html | 筋肉痛を早く回復させる方法 | 筋トレ |
| 9 | training-frequency.html | 筋トレの頻度は週何回が最適？ | 筋トレ |
| 10 | squat-form.html | スクワットの正しいフォームとやり方 | 筋トレ |
| 11 | calorie-calc.html | カロリー計算の方法とダイエットへの活かし方 | ダイエット |
| 12 | creatine-guide.html | クレアチンの効果・飲み方・おすすめ商品 | サプリ |
| 13 | six-pack.html | 腹筋を割る方法と期間の目安 | 筋トレ |
| 14 | whey-vs-soy.html | ホエイプロテインとソイプロテインの違い | サプリ |
| 15 | bench-press.html | ベンチプレスの正しいフォームと重量設定 | 筋トレ |
| 16 | plateau.html | ダイエット停滞期の原因と打破する方法 | ダイエット |
| 17 | cardio-and-training.html | 有酸素運動と筋トレの正しい組み合わせ方 | 筋トレ |
| 18 | gym-guide.html | 初心者のためのジムの選び方 | 筋トレ |
| 19 | deadlift.html | デッドリフトの正しいフォームと重量設定 | 筋トレ |
| 20 | body-fat.html | 体脂肪率を下げる食事と運動 | ダイエット |
| 21 | eaa-vs-bcaa.html | EAA・BCAA・プロテインの違いを徹底比較 | サプリ |
| 22 | multivitamin.html | マルチビタミンは筋トレに必要？ | サプリ |
| 23 | back-training.html | 背中の筋トレメニュー完全ガイド | 筋トレ |
| 24 | meal-plan.html | 筋トレ中の食事メニュー1週間プラン | ダイエット |
| 25 | chicken-recipe.html | 鶏胸肉ダイエットレシピ5選 | ダイエット |

---

## 自動化ロードマップ（将来）
1. **フェーズ1（現在）**: 手動〜半自動で記事を20〜30本に増やす
2. **フェーズ2**: 記事生成スクリプト化（キーワード→HTML自動生成）
3. **フェーズ3**: SNS自動投稿（X/Instagram連携）
4. **フェーズ4**: アフィリエイトリンク自動管理・収益トラッキング
5. **フェーズ5**: 全エージェント連携による完全自動運用
