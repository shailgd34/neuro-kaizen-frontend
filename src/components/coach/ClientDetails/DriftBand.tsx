interface DriftBandProps {
  currentZ: number;
  min?: number;
  max?: number;
}

export default function DriftBand({ currentZ, min = 0, max = 4 }: DriftBandProps) {
  // Map currentZ to a percentage position on the bar
  const position = Math.min(Math.max(((currentZ - min) / (max - min)) * 100, 0), 100);

  return (
    <div className="w-full grayscale-[0.2] opacity-80 mt-8 mb-12">
      <div className="relative">
        {/* Scale Labels */}
        <div className="flex justify-between text-[10px] text-gray-500 font-bold mb-2 font-mono">
          <span>{min.toFixed(2)}</span>
          <span>{(max/2).toFixed(2)}</span>
          <span>{max.toFixed(2)}</span>
        </div>

        {/* The Gradient Bar */}
        <div className="h-6 w-full rounded-lg relative flex overflow-hidden shadow-inner">
           <div className="flex-1 bg-emerald-500/80" />
           <div className="flex-1 bg-yellow-500/80" />
           <div className="flex-1 bg-red-500/80" />
           <div className="flex-1 bg-red-700/80" />
           
           {/* Overlay overlay for glass effect */}
           <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
        </div>

        {/* Indicator Marker */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-700 ease-out"
          style={{ left: `${position}%` }}
        >
          <div className="flex flex-col items-center">
             <div className="w-0.5 h-10 bg-white shadow-[0_0_15px_white]" />
             <div className="bg-white text-black text-[10px] font-black px-1.5 py-0.5 rounded -mt-2 shadow-xl ring-2 ring-black/20">
                {currentZ.toFixed(2)}
             </div>
          </div>
        </div>

        {/* Bottom Zones */}
        <div className="flex justify-between mt-6 text-[8px] font-black uppercase tracking-[0.3em]">
           <span className="text-emerald-500">Normal Range</span>
           <span className="text-yellow-500">Amber Alert</span>
           <span className="text-red-500">Critical Drift</span>
        </div>
      </div>
    </div>
  );
}
