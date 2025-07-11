"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"

/**
 * 점의 좌표를 나타내는 인터페이스
 */
interface Point {
  x: number
  y: number
}

/**
 * PolygonDrawer 컴포넌트의 props 타입
 */
interface PolygonDrawerProps {
  imageUrl: string
  onPolygonComplete: (polygons: Point[][]) => void
}

/**
 * 이미지 위에 여러 개의 다각형을 그릴 수 있는 컴포넌트
 * 
 * 기능:
 * - 이미지 위에 마우스 클릭으로 점 추가
 * - Enter 키로 현재 다각형 완성
 * - 여러 개의 다각형 생성 가능
 * - 각 다각형마다 다른 색상으로 표시
 * - 완성된 다각형과 현재 그리고 있는 다각형 구분 표시
 */
export default function PolygonDrawer({ imageUrl, onPolygonComplete }: PolygonDrawerProps) {
  // Canvas와 이미지 참조
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  
  // 상태 관리
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]) // 현재 그리고 있는 다각형의 점들
  const [completedPolygons, setCompletedPolygons] = useState<Point[][]>([]) // 완성된 다각형들
  const [imageLoaded, setImageLoaded] = useState(false) // 이미지 로딩 상태
  const [canvasScale, setCanvasScale] = useState({ x: 1, y: 1 }) // 캔버스 스케일 정보

  /**
   * 캔버스에 이미지와 다각형들을 그리는 함수
   */
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image || !imageLoaded) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 이미지 그리기
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    // 완성된 다각형들 그리기
    completedPolygons.forEach((polygon: Point[], polygonIndex: number) => {
      if (polygon.length > 0) {
        // 각 다각형마다 다른 색상 설정 (HSL 색상환 기반)
        const hue = polygonIndex * 60
        ctx.strokeStyle = `hsl(${hue}, 70%, 50%)`
        ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.2)`
        ctx.lineWidth = 2
        ctx.setLineDash([])

        // 다각형 패스 생성
        ctx.beginPath()
        ctx.moveTo(polygon[0].x, polygon[0].y)

        for (let i = 1; i < polygon.length; i++) {
          ctx.lineTo(polygon[i].x, polygon[i].y)
        }

        // 다각형이 3개 이상의 점을 가지면 닫고 채우기
        if (polygon.length > 2) {
          ctx.closePath()
          ctx.fill()
        }
        ctx.stroke()

        // 다각형의 각 점 그리기
        polygon.forEach((point: Point, index: number) => {
          ctx.beginPath()
          ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
          // 첫 번째 점은 빨간색, 나머지는 다각형 색상
          ctx.fillStyle = index === 0 ? "#ef4444" : `hsl(${hue}, 70%, 50%)`
          ctx.fill()
        })
      }
    })

    // 현재 그리고 있는 다각형 그리기 (점선으로 표시)
    if (currentPoints.length > 0) {
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5]) // 점선 패턴

      ctx.beginPath()
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y)

      for (let i = 1; i < currentPoints.length; i++) {
        ctx.lineTo(currentPoints[i].x, currentPoints[i].y)
      }

      ctx.stroke()

      // 현재 다각형의 점들 그리기
      currentPoints.forEach((point: Point, index: number) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
        // 첫 번째 점은 빨간색, 나머지는 파란색
        ctx.fillStyle = index === 0 ? "#ef4444" : "#3b82f6"
        ctx.fill()
      })
    }
  }, [currentPoints, completedPolygons, imageLoaded])

  // 캔버스 다시 그리기 트리거
  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  /**
   * 캔버스 클릭 이벤트 핸들러
   * 클릭한 위치에 새로운 점 추가
   */
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()

      // 캔버스 스케일링을 고려한 실제 좌표 계산
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY

      // 현재 다각형에 새 점 추가
      setCurrentPoints((prev: Point[]) => [...prev, { x, y }])
    },
    [],
  )

  /**
   * 현재 그리고 있는 다각형을 완성하는 함수
   */
  const completeCurrentPolygon = useCallback(() => {
    if (currentPoints.length >= 3) {
      const newPolygons = [...completedPolygons, currentPoints]
      setCompletedPolygons(newPolygons)
      setCurrentPoints([])
      onPolygonComplete(newPolygons)
    }
  }, [currentPoints, completedPolygons, onPolygonComplete])

  /**
   * 키보드 이벤트 핸들러 (Enter 키로 다각형 완성)
   */
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && currentPoints.length >= 3) {
        completeCurrentPolygon()
      }
    },
    [currentPoints, completeCurrentPolygon],
  )

  // 키보드 이벤트 리스너 등록/해제
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress])

  /**
   * 이미지 로드 완료 시 호출되는 함수
   * 캔버스 크기를 이미지 크기에 맞게 설정
   */
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true)
    const canvas = canvasRef.current
    const image = imageRef.current
    
    if (canvas && image) {
      // 캔버스 내부 해상도를 이미지 원본 크기에 맞게 설정
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight

      // 좌표 변환을 위한 스케일 계산
      const rect = canvas.getBoundingClientRect()
      setCanvasScale({
        x: canvas.width / rect.width,
        y: canvas.height / rect.height,
      })
    }
  }, [])

  /**
   * 모든 다각형을 초기화하는 함수
   */
  const resetAllPolygons = useCallback(() => {
    setCurrentPoints([])
    setCompletedPolygons([])
    onPolygonComplete([])
  }, [onPolygonComplete])

  /**
   * 현재 다각형의 마지막 점을 삭제하는 함수
   */
  const undoLastPoint = useCallback(() => {
    setCurrentPoints((prev: Point[]) => prev.slice(0, -1))
  }, [])

  return (
    <div className="space-y-4">
      {/* 캔버스 영역 */}
      <div className="flex justify-center">
        <div className="relative inline-block">
          {/* 숨겨진 이미지 요소 (로딩 및 크기 참조용) */}
          <img
            ref={imageRef}
            src={imageUrl || "/placeholder.svg"}
            alt="Upload"
            className="hidden"
            onLoad={handleImageLoad}
          />
          
          {/* 실제 그리기 캔버스 */}
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="max-w-full h-auto border border-gray-300 rounded cursor-crosshair"
            style={{ maxHeight: "600px" }}
          />
        </div>
      </div>

      {/* 컨트롤 영역 */}
      <div className="flex gap-4 items-center justify-between">
        <p className="text-sm text-gray-600">
          클릭으로 점 추가 → Enter로 다각형 완성 → 여러 다각형 그리기 가능
        </p>
        
        {/* 버튼 그룹 */}
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

      {/* 상태 표시 영역 */}
      <div className="space-y-2">
        {/* 완성된 다각형 정보 */}
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
        
        {/* 현재 그리는 다각형 정보 */}
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
