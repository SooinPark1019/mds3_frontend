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
  onPolygonComplete: (polygons: Point[][]) => void
}

export default function PolygonDrawer({ imageUrl, onPolygonComplete }: PolygonDrawerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [currentPoints, setCurrentPoints] = useState<Point[]>([])
  const [completedPolygons, setCompletedPolygons] = useState<Point[][]>([])
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

    // Draw completed polygons
    completedPolygons.forEach((polygon: Point[], polygonIndex: number) => {
      if (polygon.length > 0) {
        ctx.strokeStyle = `hsl(${polygonIndex * 60}, 70%, 50%)`
        ctx.fillStyle = `hsla(${polygonIndex * 60}, 70%, 50%, 0.2)`
        ctx.lineWidth = 2
        ctx.setLineDash([])

        ctx.beginPath()
        ctx.moveTo(polygon[0].x, polygon[0].y)

        for (let i = 1; i < polygon.length; i++) {
          ctx.lineTo(polygon[i].x, polygon[i].y)
        }

        if (polygon.length > 2) {
          ctx.closePath()
          ctx.fill()
        }
        ctx.stroke()

        // Draw points
        polygon.forEach((point: Point, index: number) => {
          ctx.beginPath()
          ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
          ctx.fillStyle = index === 0 ? "#ef4444" : `hsl(${polygonIndex * 60}, 70%, 50%)`
          ctx.fill()
        })
      }
    })

    // Draw current polygon being drawn
    if (currentPoints.length > 0) {
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])

      ctx.beginPath()
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y)

      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x, currentPoints[i].y)
      }

      ctx.stroke()

      // Draw current points
      currentPoints.forEach((point: Point, index: number) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
        ctx.fillStyle = index === 0 ? "#ef4444" : "#3b82f6"
        ctx.fill()
      })
    }
  }, [currentPoints, completedPolygons, imageLoaded])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()

      // Calculate the actual coordinates considering canvas scaling
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY

      setCurrentPoints((prev: Point[]) => [...prev, { x, y }])
    },
    [],
  )

  const completeCurrentPolygon = () => {
    if (currentPoints.length >= 3) {
      const newPolygons = [...completedPolygons, currentPoints]
      setCompletedPolygons(newPolygons)
      setCurrentPoints([])
      onPolygonComplete(newPolygons)
    }
  }

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && currentPoints.length >= 3) {
        completeCurrentPolygon()
      }
    },
    [currentPoints],
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

  const resetAllPolygons = () => {
    setCurrentPoints([])
    setCompletedPolygons([])
    onPolygonComplete([])
  }

  const undoLastPoint = () => {
    setCurrentPoints((prev: Point[]) => prev.slice(0, -1))
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

      <div className="flex gap-4 items-center justify-between">
        <p className="text-sm text-gray-600">
          클릭으로 점 추가 → Enter로 다각형 완성 → 여러 다각형 그리기 가능
        </p>
        <div className="flex gap-2">
          {currentPoints.length > 0 && (
            <>
              <Button onClick={undoLastPoint} variant="outline" size="sm">
                마지막 점 삭제
              </Button>
              {currentPoints.length >= 3 && (
                <Button onClick={completeCurrentPolygon} variant="default" size="sm">
                  다각형 완성
                </Button>
              )}
            </>
          )}
          {(currentPoints.length > 0 || completedPolygons.length > 0) && (
            <Button onClick={resetAllPolygons} variant="outline" size="sm">
              전체 초기화
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {completedPolygons.length > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">
              완성된 다각형: {completedPolygons.length}개
            </p>
            {completedPolygons.map((polygon, index) => (
              <p key={index} className="text-xs text-green-600">
                다각형 {index + 1}: {polygon.length}개 점
              </p>
            ))}
          </div>
        )}
        
        {currentPoints.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              현재 그리는 중: {currentPoints.length}개 점 
              {currentPoints.length >= 3 && " (Enter로 완성 가능)"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
