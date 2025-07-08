"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"

interface Point {
  x: number
  y: number
}

interface PolygonDrawerProps {
  imageUrl: string
  onPolygonComplete: (points: Point[]) => void
}

export default function PolygonDrawer({ imageUrl, onPolygonComplete }: PolygonDrawerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [points, setPoints] = useState<Point[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [canvasScale, setCanvasScale] = useState({ x: 1, y: 1 })

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image || !imageLoaded) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    if (points.length > 0) {
      // Draw polygon
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.setLineDash([])

      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)

      for (let i = 1; i < points.length; i++) {
        const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) * 0.3
        const cp1y = points[i - 1].y + (points[i].y - points[i - 1].y) * 0.3
        const cp2x = points[i].x - (points[i].x - points[i - 1].x) * 0.3
        const cp2y = points[i].y - (points[i].y - points[i - 1].y) * 0.3

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i].x, points[i].y)
      }

      if (isComplete && points.length > 2) {
        const cp1x = points[points.length - 1].x + (points[0].x - points[points.length - 1].x) * 0.3
        const cp1y = points[points.length - 1].y + (points[0].y - points[points.length - 1].y) * 0.3
        const cp2x = points[0].x - (points[0].x - points[points.length - 1].x) * 0.3
        const cp2y = points[0].y - (points[0].y - points[points.length - 1].y) * 0.3

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[0].x, points[0].y)
        ctx.fillStyle = "rgba(59, 130, 246, 0.2)"
        ctx.fill()
      }

      ctx.stroke()

      // Draw points
      points.forEach((point, index) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
        ctx.fillStyle = index === 0 ? "#ef4444" : "#3b82f6"
        ctx.fill()
      })
    }
  }, [points, isComplete, imageLoaded])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isComplete) return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()

      // Calculate the actual coordinates considering canvas scaling
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY

      setPoints((prev) => [...prev, { x, y }])
    },
    [isComplete],
  )

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && points.length >= 3 && !isComplete) {
        setIsComplete(true)
        onPolygonComplete(points)
      }
    },
    [points, isComplete, onPolygonComplete],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])

  const handleImageLoad = () => {
    setImageLoaded(true)
    const canvas = canvasRef.current
    const image = imageRef.current
    if (canvas && image) {
      // Set canvas internal resolution to match image
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight

      // Calculate scale for coordinate conversion
      const rect = canvas.getBoundingClientRect()
      setCanvasScale({
        x: canvas.width / rect.width,
        y: canvas.height / rect.height,
      })
    }
  }

  const resetPolygon = () => {
    setPoints([])
    setIsComplete(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="relative inline-block">
          <img
            ref={imageRef}
            src={imageUrl || "/placeholder.svg"}
            alt="Upload"
            className="hidden"
            onLoad={handleImageLoad}
          />
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="max-w-full h-auto border border-gray-300 rounded cursor-crosshair"
            style={{ maxHeight: "600px" }}
          />
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <p className="text-sm text-gray-600">Click to add points. Press Enter to complete the polygon.</p>
        {points.length > 0 && (
          <Button onClick={resetPolygon} variant="outline" size="sm">
            Reset
          </Button>
        )}
      </div>

      {isComplete && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">Polygon completed with {points.length} points!</p>
        </div>
      )}
    </div>
  )
}
