# Hinako Kumamoto 個人サイト

交流会や紹介で知り合った人に渡す、1ページの自己紹介サイトです。
Next.js 16（静的書き出し）＋ TypeScript ＋ Tailwind v4。GitHub Pages で公開します。

制作用の資料（デザイン仕様・原稿・計画・確認事項）は、制作したPCの `docs/` にあります。`docs/` は**ローカル専用で、このリポジトリには含まれません**（`.gitignore` で除外済み）。

## ローカルで見る

Node 24 を推奨です（22.18 以上が必要）。

```bash
npm install
npm run dev      # http://localhost:3000
```

公開前の確認は次のコマンドです。

```bash
npm run build           # out/ に静的ファイルを書き出す（これがそのまま公開される）
npm run typecheck       # 型チェック
npm run lint            # コードの検査
npm run verify:content  # 原稿（docs/brief-v2.md）とサイトの文章が1字も違わないか確認（brief-v2.md が無いPCでは照合をスキップして警告）
```

## 更新のしかた

サイトの文章・リンク・写真は、次の3か所を直すだけです（どれも日本語の説明コメント付き）。

| 変えたいこと | 直すファイル |
|---|---|
| 文章（全セクション・ナビ・フッター） | `src/content/sections.ts` |
| Instagram / note / メール、GUILD Farm やフッターのリンク先 | `src/config/site.ts` |
| 写真（差し替え・表示ON/OFF・代替テキスト） | `src/config/photos.ts` ＋ `_source-photos/` |

- **リンク**: `site.ts` の `links` に URL（メールはアドレスだけ）を入れると CONTACT に出ます。空文字 `""` のままなら、その項目は自動で非表示です。
- **写真の表示ON/OFF**: `photos.ts` の `visible` を `true` / `false` にします。`false` にすると、その写真が出る場所のレイアウトは自動で切り替わります（PROJECT・詳細ページの EVENT は写真の有無に合わせた配置になります）。許諾の記録は `consent`（`ok` / `pending` / `ng`）。`ng` の写真は `visible: true` にしてもエラーになり、公開されません。
- **写真の差し替え**: 原本を `_source-photos/` に**同じ名前**で置き（高解像度が手に入った場合も同じ）、次を実行します。

  ```bash
  npm run images   # public/images/ と src/config/photo-meta.json を作り直す
  ```

  写真の一部を除外したいときは、`photos.ts` の `crop` で原本から切り落としてから書き出します（CSS で隠さない）。原本より大きく拡大した画像は作りません。
- **SNS で共有されたときの画像（OGP）**: `npm run og` で `public/og.jpg`（1200x630）を作り直します。名前・肩書・核メッセージは `sections.ts` から読み、写真は `_source-photos/8.jpg` を切り出して使います。
- **文章を直したとき**: `npm run verify:content` が、原稿との差を教えてくれます（`docs/brief-v2.md` のあるPCだけ。無い場合は照合がスキップされ、警告が出ます）。Instagram / note / Email が3つとも空のときも警告が出ます（ビルドは止まりません）。和文フォントは「ページで使う文字だけ」をビルド時に集めて配信するので、文章を直したら再ビルド（またはデプロイ）するだけで反映されます。

写真の原本 `_source-photos/` は**リポジトリに含めません**（`.gitignore` 済み）。公開用に変換した `public/images/` と `src/config/photo-meta.json` だけをコミットします。`npm run images` / `npm run og` は原本のあるPCでだけ実行してください（GitHub Actions では実行しません）。

## 公開前チェック

公開リポジトリには、次のものを**入れません**。`git add` の前に確認してください。

- **秘密情報**: パスワード・APIキー・トークン・`.env` / `.env.local`（`.env*` は `.gitignore` 済み。共有してよいのは `.env.example` だけ）
- **個人情報**: 自宅の住所・電話番号・個人のメールアドレス、第三者の氏名や連絡先。連絡先に載せるのは、公開してよいと決めたものだけ（`site.ts` の `links`）
- **写真の原本**: `_source-photos/`（`.gitignore` 済み）。公開してよいのは、変換済みの `public/images/` のうち、掲載の許諾が取れた写真だけ
- **制作用の資料**: `docs/`（`.gitignore` 済み）

確認には `git status` と `git ls-files` が使えます。出てきたファイルの中に上のものが無いことを見てから、最初のコミットをします（手順は下の「公開」の step 3）。コミットに残るメールアドレスの確認も、同じ手順の最初の項目です。

