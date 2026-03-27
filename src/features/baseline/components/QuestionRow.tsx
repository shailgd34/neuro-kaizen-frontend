import LikertScale from "./LikertScale";

type Question = {
  id: string;
  text: string;
  domain: string;
  question_no?: number | null;
  answer?: number | null;
  subscale?: string;
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
    <div className="py-4 border-b border-dashed border-[#30363F] flex justify-between items-start gap-10">
      {/* Question text */}
      <div className="max-w-xl">
        <p className="text-gray-300 leading-relaxed">
          {question.question_no}. {question.text}
        </p>
        {/* <span className="text-sm text-gray-400 mt-4">{question.subscale}</span> */}
      </div>

      {/* Likert Scale */}
      <div className="flex flex-col items-end">
        <LikertScale value={question.answer} onChange={handleChange} />

        <div className="flex justify-between text-xs text-gray-500 mt-2 w-full">
          <span>Strongly Disagree</span>
          <span>Neutral</span>
          <span>Strongly Agree</span>
        </div>
      </div>
    </div>
  );
}
