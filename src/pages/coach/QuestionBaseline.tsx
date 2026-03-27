import { useState } from "react";
import BaselineQuestionCreate from "../../components/coach/BaselineQuestionCreate";
import BaselineQuestionList from "../../components/coach/BaselineQuestionList";

const QuestionBaseline = () => {
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  return (
    <div className="flex flex-1 gap-8">
      <div className="flex-1">
        <BaselineQuestionCreate
          editingQuestion={editingQuestion}
          clearEdit={() => setEditingQuestion(null)}
        />
      </div>
      <div className="flex-2">
        <BaselineQuestionList
          onEdit={(question) => setEditingQuestion(question)}
        />
      </div>
    </div>
  );
};

export default QuestionBaseline;
