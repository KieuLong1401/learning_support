"use client"

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import React, { useState, useTransition, use, useEffect, useRef } from "react";
import server from '../../lib/axios'
import QuizDialog from "@/components/quiz/QuizDialog";
import { sleep } from "@/lib/utils";

export default function Project(props: {params: Promise<{slug: string[]}>}) {
  const params = use(props.params);
  const [input, setInput] = useState('');
  const [summarizeOutput, setSummarizeOutput] = useState('');
  const [isPending, startTransition] = useTransition();
  const [ModalIsOpened, setModalIsOpened] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({x: 0, y: 0})
  const selectedTextRef = useRef("")
  const [textareaErr, setTextareaErr] = useState<string | null>(null)

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      const isFromTextarea = document.activeElement?.tagName == "TEXTAREA"

      if (selectedText && selectedText.trim() !== "" && selectedTextRef.current !== selectedText && isFromTextarea) {
        selectedTextRef.current = selectedText;
        setMenuPosition({ x: e.clientX, y: e.clientY + 20 });
        setShowMenu(true);
      } else {
        selectedTextRef.current = ''
        setShowMenu(false);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [showMenu])

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
  const openModal = () => {
    startTransition(async () => {
      if(input.trim() == '') {
        setTextareaErr('cannot generate quiz from empty text')
        return
      }
      try {
        setModalIsOpened(true) //alter make the modal open before await
        await sleep(3000)
      } catch (err) {
        setTextareaErr(err instanceof Error ? err.message : 'unknown error occurred')
      }
    })
  }

  return (
    <>
      <main className="flex flex-col max-w-4xl w-full mx-auto p-4 space-y-4 max-h-[100vh]">
        <h1>{params.slug.map(e => decodeURIComponent(e)).join('/') + ''}</h1>
        {textareaErr && (
          <p className="text-red-500">{textareaErr}</p>
        )}
        <Textarea
          placeholder="Type here"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            if(e.target.value.trim() != ''){
              setTextareaErr(null)
            }
          }}
          className="resize-none min-h-[30%] max-h-[70vh] overflow-auto"
          />
        <div className="flex justify-end gap-[4px]  ">
          <Button onClick={handleSubmitSummarize} disabled={isPending}>
            Summarize
          </Button>
          <Button onClick={openModal} disabled={isPending}>
            Generate Quiz
          </Button>
        </div>
      </main>
      {showMenu && (
        <div 
          className="absolute z-50 w-52 p-1 bg-white shadow-md border rounded-md animate-in fade-in" 
          style={{
            top: menuPosition.y,
            left: menuPosition.x
          }}
        >
          <Button className="w-full h-8 text-left justify-start rounded-sm" variant={"ghost"}>Get concept</Button>
        </div>
      )}
      <QuizDialog isOpen={ModalIsOpened} setIsOpen={setModalIsOpened}/>
    </>
  );
}
