"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Loader2 } from "lucide-react"
import FileUpload from "@/components/file-upload"

export default function RestorePage() {
  const router = useRouter()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)

  const handleFileSelect = (file: File) => {
    setUploadedFile(file)
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setResultUrl(null)
  }

  const handleRestore = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)

    try {
      // Simulate API call to desktop service
      const formData = new FormData()
      formData.append("image", uploadedFile)

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // For demo purposes, we'll use the original image as result
      // In real implementation, this would be the restored image from the API
      setResultUrl(imageUrl)
    } catch (error) {
      console.error("Error processing image:", error)
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
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Restore Image</h1>
        </div>

        {!imageUrl ? (
          <FileUpload onFileSelect={handleFileSelect} />
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Original Image</h2>
              <div className="flex justify-center">
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt="Uploaded image"
                  className="max-w-full h-auto rounded border"
                  style={{ maxHeight: "600px" }}
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleRestore} disabled={isProcessing} size="lg" className="px-8">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  "Restore"
                )}
              </Button>
            </div>

            {resultUrl && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Restored Result</h2>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img
                      src={resultUrl || "/placeholder.svg"}
                      alt="Restored result"
                      className="max-w-full h-auto rounded border"
                      style={{ maxHeight: "600px" }}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={handleDownload}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Result
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