## 公開（GitHub Pages）

**順番が大事です。Pages の設定を先にしてから push します。** 先に push すると、初回のデプロイが失敗します（`configure-pages` が Pages の設定を読めないため）。

1. GitHub にリポジトリを作ります（例: `https://github.com/hinacocreator/portfolio`）。まだ push しません。
2. そのリポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にします（最初の1回だけ）。
3. 手元のフォルダを、最初のコミットにして push します。ターミナルで、このプロジェクトのフォルダに移動してから、次の順に進めます。

   1. **コミットに残るメールアドレスを決めます。** コミット（変更の記録）には、名前とメールアドレスが残り、公開リポジトリでは誰でも見られます。履歴は後から消しにくいので、**公開してよいアドレスかを、先に確認してください**。個人のメールアドレスを出したくないときは、GitHub の noreply アドレスを使います（GitHub の Settings → Emails で「Keep my email addresses private」をオンにすると、`<ID>+<ユーザー名>@users.noreply.github.com` の形のアドレスが表示されます）。このリポジトリだけに設定するコマンドは次のとおりです（`<ID>` と `<ユーザー名>` は自分のものに置き換えます）。

      ```bash
      git config user.email "<ID>+<ユーザー名>@users.noreply.github.com"
      git config user.email    # 設定した値が出ることを確認
      ```

      ※ `git init` がまだなら、先に `git init -b main` を実行しておきます。

   2. 全ファイルを、コミット対象にします。`.gitignore` に書いてあるもの（`docs/`、`_source-photos/`、`.env*` など）は自動で除外されます。

      ```bash
      git add .
      ```

   3. **載せてはいけないものが入っていないか確認します。** 「公開前チェック」の項目（`docs/`、写真の元ファイル `_source-photos/`、`.env`、個人情報など）が、次の2つの出力に出てこないことを見ます。出てきたら、コミットせずに `.gitignore` を直し、`git rm -r --cached <そのファイルやフォルダ>` で対象から外します。

      ```bash
      git status       # コミットされる予定のファイルの一覧
      git ls-files     # リポジトリに入るファイルの全一覧
      ```

   4. 最初のコミットを作ります。コミットが1つも無いと、次の push が `src refspec main does not match any` で失敗します。

      ```bash
      git commit -m "Initial commit"
      ```

   5. GitHub のリポジトリを、送り先（`origin`）として登録します。

      ```bash
      git remote add origin https://github.com/hinacocreator/portfolio.git
      ```

   6. push します。ここで GitHub への認証が求められます。

      ```bash
      git push -u origin main
      ```

   **認証の方法**（どちらか1つ）:

   - **`gh auth login`（おすすめ）**: GitHub CLI（`gh`）を入れておき、`gh auth login` を実行して、画面の案内に従ってブラウザでログインします。済ませると、`git push` でパスワードを聞かれなくなります。
   - **Personal Access Token**: GitHub の Settings → Developer settings → Personal access tokens で発行します。**`workflow` のスコープ（チェック）を必ず含めてください**。このサイトは `.github/workflows/deploy.yml` を一緒に push するため、`workflow` が無いと push が拒否されます（Classic token なら `repo` と `workflow`。Fine-grained token なら、このリポジトリに対して Contents と Workflows の書き込み権限）。`git push` でパスワードを聞かれたら、パスワードの代わりにこのトークンを貼ります。トークンは他人に見せず、ファイルやリポジトリにも書き込みません。

4. `main` に push するたびに、`.github/workflows/deploy.yml` が自動でビルドして公開します。手動で動かしたいときは Actions 画面の「Run workflow」から。
5. 公開URLは `https://hinacocreator.github.io/portfolio/` です（上の例のリポジトリの場合）。Actions が緑になってから開きます。
6. **Google Search Console に sitemap を送信します。** GitHub の project pages では、`robots.txt` がドメイン直下（`https://hinacocreator.github.io/robots.txt`）に置かれず、sitemap が検索エンジンに自動では見つけてもらえません。Google Search Console に `https://hinacocreator.github.io/portfolio/sitemap.xml` を送信してください。

もし初回の Actions が赤くなったら、Settings → Pages の Source が「GitHub Actions」になっているかを確認し、Actions 画面でその実行を開いて **Re-run all jobs** を押します。

公開URLは `https://ユーザー名.github.io/リポジトリ名/` の形です。サブパス（`/リポジトリ名`）と公開URLは、ワークフローが GitHub Pages の設定から自動で読み取り、環境変数としてビルドに渡します。ドメインやリポジトリ名はコードに書いていません。

