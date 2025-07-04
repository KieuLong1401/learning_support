import { useEffect, useState, useTransition } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Skeleton } from "../ui/skeleton";
import { sleep } from "@/lib/utils";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";

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
    const [mcqCount, setMcqCount] = useState([4]);
    const [tfCount, setTfCount] = useState([2]);
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      if (!isOpen) return
      setError(null)
      setMcqCount([0])
      setTfCount([0])
      startTransition(async () => {
        try {
          await sleep(3000)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'unknown error occurred')
        }
      })
    }, [isOpen])

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
            <DialogDescription>{error}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-2">
            <div>
              <div className="flex justify-between items-centers">
                <label className="block text-sm font-medium mb-1">MCQ Count</label>
                <span>{`${mcqCount}/10`}</span> {/* alter turn into api response */}
              </div>
              {isPending ? (
                <Skeleton className="h-10 w-full rounded-md bg-gray-200"></Skeleton>
              ) : (
                <Slider
                  value={mcqCount}
                  max={10}//alter turn into api response
                  min={0}
                  onValueChange={(value) => setMcqCount(value)}
                />
              )}
            </div>
            <div>
              <div className="flex justify-between items-centers">
                <label className="block text-sm font-medium mb-1">True/False Count</label>
                <span>{`${tfCount}/10`}</span> {/* alter turn into api response */}
              </div>
              {isPending ? (
                <Skeleton className="h-10 w-full rounded-md bg-gray-200"></Skeleton>
              ) : (
                <div>
                  <Slider
                    value={tfCount}
                    max={10}//alter turn into api response
                    min={0}
                    onValueChange={(value) => setTfCount(value)}
                  />
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