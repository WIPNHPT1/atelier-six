import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function base(props: IconProps) {
  return {
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  }
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 4l10 6-10 6V4z" />
    </svg>
  )
}

export function PauseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6.5 4v12M13.5 4v12" />
    </svg>
  )
}

export function LoopIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 9V7a3 3 0 013-3h7M14 4l2 2-2 2" />
      <path d="M16 11v2a3 3 0 01-3 3H6M6 16l-2-2 2-2" />
    </svg>
  )
}

export function NextIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 4l8 6-8 6V4zM15 4v12" />
    </svg>
  )
}

export function PrevIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 4l-8 6 8 6V4zM5 4v12" />
    </svg>
  )
}

export function MetronomeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 17l3-12 3 12H7zM10 5v9" />
    </svg>
  )
}

export function TunerIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 3v3M4 12a6 6 0 0012 0M4 12v3h12v-3" />
    </svg>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 4v1.5M10 14.5V16M4 10h1.5M14.5 10H16M5.8 5.8l1.1 1.1M13.1 13.1l1.1 1.1M14.2 5.8l-1.1 1.1M6.9 13.1l-1.1 1.1" />
    </svg>
  )
}

export function PinIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 3h4l-1 6 3 3H6l3-3-1-6zM10 12v5" />
    </svg>
  )
}

export function ArrowIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  )
}

export function ArcIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 14a6 6 0 0112 0" />
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 4v12M4 10h12" />
    </svg>
  )
}

export function MinusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 10h12" />
    </svg>
  )
}

export function MicIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="7.5" y="3" width="5" height="8" rx="2.5" />
      <path d="M5 10a5 5 0 0010 0M10 15v2" />
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 10.5l3.5 3.5 7.5-8" />
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="9" cy="9" r="5.5" />
      <path d="M13.2 13.2L17 17" />
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  )
}