フッターの「© 年」の年は、ビルドしたときの年で固定されます。新しい年になったら（1月に）、`main` に空コミットなどでもう一度デプロイすると更新されます。

### 独自ドメインに移すとき

例: いまの公開URLが `https://hinacocreator.github.io/portfolio/` で、`https://example.com/` に移す場合。

1. ドメインを用意します。
2. DNS を設定します。サブドメイン（`www.example.com` など）なら、CNAME レコードで `hinacocreator.github.io` を指します。ルートドメイン（`example.com`）なら、A レコードで GitHub Pages の IP アドレスを指します（最新のアドレスは GitHub Docs の「Managing a custom domain for your GitHub Pages site」で確認してください）。
3. **Settings → Pages → Custom domain** にドメインを入れて保存します。DNS の確認が通ったら **Enforce HTTPS** をオンにします（証明書の発行に少し時間がかかります）。GitHub Actions で公開する場合、リポジトリに `CNAME` ファイルを置く必要はありません。
4. リポジトリの Variables に `NEXT_PUBLIC_SITE_URL` を**登録している場合は、新しいドメイン（例: `https://example.com`）に書き換えるか、削除します**。登録した値が自動検出より優先されるため、古い `github.io` のURLのままだと、OGP・canonical・sitemap の絶対URLが古いURLになります。登録していなければ何もしません。
5. 何も書き換えずに、`main` に空コミットなどでもう一度デプロイします。サブパスは自動で空になり、公開URL（OGP・canonical・sitemap の絶対URL）も新しいドメインになります。
6. デプロイ後に、`https://example.com/` を開き、ページのソースで canonical と `og:image` が新しいドメインになっていること、写真とフォントが表示されることを確認します。
7. SNS のプロフィールや名刺に載せたURLも、新しいドメインに差し替えます。

公開URLを固定したいときだけ、リポジトリの **Settings → Secrets and variables → Actions → Variables** に `NEXT_PUBLIC_SITE_URL`（例: `https://example.com`）を登録します（登録した値が優先されます）。

Cloudflare Pages など他のホスティングを使う場合は、ビルドコマンド `npm run build`・出力フォルダ `out`、環境変数は次のとおりです。

| 環境変数 | 意味 | 未設定のとき |
|---|---|---|
| `NEXT_PUBLIC_BASE_PATH` | サブパス配信のときだけ。`/リポジトリ名`（先頭 `/`・末尾なし） | ルート配信 |
| `NEXT_PUBLIC_SITE_URL` | 公開URL（サブパスを含む・末尾 `/` なし）。OGP・canonical・JSON-LD・sitemap の絶対URLに使う | 相対URLで出力（sitemap は空、OGP 画像の絶対URLは出ない） |

手元で試すときは `.env.example` を `.env.local` にコピーして値を入れます（`.env*` は git に入りません）。

## 構成

```
src/content/sections.ts   文章（★編集）
src/config/site.ts        リンク・サイト情報（★編集）
src/config/photos.ts      写真の台帳（★編集）
src/components/sections/  トップの8セクション（Hero.tsx … Contact.tsx）と詳細ページ（ProjectDetail.tsx。/projects/guild-farm/）
src/components/ui/        Photo / Reveal / 見出し などの部品
src/app/                  layout.tsx（metadata・フォント・JSON-LD）, globals.css（デザイントークン）
src/fonts/                Newsreader（欧文・自己ホスト。OFL。ライセンスは THIRD_PARTY_LICENSES.md）
scripts/                  images.mjs（画像）, og.mjs（OGP）, verify-content.mjs（原稿の検証）, og-fonts/（OGP用フォント。OFL）
public/images/            変換済みの写真（npm run images が作る。手で触らない）
THIRD_PARTY_LICENSES.md   同梱フォントの著作権表示とライセンス全文（OFL）
docs/                     制作用の資料（ローカル専用・リポジトリ非同梱。.gitignore 済み）
```

公開前の確認事項（写真の掲載許諾、リンク、ドメインなど）は、制作したPCの `docs/plan.md` の §6 と `docs/photos.md` にあります（リポジトリには入っていません）。

## ライセンス

同梱しているフォント（Newsreader、OGP 用の Shippori Mincho）は SIL Open Font License 1.1 です。著作権表示とライセンス全文は `THIRD_PARTY_LICENSES.md` にあります。フォントを足したり入れ替えたりしたら、このファイルも更新してください。
