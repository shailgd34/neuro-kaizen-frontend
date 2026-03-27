interface Props {
  onBack?: () => void;
  onNext?: () => void;
  onSave?: () => void;
  onReview?: () => void;
  isLast?: boolean;
  isFirst?: boolean;
  disableSubmit?: boolean;
  showReviewButton?: boolean;
}

export default function AssessmentNavigation({
  onBack,
  onNext,
  onSave,
  onReview,
  isLast = false,
  isFirst = false,
  disableSubmit = false,
  showReviewButton = false,
}: Props) {
  return (
    <div className="sticky bottom-0 bg-cardBg border border-[#30363F] px-6 py-4 mt-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => onBack?.()}
          disabled={isFirst}
          className={`border border-[#30363F] px-4 py-2 
          ${isFirst ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          ← Back
        </button>

        <div className="flex gap-3">
          {showReviewButton && (
            <button
              onClick={() => onReview?.()}
              className="border border-amber-400 px-4 py-2  text-amber-300 hover:bg-amber-500/10"
            >
              Go to Review
            </button>
          )}

          <button
            onClick={() => onSave?.()}
            className="border border-[#30363F] px-4 py-2  text-gray-300 hover:border-gray-400 transition"
          >
            Save & Exit
          </button>

          <button
            onClick={() => {
              if (isLast) {
                onReview?.();
              } else {
                onNext?.();
              }
            }}
            disabled={isLast && disableSubmit}
            className={`px-4 py-2  
            ${
              isLast && disableSubmit
                ? "bg-gray-600 cursor-not-allowed text-gray-300"
                : "bg-white text-black"
            }`}
          >
            {isLast ? "Review & Submit" : "Next Section"}
          </button>
        </div>
      </div>
    </div>
  );
}
