import LikertScale from "./LikertScale";

type Question = {
  id: string;
  text: string;
  domain: string;
  question_no?: number | null;
  answer?: number | null;
  subscale?: string;
  max?: number;
};

interface Props {
  question: Question;
  onAnswer: (questionId: string, answer: number) => void;
}

export default function QuestionRow({ question, onAnswer }: Props) {
  const handleChange = (value: number) => {
    onAnswer(question.id, value);
  };

  return (
    <div className="py-3 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      {/* Question text */}
      <div className="flex-1">
        <p className="text-gray-200 text-sm leading-relaxed font-medium">
          {question.question_no ? `${question.question_no}. ` : ""}{question.text}
        </p>
        {question.subscale && (
          <p className="text-[10px] text-gray-500 font-medium mt-1 leading-none uppercase tracking-wider opacity-60 italic">
            {question.subscale}
          </p>
        )}
      </div>

      {/* Likert Scale */}
      <div className="flex flex-col items-center md:items-end shrink-0 w-full md:w-auto">
        <LikertScale value={question.answer} onChange={handleChange} max={question.max || 7} />

        <div className="flex justify-between text-[11px] text-gray-500 mt-3 w-full max-w-75 font-medium px-1">
          <span>Rarely</span>
          <span>Sometimes</span>
          <span>Always</span>
        </div>
      </div>
    </div>
  );
}
