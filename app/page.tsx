"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import NextImage from "next/image"

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
      <div className="absolute inset-0 bg-black/30" />

      {/* Chewy Dipps Image Overlay - Always Clear */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative z-10">
          <NextImage
            src="/chewy-dipps.png"
            alt="Chewy Dipps"
            width={400}
            height={400}
            className="drop-shadow-2xl"
            priority
          />
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-6 z-20">
        <Button
          onClick={handleDownscale}
          onMouseEnter={handleDownscaleHover}
          onMouseLeave={handleMouseLeave}
          size="lg"
          className="px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-all duration-200"
        >
          Downscale
        </Button>
        <Button
          onClick={handleRestore}
          onMouseEnter={handleRestoreHover}
          onMouseLeave={handleMouseLeave}
          size="lg"
          variant="outline"
          className="px-8 py-4 text-lg font-semibold bg-white/90 hover:bg-white transition-all duration-200"
        >
          Restore
        </Button>
      </div>
    </div>
  )
}
