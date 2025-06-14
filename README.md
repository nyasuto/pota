# ポタりん V2 — AIエージェント駆動リアーキテクチャ (Goバックエンド版)

## プロジェクト概要

ポタりん は、ユーザーの希望に応じてAIが散歩・サイクリングコースを提案し、地図上にルートを可視化するアプリケーションです。
このバージョンでは、AIエージェント（claude等）を積極活用しながら、バックエンドをGo言語で完全再設計します。

## 利用技術スタック

### フロントエンド
- **Next.js 15** (App Router, TypeScript, React 19)
- **Tailwind CSS v4** (PostCSS統合)
- **Bun** (パッケージマネージャー・ランタイム)
- **型安全API通信** (lib/api.ts + React hooks)

### バックエンド
- **Go 1.21+** + **Fiber v2** web framework
- **OpenAI SDK** (sashabaranov/go-openai v1.40.1)
- **JSON Schema strict mode** (構造化AI応答)
- **環境設定** (.env.local → .env フォールバック)

### AI連携
- **OpenAI GPT-4o** API (日本語専用レスポンス)
- **JSON Schema validation** (additionalProperties: false)
- **東京特化プロンプト** 設計

### 共有・型安全性
- **Cross-platform types** (TypeScript ↔ Go)
- **共有型定義** (frontend/backend間)
- **API constants** 管理

### 開発・品質
- **GitHub Actions** CI/CD
- **Dependabot** 自動依存関係更新
- **ESLint + TypeScript** 厳密な型チェック
- **Claude Code** AI開発支援

### デプロイ (予定)
- **Vercel** (フロントエンド)
- **Railway/Fly.io** (Goバックエンド)

## ディレクトリ構成

```
/
├── frontend/          # Next.js 15 + TypeScript + Tailwind CSS
│   ├── app/          # App Router (pages + layouts)
│   │   ├── page.tsx          # ホームページ (コース検索)
│   │   └── course/[id]/      # 動的ルート (コース詳細)
│   ├── hooks/        # React hooks (API統合)
│   ├── lib/          # API client + utilities
│   └── package.json  # Frontend dependencies
├── backend/          # Go + Fiber API server
│   ├── main.go              # アプリケーションエントリーポイント
│   ├── config/config.go     # 環境設定管理
│   ├── handlers/course.go   # HTTP request handlers
│   ├── services/openai.go   # OpenAI API統合
│   └── go.mod               # Go dependencies
└── shared/          # Cross-platform型定義
    ├── types.ts     # TypeScript definitions
    ├── types.go     # Go struct definitions
    ├── schemas.json # JSON Schema for AI
    └── api-constants.ts # API endpoints
```

## 🚀 現在の実装状況

### 完成した機能
- ✅ **コース提案機能**: ユーザーの希望に応じたAI提案
- ✅ **詳細ルート表示**: Waypoint付きの詳細コース情報
- ✅ **日本語対応**: 全てのAI応答が日本語
- ✅ **リアルタイム検索**: インタラクティブなUI/UX
- ✅ **型安全通信**: フロントエンド・バックエンド間
- ✅ **レスポンシブデザイン**: デスクトップ・モバイル対応

### 利用可能なAPI
- `GET /api/v1/health` - ヘルスチェック
- `POST /api/v1/suggestions` - AIコース提案 (東京エリア特化)
- `POST /api/v1/details` - 詳細ルート情報 (waypoints付き)

### デモ環境
- **Frontend**: http://localhost:3001 (Next.js dev server)
- **Backend**: http://localhost:8080 (Go Fiber server)

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

### ステージ2：フロントエンド統合フェーズ ✅ 完了

✅ **フロントエンド API統合**
	•	型安全なAPIクライアント (lib/api.ts) 実装済み
	•	React hooks (hooks/useCourses.ts) でAPI統合
	•	包括的なエラーハンドリングとローディング状態
	•	環境変数による設定管理

✅ **ユーザーインターフェース**
	•	インタラクティブなコース検索フォーム
	•	リアルタイムAI提案表示（カード形式）
	•	レスポンシブデザインと視覚的フィードバック
	•	日本語専用AIレスポンス保証

✅ **コース詳細ページ**
	•	動的ルーティング (/course/[id]) 実装
	•	詳細なwaypoint情報表示
	•	タイプ別色分け表示（スタート/チェックポイント/ランドマーク/ゴール）
	•	座標情報と詳細説明表示

⸻

### ステージ3：地図機能フェーズ 🚧 次のステップ

⏳ **地図描画機能**
	•	React-Leaflet統合
	•	複数マーカー描画（waypoints表示）
	•	Polyline描画によるルート可視化
	•	インタラクティブマップ機能

### ステージ4：拡張フェーズ

⏳ **機能拡張**
	•	ユーザー現在地(GPS)サポート
	•	お気に入り・履歴保存機能
	•	天候API連携
	•	より詳細な嗜好設定オプション

⏳ **品質・パフォーマンス向上**
	•	テスト実装 (Frontend/Backend)
	•	API結果キャッシュ機能
	•	パフォーマンス最適化
	•	セキュリティ強化

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