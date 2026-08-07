'use client'

import { useEffect, useRef } from 'react'

interface ConstellationCanvasProps {
  dotColor?: string
  lineColor?: string
  dotCount?: number
}

export function ConstellationCanvas({
  dotColor = 'rgba(15, 23, 42, 0.55)',
  lineColor = 'rgba(59, 130, 246, 0.15)',
  dotCount = 45,
}: ConstellationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let animationId = 0

    interface Point {
      x: number
      y: number
      vx: number
      vy: number
      r: number
    }

    let points: Point[] = []

    function resize() {
      if (!canvas) return
      const parent = canvas.parentElement
      width = parent ? parent.clientWidth : window.innerWidth
      height = parent ? parent.clientHeight : window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    function init() {
      points = Array.from({ length: dotCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.5 + 1.5,
      }))
    }

    function step() {
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)

      for (const p of points) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1
      }

      const maxDist = Math.min(width, height) * 0.18

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i]
          const b = points[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            ctx.beginPath()
            ctx.strokeStyle = lineColor
            ctx.globalAlpha = 1 - dist / maxDist
            ctx.lineWidth = 1
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        }
      }

      for (const p of points) {
        ctx.beginPath()
        ctx.fillStyle = dotColor
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      animationId = requestAnimationFrame(step)
    }

    resize()
    init()
    step()

    const handleResize = () => {
      resize()
      init()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [dotColor, lineColor, dotCount])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block"
    />
  )
}
