"use client";

import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MCQQuizProps {
    type: string
    question: string;
    answer: string;
    wrongAnswers: string[];
}

export default function MCQQuiz({quiz}: {quiz: MCQQuizProps}) {
    const [options, setOptions] = useState<{ text: string; isCorrect: boolean }[]>([])
    const [selected, setSelected] = useState<string | null>(null)
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

    const { question, answer, wrongAnswers } = quiz

    useEffect(() => {
        const arr = [
            { text: answer, isCorrect: true },
            ...wrongAnswers.map((ans) => ({ text: ans, isCorrect: false })),
          ];
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
          setOptions(arr);
    }, [answer, wrongAnswers])

  


  function handleClick(option: { text: string; isCorrect: boolean }) {
    if (selected !== null) return;

    setSelected(option.text);
    setIsCorrect(option.isCorrect)
  }

  let cardClass = "p-6 max-w-xl mx-auto border-2 border-gray-300"

  if(isCorrect !== null) {
    cardClass = isCorrect?
    "p-6 max-w-xl mx-auto border-2 border-green-300":
    "p-6 max-w-xl mx-auto border-2 border-red-300"
  }

  return (
    <Card className={cardClass}>
      <h2 className="text-lg font-semibold mb-4">{question}</h2>
      <div className="flex flex-col space-y-3">
        {options.map((option) => {
            let variant: "default" | "outline" | "destructive" | "secondary" = "outline";

            if(selected !== null) {
                if(option.isCorrect) {
                    variant = "default"
                } else {

                }
                if(option.text == selected && !option.isCorrect) variant = "destructive"
            }

            return (
                <Button
                key={option.text}
                variant={variant}
                className={option.isCorrect && selected ? 'bg-green-600 hover:bg-green-700 text-white': ''}
                onClick={() => handleClick(option)}
                disabled={selected !== null}
                >
                    {option.text}
                </Button>
              )
        })}
      </div>
    </Card>
  );
}
