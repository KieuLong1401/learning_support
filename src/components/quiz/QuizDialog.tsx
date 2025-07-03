import { useState, useTransition } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Skeleton } from "../ui/skeleton";
import { sleep } from "@/lib/utils";

const mockMCQRes = {
  type:  'mcq',
  question: 'which one is the right answer?',
  answer: 'right answer',
  wrongAnswers: ['wrong answer 1', 'wrong answer 2', 'wrong answer 3'],
}

export default function QuizDialog(
    {
        isOpen,
        setIsOpen,
    } : {
        isOpen: boolean
        setIsOpen: (value: boolean) => void
    }
) {
    const [isPending, startTransition] = useTransition();
    const [mcqCount, setMcqCount] = useState(4);
    const [tfCount, setTfCount] = useState(2);

    const handleSubmitGenerateQuiz = () => {
    startTransition(async () => {
      try {
        // const res = await server.post('/question', { input_text: input, max_question: 4 });
        // setQuizGenerateOutput(res.data.question || 'No result');
        await sleep(2000)
      } catch (err) {
        console.error(err);
      }
    });
  }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Quiz Custom</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-2">
            <div>
              <label className="block text-sm font-medium mb-1">MCQ Count</label>
              {isPending ? (
                <Skeleton className="h-10 w-full rounded-md bg-gray-200"></Skeleton>
              ) : (
                <input
                  type="range"
                  value={mcqCount}
                  min={0}
                  max={10} //alter turn into api response
                  onChange={(e) => setMcqCount(parseInt(e.target.value))}
                  className="w-full border px-2 py-1 rounded-md"
                  />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">True/False Count</label>
              {isPending ? (
                <Skeleton className="h-10 w-full rounded-md bg-gray-200"></Skeleton>
              ) : (
                <div>
                  <span>0</span>
                  <input
                    type="range"
                    value={tfCount}
                    min={0}
                    max={10} //alter turn into api response
                    onChange={(e) => setTfCount(parseInt(e.target.value))}
                    className="w-full border px-2 py-0 rounded-md"
                    />
                   <span>10</span> {/*//alter turn into api response */}
                </div>
              )}
            </div>
            <Button
              // onClick={() => {
                //   handleSubmitGenerateQuizCustom(mcqCount, tfCount);
              // }}
              disabled={isPending}
              onClick={handleSubmitGenerateQuiz}
            >
              Generate Custom Quiz
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
}