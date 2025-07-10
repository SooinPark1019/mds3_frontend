"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import NextImage from "next/image"
import { Camera, RotateCcw } from "lucide-react"

export default function LandingPage() {
  const [blurLevel, setBlurLevel] = useState(4)
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)
  const router = useRouter()

  // Preload background image
  useEffect(() => {
    const img = new window.Image()
    img.onload = () => setBackgroundLoaded(true)
    img.src = "/20230823_185401_1.jpg"  
  }, [])

  const handleDownscale = () => {
    router.push("/downscale")
  }

  const handleRestore = () => {
    router.push("/restore")
  }

  const handleDownscaleHover = () => {
    setBlurLevel(12)
  }

  const handleRestoreHover = () => {
    setBlurLevel(0)
  }

  const handleMouseLeave = () => {
    setBlurLevel(4)
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Blur */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-300 ${
          backgroundLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: "url(/20230823_185401_1.jpg)",
          filter: `blur(${blurLevel}px)`,
        }}
      />

      {/* Fallback background while loading */}
      {!backgroundLoaded && <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-green-400" />}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Main Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 drop-shadow-lg">MRS3</h1>
          <p className="text-xl font-medium drop-shadow-md mb-2">다각형 영역 기반 이미지 압축 시스템</p>
          <p className="text-lg opacity-90 drop-shadow-md">Multi-Region Selective Super-resolution System</p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <Camera className="h-8 w-8 mb-4 text-blue-300" />
            <h3 className="text-xl font-semibold mb-2">이미지 압축</h3>
            <p className="text-sm opacity-90">다각형 영역을 선택하여 스마트한 이미지 압축을 수행합니다.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <RotateCcw className="h-8 w-8 mb-4 text-green-300" />
            <h3 className="text-xl font-semibold mb-2">이미지 복원</h3>
            <p className="text-sm opacity-90">AI 기반 EDSR 또는 OpenCV로 고품질 이미지 복원을 제공합니다.</p>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-6 z-20">
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
