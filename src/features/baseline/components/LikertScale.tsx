interface LikertScaleProps {
  value?: number | null;
  onChange: (value: number) => void;
  max?: number;
}

export default function LikertScale({ value, onChange, max = 7 }: LikertScaleProps) {
  const scale = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-1.5 md:gap-2">
      {scale.map((num) => {
        const isSelected = value === num;

        return (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`
              w-9 h-9 md:w-11 md:h-11 border rounded-lg text-sm font-medium transition-all
              ${
                isSelected
                  ? "gold-gradient text-black border-secondary shadow-lg shadow-secondary/20"
                  : "bg-white/3 border-white/10 text-gray-400 hover:bg-white/8"
              }
            `}
          >
            {num}
          </button>
        );
      })}
    </div>
  );
}