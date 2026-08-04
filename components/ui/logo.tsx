import * as React from "react"

interface LogoProps {
  className?: string
  size?: number
}

function LogoInner({ className, size = 36 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="nexusGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="0.5" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#d946ef" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="10" fill="url(#nexusGrad)" />
      <circle cx="20" cy="14" r="3.5" fill="white" />
      <circle cx="13" cy="27" r="3.5" fill="white" />
      <circle cx="27" cy="27" r="3.5" fill="white" />
      <path d="M20 17.5L14.5 23.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 17.5L25.5 23.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M16.5 27L23.5 27" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export { LogoInner as Logo }