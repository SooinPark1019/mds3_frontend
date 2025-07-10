"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, Loader2, Upload } from "lucide-react"
import FileUpload from "@/components/file-upload"

export default function RestorePage() {
  const router = useRouter()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [mrs3Mode, setMrs3Mode] = useState<number>(-1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (file: File) => {
    if (file && file.name.endsWith('.pkg')) {
      setUploadedFile(file)
      setResultUrl(null)
      setError(null)
    } else {
      setError('pkg 파일만 업로드 가능합니다.')
    }
  }

  const handleRestore = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("pkg", uploadedFile)
      formData.append("mrs3_mode", mrs3Mode.toString())

      const response = await fetch("http://localhost:8000/restore", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "복원 처리 중 오류가 발생했습니다.")
      }

      // 복원된 이미지를 blob으로 받기
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setResultUrl(url)
    } catch (error) {
      console.error("Error processing pkg file:", error)
      setError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!resultUrl) return

    const link = document.createElement("a")
    link.href = resultUrl
    link.download = "restored-image.png"
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
          <h1 className="text-3xl font-bold text-gray-900">이미지 복원</h1>
        </div>

        <div className="space-y-6">
          {/* PKG 파일 업로드 */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">PKG 파일 업로드</h2>
            <FileUpload
              onFileSelect={handleFileSelect}
              accept=".pkg"
              maxSize={10 * 1024 * 1024}
            />
            {uploadedFile && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  선택된 파일: {uploadedFile.name}
                </p>
              </div>
            )}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* 복원 설정 */}
          {uploadedFile && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">복원 설정</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    업스케일 방식
                  </label>
                  <Select value={mrs3Mode.toString()} onValueChange={(value) => setMrs3Mode(parseInt(value))}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="업스케일 방식 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">EDSR (고품질 AI 업스케일)</SelectItem>
                      <SelectItem value="0">OpenCV</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    EDSR은 AI 기반 고품질 업스케일링이지만 처리 시간이 오래 걸릴 수 있습니다.
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <Button onClick={handleRestore} disabled={isProcessing} size="lg" className="px-8">
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        복원 중...
                      </>
                    ) : (
                      "이미지 복원"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 복원 결과 */}
          {resultUrl && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">복원 결과</h2>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={resultUrl}
                    alt="복원된 이미지"
                    className="max-w-full h-auto rounded border"
                    style={{ maxHeight: "600px" }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    {mrs3Mode === -1 ? 'EDSR AI 업스케일링' : `OpenCV 방식 (모드 ${mrs3Mode})`}으로 복원된 이미지입니다.
                  </p>
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    복원 이미지 다운로드
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
