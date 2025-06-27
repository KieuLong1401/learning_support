"use client"

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useTransition } from "react";
import server from '../../lib/axios'
import { Skeleton } from "@/components/ui/skeleton";
import MCQQuiz from "@/components/quiz/MCQQuiz";

const mockMCQRes = {
  type:  'mcq',
  question: 'which one is the right answer?',
  answer: 'right answer',
  wrongAnswers: ['wrong answer 1', 'wrong answer 2', 'wrong answer 3'],
}

export default function Project({params}: {params: {slug: string[]}}) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        const res = await server.post('/summarize', { text: input });
        setOutput(res.data.sumary || 'No result');
      } catch (err) {
        console.error(err);
        setOutput('Error');
      }
    });
  };

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-4">
      <h1>{params.slug.join('/') + ''}</h1>
      <Textarea
        placeholder="Type here"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <Button onClick={handleSubmit} disabled={isPending}>
        Summarize
      </Button>

      {isPending ? (
        <Skeleton className="w-full h-[150px] rounded-md" />
      ) : (
        <Textarea
          placeholder="Result will appear here"
          value={output}
          readOnly
        />
      )}

      <MCQQuiz quiz={mockMCQRes}/>
    </main>
  );
}
