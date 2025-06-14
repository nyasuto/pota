# ポタりん V2 — AIエージェント駆動リアーキテクチャ (Goバックエンド版)

## プロジェクト概要

ポタりん は、ユーザーの希望に応じてAIが散歩・サイクリングコースを提案し、地図上にルートを可視化するアプリケーションです。
このバージョンでは、AIエージェント（claude等）を積極活用しながら、バックエンドをGo言語で完全再設計します。

## 利用技術スタック
採用技術
### フロントエンド
Next.js 14 (App Router, TypeScript, React 18)
bun

### バックエンド
Golang

### AI連携
OpenAI GPT-4o / GPT-4o-mini API

### 地図描画
React-Leaflet + Leaflet
### スタイリング
Tailwind CSS
### ビルド・開発
Bun (フロント用) / Go modules
### デプロイ
Vercel (フロント), Fly.io or Railway (Goバックエンド)
### 状態管理
React Context or Zustand
### API通信
REST + JSON
### CI/CD
GitHub Actions
### AI開発支援
ChatGPT (claude/Custom GPT)

## ディレクトリ構成

- /frontend  (Next.js, TypeScript, React)
- /backend   (Go, Fiber or Chi)
- /shared    (APIスキーマ定義, JSON Schema)

`/frontend`, `/backend`, `/shared` ディレクトリを作成し、最小構成のアプリケーションを配置しています。

## 機能一覧と実装順序

### ステージ1：MVPフェーズ

✅ プロジェクト初期化
	•	frontend：bunx create-next-app + Tailwind + TypeScript構成
	•	backend：go mod init potarin-backend + Fiber or Chi

✅ API設計 (Go)
	•	/api/v1/suggestions  (AI提案エンドポイント)
	•	入力: ユーザーリクエスト (天候・希望コースタイプ等)
	•	出力: JSONスキーマに準拠したAI提案コース群
	•	/api/v1/details (コース詳細エンドポイント)
	•	入力: 選択されたコース概要
	•	出力: コース詳細 (waypoints + 位置情報含む)

✅ AIプロンプト設計 (claude駆動)
	•	Goサーバー内でプロンプト＋JSONスキーマによるresponse_format利用
	•	型安全なOpenAI応答処理（Goでは非常に強力）

✅ フロント実装
	•	ヘッダー / カード型コース提案表示
	•	コース選択→詳細画面遷移
	•	地図表示 (MapClient SSR排除)
	•	Mapに出発地点のみマーカー描画

⸻

### ステージ2：AI詳細化・ルート描画フェーズ

✅ 詳細APIの拡張
-	AIからsummary + routes[{title, description, position}]を受信

✅ 地図描画
-	複数マーカー描画
-	Polyline描画によるルート可視化

✅ エージェントAPIの段階的投入
	-	OpenAI Functions API利用可能なら、Go側でエージェントスキーマ登録
	-	claudeによるAPIスキーマ検証補助

### ステージ3：拡張フェーズ

-	運動量・距離制御オプション追加
-	ユーザー現在地(GPS)サポート
-	天候API連携
-	履歴保存・再利用機能（SQLite, PostgreSQL）

### 設計・実装の注意点

#### AIプロンプト設計上の注意
-	JSONスキーマを必ずAIに渡す (response_format: json_schema)
-	一切自然文レスポンスさせない (Goのパース強靭性が最大限活きる)

#### Goバックエンド設計上の注意
-	Fiber (またはChi) を使った軽量APIサーバー
-	全APIは JSON POST/GETのみ（OpenAPIスキーマで定義可）
-	OpenAIエラーハンドリングはpanicせず安全に戻す
-	型安全のために明示的な構造体定義を使う

#### フロント実装注意
-	API通信時の型はsharedディレクトリからimportして厳密に管理

## 完成イメージ
-	AIが実時間で適切なサイクリングコースを提案
-	地図上にルートを動的に描画
-	ユーザーは距離・気分・天候を指定可能
-	バックエンドはGoが堅牢にAPI連携を処理
-	開発はClaudeが随時補助