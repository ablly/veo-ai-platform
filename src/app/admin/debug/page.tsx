"use client"

import { useState } from "react"

export default function DebugPage() {
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/videos/list?page=1&limit=3&search=&status=all')
      const data = await response.json()
      setApiResponse(data)
    } catch (error) {
      setApiResponse({ error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API 调试页面</h1>
      
      <button
        onClick={testAPI}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '加载中...' : '测试 API'}
      </button>

      {apiResponse && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">API 响应：</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>

          {apiResponse.videos && apiResponse.videos.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">第一个视频的字段：</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>id: {apiResponse.videos[0].id || '(空)'}</li>
                <li>external_task_id: {apiResponse.videos[0].external_task_id || '(空)'}</li>
                <li>model: {apiResponse.videos[0].model || '(空)'}</li>
                <li>user_email: {apiResponse.videos[0].user_email || '(空)'}</li>
                <li>status: {apiResponse.videos[0].status || '(空)'}</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
