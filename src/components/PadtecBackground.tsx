export function PadtecBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <svg
        className="absolute w-full h-full object-cover opacity-80"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle orange accent fluid lines matching Padtec background */}
        <path
          d="M-200 800 C 300 600, 800 950, 1600 150"
          stroke="#F58220"
          strokeWidth="3.5"
          fill="none"
        />
        <path
          d="M-100 850 C 400 500, 900 850, 1650 100"
          stroke="#1E293B"
          strokeWidth="1.5"
          strokeOpacity="0.6"
          fill="none"
        />
        <path
          d="M-50 900 C 450 450, 950 800, 1700 50"
          stroke="#94A3B8"
          strokeWidth="1"
          strokeOpacity="0.4"
          fill="none"
        />
        {/* Secondary wave lines bottom right */}
        <path
          d="M 600 900 C 900 400, 1200 100, 1600 -100"
          stroke="#F58220"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 650 900 C 950 450, 1250 150, 1650 -50"
          stroke="#CBD5E1"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M 700 900 C 1000 500, 1300 200, 1700 0"
          stroke="#E2E8F0"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  )
}
