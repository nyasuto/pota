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

### ステージ1：MVPフェーズ ✅ 完了

✅ **プロジェクト初期化**
	•	frontend：Next.js 15 + TypeScript + Tailwind CSS + React 19
	•	backend：Go + Fiber v2 web framework + OpenAI SDK
	•	shared：Cross-platform type definitions (TypeScript/Go) + JSON Schema

✅ **API実装完了**
	•	`/api/v1/suggestions` - AI powered course suggestions
		- 入力: ユーザーリクエスト (コースタイプ・距離・位置・嗜好等)
		- 出力: 東京エリア特化の3つの提案コース
	•	`/api/v1/details` - Detailed course information
		- 入力: 選択されたコース概要
		- 出力: 詳細なwaypoints + 座標情報
	•	`/api/v1/health` - Health check endpoint

✅ **OpenAI GPT-4 統合**
	•	JSON Schema strict mode による構造化レスポンス
	•	東京特化のプロンプト設計と日本語対応
	•	型安全なOpenAI応答処理とエラーハンドリング
	•	環境設定: .env.local → .env フォールバック対応

✅ **型安全性とアーキテクチャ**
	•	共有型定義でフロントエンド・バックエンド間の型安全性確保
	•	Services → Handlers → Routes の清潔なアーキテクチャ
	•	包括的なバリデーションとエラーハンドリング

⸻

### ステージ2：フロントエンド統合フェーズ 🚧 次のステップ

⏳ **フロントエンド実装**
	•	API統合とUIコンポーネント実装
	•	コース提案表示（カード形式）
	•	コース詳細画面の実装
	•	エラーハンドリングとローディング状態

⏳ **地図描画機能**
	•	React-Leaflet統合
	•	複数マーカー描画（waypoints表示）
	•	Polyline描画によるルート可視化
	•	インタラクティブマップ機能

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