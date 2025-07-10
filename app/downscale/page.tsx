"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, Loader2 } from "lucide-react"
import FileUpload from "@/components/file-upload"
import PolygonDrawer from "@/components/polygon-drawer"

interface Point {
  x: number
  y: number
}

export default function DownscalePage() {
  const router = useRouter()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [polygons, setPolygons] = useState<Point[][]>([])
  const [scaler, setScaler] = useState<number>(2)
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (file: File) => {
    setUploadedFile(file)
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setPolygons([])
    setResultUrl(null)
    setError(null)
  }

  const handlePolygonsComplete = (newPolygons: Point[][]) => {
    setPolygons(newPolygons)
  }

  const handleDownscale = async () => {
    if (!uploadedFile || polygons.length === 0) return

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("image", uploadedFile)
      formData.append(
        "polygons",
        JSON.stringify(
          polygons.map(poly => poly.map(pt => [Math.round(pt.x), Math.round(pt.y)]))
        )
      )
      formData.append("scaler", scaler.toString())

      const response = await fetch("http://localhost:8000/compress", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "압축 처리 중 오류가 발생했습니다.")
      }

      // .pkg 파일을 blob으로 받기
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setResultUrl(url)
    } catch (error) {
      console.error("Error processing image:", error)
      setError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!resultUrl) return

    const link = document.createElement("a")
    link.href = resultUrl
    link.download = "compressed-output.pkg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button onClick={() => router.push("/")} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            홈으로 돌아가기
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">이미지 압축</h1>
        </div>

        {!imageUrl ? (
          <FileUpload onFileSelect={handleFileSelect} />
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">다각형 영역 선택</h2>
              <PolygonDrawer imageUrl={imageUrl} onPolygonComplete={handlePolygonsComplete} />
            </div>

            {polygons.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">압축 설정</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      다운스케일 배율
                    </label>
                    <Select value={scaler.toString()} onValueChange={(value) => setScaler(parseInt(value))}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="배율 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2배</SelectItem>
                        <SelectItem value="3">3배</SelectItem>
                        <SelectItem value="4">4배</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button onClick={handleDownscale} disabled={isProcessing} size="lg" className="px-8">
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          압축 중...
                        </>
                      ) : (
                        "이미지 압축"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {resultUrl && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">압축 결과</h2>
                <div className="space-y-4">
                  <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-gray-600 mb-4">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-900">압축 완료!</p>
                    <p className="text-sm text-gray-500">
                      {polygons.length}개의 다각형 영역이 {scaler}배 다운스케일로 압축되었습니다.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      압축 파일 다운로드 (.pkg)
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 