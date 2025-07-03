"use client"

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import React, { useState, useTransition, use } from "react";
import server from '../../lib/axios'
import { Skeleton } from "@/components/ui/skeleton";
import MCQQuiz from "@/components/quiz/MCQQuiz";
import { Dialog, DialogHeader } from "@/components/ui/dialog";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";

const mockMCQRes = {
  type:  'mcq',
  question: 'which one is the right answer?',
  answer: 'right answer',
  wrongAnswers: ['wrong answer 1', 'wrong answer 2', 'wrong answer 3'],
}

export default function Project(props: {params: Promise<{slug: string[]}>}) {
  const params = use(props.params);
  const [input, setInput] = useState('');
  const [summarizeOutput, setSummarizeOutput] = useState('');
  const [quizGenerateOutput, setQuizGenerateOutput] = useState('');
  const [isPending, startTransition] = useTransition();
  const [mcqCount, setMcqCount] = useState(4);
  const [tfCount, setTfCount] = useState(2);
  const [ModelIsOpened, setModalIsOpened] = useState(false)

  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  //alter fix handleSubmit method for real api
  const handleSubmitSummarize = () => {
    startTransition(async () => {
      try {
        // const res = await server.post('/summarize', { text: input });
        // setSummarizeOutput(res.data.sumary || 'No result');
        await sleep(2000)
      } catch (err) {
        console.error(err);
        setSummarizeOutput('Error');
      }
    });
  };
  const handleSubmitGenerateQuiz = () => {
    startTransition(async () => {
      try {
        // const res = await server.post('/question', { input_text: input, max_question: 4 });
        // setQuizGenerateOutput(res.data.question || 'No result');
        await sleep(2000)
      } catch (err) {
        console.error(err);
        setQuizGenerateOutput('Error');
      }
    });
  }
  const openModal = () => {
    startTransition(async () => {
      try {
        setModalIsOpened(true)
        await sleep(3000)
      } catch (err) {
        console.error(err)
        //alter show erro
      }
    })
  }

  return (
    <>
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        
        <h1>{params.slug.map(e => decodeURIComponent(e)).join('/') + ''}</h1>
        <Textarea
          placeholder="Type here"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          />
        <div className="flex justify-end gap-[4px]  ">
          <Button onClick={handleSubmitSummarize} disabled={isPending}>
            Summarize
          </Button>
          <Button onClick={openModal} disabled={isPending}> {/* //alter error if there're no text */}
            Generate Quiz
          </Button>
        </div>

        {isPending ? (
          <Skeleton className="w-full h-[150px] rounded-md" />
        ) : (
          <Textarea
          placeholder="Result will appear here"
          value={summarizeOutput}
          readOnly
          />
        )}

        <MCQQuiz quiz={mockMCQRes}/>
      </main>
      <Dialog open={ModelIsOpened} onOpenChange={setModalIsOpened}>
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
    </>
  );
}
