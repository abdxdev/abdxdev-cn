'use client'
import { useImperativeHandle, useRef, HTMLAttributes, Ref } from 'react'
import './shake-element.css'

export function ShakeElement({ children, className, ref, ...props }) {
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