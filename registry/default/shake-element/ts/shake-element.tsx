'use client'
import { useImperativeHandle, useRef, HTMLAttributes, Ref } from 'react'
import './shake-element.css'

export interface ShakeHandle {
  shake: () => void
}

interface ShakeElementProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<ShakeHandle>
}

export function ShakeElement({ children, className, ref, ...props }: ShakeElementProps) {
  const divRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    shake() {
      const el = divRef.current
      if (!el) return
      el.classList.remove('shake')
      void el.offsetWidth
      el.classList.add('shake')
      setTimeout(() => el.classList.remove('shake'), 400)
    },
  }))

  return (
    <>
      <div ref={divRef} className={className} {...props}>
        {children}
      </div>
    </>
  )
}