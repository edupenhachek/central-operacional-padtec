import { useState, useRef, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ZoomIn, ZoomOut } from 'lucide-react'

interface ImageCropModalProps {
  open: boolean
  imageSrc: string | null
  onCancel: () => void
  onConfirm: (file: File) => void
}

const OUTPUT_SIZE = 256
const CROP_SIZE = 260

export function ImageCropModal({ open, imageSrc, onCancel, onConfirm }: ImageCropModalProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [naturalW, setNaturalW] = useState(0)
  const [naturalH, setNaturalH] = useState(0)
  const [scale, setScale] = useState(1)
  const [minScale, setMinScale] = useState(1)
  const [maxScale, setMaxScale] = useState(3)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 })

  useEffect(() => {
    if (open && imageSrc) {
      setScale(1)
      setOffset({ x: 0, y: 0 })
    }
  }, [open, imageSrc])

  const handleImageLoad = useCallback(() => {
    const img = imageRef.current
    if (!img) return
    const nw = img.naturalWidth
    const nh = img.naturalHeight
    setNaturalW(nw)
    setNaturalH(nh)
    const minS = Math.max(CROP_SIZE / nw, CROP_SIZE / nh)
    setMinScale(minS)
    setMaxScale(minS * 4)
    setScale(minS)
  }, [])

  const clampOffset = useCallback(
    (x: number, y: number, s: number) => {
      const scaledW = naturalW * s
      const scaledH = naturalH * s
      const maxX = Math.max(0, (scaledW - CROP_SIZE) / 2)
      const maxY = Math.max(0, (scaledH - CROP_SIZE) / 2)
      return {
        x: Math.max(-maxX, Math.min(maxX, x)),
        y: Math.max(-maxY, Math.min(maxY, y)),
      }
    },
    [naturalW, naturalH],
  )

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    const clamped = clampOffset(dragStart.current.ox + dx, dragStart.current.oy + dy, scale)
    setOffset(clamped)
  }

  const handlePointerUp = () => setDragging(false)

  const handleScaleChange = (value: number[]) => {
    const newScale = value[0]
    const clamped = clampOffset(offset.x, offset.y, newScale)
    setOffset(clamped)
    setScale(newScale)
  }

  const handleConfirm = () => {
    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imageRef.current
    if (!img || !naturalW || !naturalH) return

    ctx.save()
    ctx.beginPath()
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2)
    ctx.clip()

    const scaledW = naturalW * scale
    const scaledH = naturalH * scale
    const cropLeft = scaledW / 2 + offset.x - CROP_SIZE / 2
    const cropTop = scaledH / 2 + offset.y - CROP_SIZE / 2

    const sx = cropLeft / scale
    const sy = cropTop / scale
    const sw = CROP_SIZE / scale
    const sh = CROP_SIZE / scale

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
    ctx.restore()

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], 'avatar.png', { type: 'image/png' })
        onConfirm(file)
      },
      'image/png',
      0.95,
    )
  }

  const imgDisplayW = naturalW * scale
  const imgDisplayH = naturalH * scale
  const imgLeft = CROP_SIZE / 2 - imgDisplayW / 2 + offset.x
  const imgTop = CROP_SIZE / 2 - imgDisplayH / 2 + offset.y

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-md bg-card dark:bg-slate-900 text-card-foreground dark:text-slate-100 border-border">
        <DialogHeader>
          <DialogTitle className="text-center font-bold">Ajustar Foto</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div
            className="relative overflow-hidden rounded-full ring-2 ring-border bg-muted select-none"
            style={{ width: CROP_SIZE, height: CROP_SIZE, cursor: dragging ? 'grabbing' : 'grab' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {imageSrc && (
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={handleImageLoad}
                draggable={false}
                className="absolute pointer-events-none max-w-none"
                style={{
                  width: imgDisplayW,
                  height: imgDisplayH,
                  left: imgLeft,
                  top: imgTop,
                }}
              />
            )}
            <div className="absolute inset-0 rounded-full pointer-events-none ring-1 ring-white/20 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.15)]" />
          </div>

          <div className="w-full flex items-center gap-3 px-4">
            <ZoomOut className="w-4 h-4 text-muted-foreground shrink-0" />
            <Slider
              value={[scale]}
              min={minScale}
              max={maxScale}
              step={0.01}
              onValueChange={handleScaleChange}
              className="flex-1"
            />
            <ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>

          <div className="flex items-center justify-end gap-3 w-full pt-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="text-sm dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
