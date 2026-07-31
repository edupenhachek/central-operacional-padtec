import logoPadtecSimboloBranco from '@/assets/logo-padtec-simbolo-branco.png'

export function PadtecLogo({ className = 'h-8' }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-2 font-bold tracking-tight text-foreground ${className}`}
    >
      <span className="text-2xl font-extrabold tracking-tighter">padtec</span>
    </div>
  )
}

export function PadtecEmblem({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <div
      className={`bg-[#0B0E14] flex items-center justify-center rounded-lg shadow-md overflow-hidden ${className}`}
    >
      <img
        src={logoPadtecSimboloBranco}
        alt="Padtec"
        className="w-full h-full object-contain"
      />
    </div>
  )
}
