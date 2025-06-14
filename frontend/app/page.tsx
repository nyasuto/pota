export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            ポタりん V2
          </h1>
          <p className="text-lg text-gray-600">
            AIが提案する最適な散歩・サイクリングコース
          </p>
        </header>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              コースを探す
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  希望するコースタイプ
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>散歩コース</option>
                  <option>サイクリングコース</option>
                  <option>ジョギングコース</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  距離の希望
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>短距離（1-3km）</option>
                  <option>中距離（3-10km）</option>
                  <option>長距離（10km以上）</option>
                </select>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-semibold">
                AIにコースを提案してもらう
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              提案されたコース
            </h3>
            <div className="text-gray-500 text-center py-8">
              コースを検索すると、ここに結果が表示されます
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}