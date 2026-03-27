interface LikertScaleProps {
  value?: number | null;
  onChange: (value: number) => void;
}

export default function LikertScale({ value, onChange }: LikertScaleProps) {

  const scale = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="flex items-center gap-2">

      {scale.map((num) => {

        const isSelected = value === num;

        return (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`w-10 h-10 border rounded-sm text-sm transition
            ${
              isSelected
                ? "bg-[linear-gradient(90deg,#8F5E25_0%,#FBF4A1_50%,#8F5E25_100%)] text-black border-yellow-500"
                : "bg-[#0F141A] border-[#30363F] text-gray-300 hover:bg-[#1A222C]"
            }`}
          >
            {num}
          </button>
        );
      })}

    </div>
  );
}