"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Upload, X } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number
  buttonText?: string
  description?: string
}

export default function FileUpload({
  onFileSelect,
  accept = "image/*",
  maxSize = 10 * 1024 * 1024,
  buttonText = "파일 선택",
  description = "파일을 업로드하세요.",
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      setError(null)

      const files = Array.from(e.dataTransfer.files)
      const file = files[0]

      if (!file) return

      if (accept && accept !== "*/*" && !file.name.endsWith(accept.replace(".", ""))) {
        setError(`지원되지 않는 파일 형식입니다 (${accept})`)
        return
      }

      if (file.size > maxSize) {
        setError("File size too large. Please upload a smaller image.")
        return
      }

      onFileSelect(file)
    },
    [onFileSelect, maxSize],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        setError(null)
        onFileSelect(file)
      }
    },
    [onFileSelect],
  )

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">{description}</p>
        <p className="text-sm text-gray-500">
          {accept === ".pkg"
            ? ".pkg 파일만 업로드 가능"
            : `지원되는 형식: ${accept}, 최대 ${Math.round(maxSize / (1024 * 1024))}MB`}
        </p>
        <label htmlFor="upload-button">
          <span
            className="mt-4 inline-block cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
            tabIndex={0}
          >
            {buttonText}
          </span>
        </label>
        {/* hidden file input (accessibility) */}
        {/* 실제 input은 이미 위에 있음, label+span은 스타일용 */}
      </div>
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <X className="h-4 w-4 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
