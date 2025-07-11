"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import NextImage from "next/image"
import { Camera, RotateCcw } from "lucide-react"

/**
 * 배경 이미지 블러 설정값
 */
const BLUR_LEVELS = {
  DEFAULT: 4,
  DOWNSCALE_HOVER: 12,
  RESTORE_HOVER: 0
} as const

/**
 * MRS3 시스템의 메인 랜딩 페이지
 * 
 * 기능:
 * - 배경 이미지와 함께 브랜드 소개
 * - 이미지 압축 및 복원 기능으로 이동하는 네비게이션
 * - 호버 시 배경 블러 효과 변경
 * - 반응형 레이아웃
 */
export default function LandingPage() {
  const router = useRouter()

  // 상태 관리
  const [blurLevel, setBlurLevel] = useState<number>(BLUR_LEVELS.DEFAULT) // 배경 블러 레벨
  const [backgroundLoaded, setBackgroundLoaded] = useState(false) // 배경 이미지 로딩 상태

  /**
   * 배경 이미지 사전 로딩
   * 페이지 로드 시 배경 이미지를 미리 로드하여 부드러운 전환 효과 제공
   */
  useEffect(() => {
    const img = new window.Image()
    img.onload = () => setBackgroundLoaded(true)
    img.src = "/20230823_185401_1.jpg"  
  }, [])

  /**
   * 이미지 압축 페이지로 이동
   */
  const handleDownscale = useCallback(() => {
    router.push("/downscale")
  }, [router])

  /**
   * 이미지 복원 페이지로 이동
   */
  const handleRestore = useCallback(() => {
    router.push("/restore")
  }, [router])

  /**
   * 압축 버튼 호버 시 배경 블러 증가 (압축 효과 시각화)
   */
  const handleDownscaleHover = useCallback(() => {
    setBlurLevel(BLUR_LEVELS.DOWNSCALE_HOVER)
  }, [])

  /**
   * 복원 버튼 호버 시 배경 블러 제거 (선명도 복원 효과 시각화)
   */
  const handleRestoreHover = useCallback(() => {
    setBlurLevel(BLUR_LEVELS.RESTORE_HOVER)
  }, [])

  /**
   * 마우스가 버튼에서 벗어날 때 기본 블러 레벨로 복원
   */
  const handleMouseLeave = useCallback(() => {
    setBlurLevel(BLUR_LEVELS.DEFAULT)
  }, [])

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* 동적 배경 이미지 (블러 효과 포함) */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-300 ${
          backgroundLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: "url(/20230823_185401_1.jpg)",
          filter: `blur(${blurLevel}px)`,
        }}
      />

      {/* 로딩 중 폴백 배경 (그라데이션) */}
      {!backgroundLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-green-400" />
      )}

      {/* 어두운 오버레이 (텍스트 가독성 향상) */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 메인 콘텐츠 영역 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        {/* 브랜드 및 제품 소개 */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 drop-shadow-lg">MRS3</h1>
          <p className="text-xl font-medium drop-shadow-md mb-2">
            다각형 영역 기반 이미지 압축 시스템
          </p>
          <p className="text-lg opacity-90 drop-shadow-md">
            Multi-Region Selective Super-resolution System
          </p>
        </div>

        {/* 기능 카드 영역 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* 이미지 압축 기능 카드 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <Camera className="h-8 w-8 mb-4 text-blue-300" />
            <h3 className="text-xl font-semibold mb-2">이미지 압축</h3>
            <p className="text-sm opacity-90">
              다각형 영역을 선택하여 스마트한 이미지 압축을 수행합니다.
            </p>
          </div>
          
          {/* 이미지 복원 기능 카드 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <RotateCcw className="h-8 w-8 mb-4 text-green-300" />
            <h3 className="text-xl font-semibold mb-2">이미지 복원</h3>
            <p className="text-sm opacity-90">
              AI 기반 EDSR 또는 OpenCV로 고품질 이미지 복원을 제공합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 버튼 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-6 z-20">
        {/* 이미지 압축 버튼 */}
        <Button
          onClick={handleDownscale}
          onMouseEnter={handleDownscaleHover}
          onMouseLeave={handleMouseLeave}
          size="lg"
          className="px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg"
        >
          <Camera className="h-5 w-5 mr-2" />
          이미지 압축
        </Button>
        
        {/* 이미지 복원 버튼 */}
        <Button
          onClick={handleRestore}
          onMouseEnter={handleRestoreHover}
          onMouseLeave={handleMouseLeave}
          size="lg"
          variant="outline"
          className="px-8 py-4 text-lg font-semibold bg-white/90 hover:bg-white transition-all duration-200 shadow-lg border-2"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          이미지 복원
        </Button>
      </div>
    </div>
  )
}
