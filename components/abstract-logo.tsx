import React from "react"

interface AbstractLogoProps {
  className?: string
  style?: React.CSSProperties
  variant?: "default" | "minimal" | "geometric" | "layered"
  size?: number
}

export const AbstractLogo: React.FC<AbstractLogoProps> = ({
  className = "",
  style,
  variant = "default",
  size = 32,
}) => {
  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    ...style,
  }

  switch (variant) {
    case "minimal":
      return (
        <svg
          className={className}
          style={baseStyle}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Minimal abstract shape - flowing curve */}
          <path
            d="M12 2C8 2 4 4 4 8C4 12 8 14 12 16C16 14 20 12 20 8C20 4 16 2 12 2Z"
            fill="currentColor"
            opacity="0.8"
          />
          <path
            d="M12 8C10 8 8 9 8 11C8 13 10 14 12 15C14 14 16 13 16 11C16 9 14 8 12 8Z"
            fill="currentColor"
          />
        </svg>
      )

    case "geometric":
      return (
        <svg
          className={className}
          style={baseStyle}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Geometric abstract - overlapping shapes */}
          <polygon
            points="12,2 22,8 18,20 6,20 2,8"
            fill="currentColor"
            opacity="0.6"
          />
          <polygon
            points="12,6 18,10 16,18 8,18 6,10"
            fill="currentColor"
            opacity="0.8"
          />
          <polygon
            points="12,10 15,12 14,16 10,16 9,12"
            fill="currentColor"
          />
        </svg>
      )

    case "layered":
      return (
        <svg
          className={className}
          style={baseStyle}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Layered abstract - depth effect */}
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.3" />
          <circle cx="12" cy="12" r="7" fill="currentColor" opacity="0.5" />
          <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.7" />
          <path
            d="M12 8L16 12L12 16L8 12Z"
            fill="currentColor"
            opacity="0.9"
          />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      )

    default:
      // Default: Modern abstract with flowing lines
      return (
        <svg
          className={className}
          style={baseStyle}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Modern abstract design - flowing interconnected shapes */}
          <path
            d="M12 2L20 6V18L12 22L4 18V6L12 2Z"
            fill="currentColor"
            opacity="0.4"
          />
          <path
            d="M12 6L16 8V16L12 18L8 16V8L12 6Z"
            fill="currentColor"
            opacity="0.6"
          />
          <path
            d="M12 10L14 11V13L12 14L10 13V11L12 10Z"
            fill="currentColor"
            opacity="0.8"
          />
          {/* Accent lines */}
          <path
            d="M12 2L20 6M12 2L4 6M12 22L20 18M12 22L4 18"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      )
  }
}

// Alternative: Animated abstract logo with gradient
export const AnimatedAbstractLogo: React.FC<AbstractLogoProps & {
  animated?: boolean
}> = ({ className = "", style, size = 32, animated = true }) => {
  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    ...style,
  }

  return (
    <svg
      className={className}
      style={baseStyle}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.4" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
        {animated && (
          <animateTransform
            attributeName="gradientTransform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="10s"
            repeatCount="indefinite"
          />
        )}
      </defs>
      {/* Abstract flowing design */}
      <path
        d="M12 2C16 2 20 4 22 8C22 12 18 16 12 18C6 16 2 12 2 8C4 4 8 2 12 2Z"
        fill="url(#logoGradient)"
      />
      <path
        d="M12 6C14 6 16 7 17 9C17 11 15 13 12 14C9 13 7 11 7 9C8 7 10 6 12 6Z"
        fill="currentColor"
        opacity="0.6"
      />
      <circle cx="12" cy="10" r="2" fill="currentColor" opacity="0.8" />
    </svg>
  )
}

