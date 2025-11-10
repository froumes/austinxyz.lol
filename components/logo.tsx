import React from "react"
import Image from "next/image"

interface LogoProps {
  className?: string
  style?: React.CSSProperties
  size?: number
  alt?: string
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  style,
  size = 32,
  alt = "Logo",
}) => {
  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        ...style,
      }}
    >
      <Image
        src="https://raw.githubusercontent.com/froumes/badscripthub/main/BSHLogoNoBackground.png"
        alt={alt}
        width={size}
        height={size}
        className="object-contain"
        style={{
          width: "100%",
          height: "100%",
        }}
        unoptimized // Since you have unoptimized images in next.config
      />
    </div>
  )
}

// Alternative: Using img tag if you prefer (simpler, no Next.js Image optimization)
export const LogoSimple: React.FC<LogoProps> = ({
  className = "",
  style,
  size = 32,
  alt = "Logo",
}) => {
  return (
    <img
      src="https://raw.githubusercontent.com/froumes/badscripthub/main/BSHLogoNoBackground.png"
      alt={alt}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        ...style,
      }}
    />
  )
}

