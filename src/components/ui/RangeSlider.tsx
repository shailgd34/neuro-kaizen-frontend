

type Props = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  unit?: string;
};

export default function RangeSlider({
  value,
  min = 0,
  max = 10,
  step = 1,
  onChange,
  leftLabel,
  rightLabel,
  unit,
}: Props) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3 w-full">
      <div className="relative w-full">
        {/* Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="range-slider w-full"
          style={{
            background: `linear-gradient(
              to right,
              #8F5E25 0%,
              #FBF4A1 ${percentage}%,
              #30363F ${percentage}%,
              #30363F 100%
            )`,
          }}
        />

        {/* Value Bubble */}
        <div
          className="absolute -top-8 transform -translate-x-1/2 text-xs text-black font-medium px-2 py-1 rounded"
          style={{
            left: `${percentage}%`,
            background:
              "linear-gradient(90deg,#8F5E25 0%,#FBF4A1 50%,#8F5E25 100%)",
          }}
        >
          {value} {unit}
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>

      {/* Custom Styles */}
      <style>{`
        .range-slider {
          -webkit-appearance: none;
          height: 12px;
          border-radius: 6px;
          outline: none;
          transition: background 0.3s ease;
        }

        /* Chrome / Edge */
        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(
            90deg,
            #8f5e25 0%,
            #fbf4a1 50%,
            #8f5e25 100%
          );
          border: 2px solid #111;
          cursor: pointer;
          transition: transform 0.15s ease;
        }

        .range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }

        /* Firefox */
        .range-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(
            90deg,
            #8f5e25 0%,
            #fbf4a1 50%,
            #8f5e25 100%
          );
          border: 2px solid #111;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}