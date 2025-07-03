"use client"

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import React, { useState, useTransition, use, useEffect } from "react";
import server from '../../lib/axios'
import QuizDialog from "@/components/quiz/QuizDialog";
import { ContextMenu } from "@/components/ui/context-menu";
import Context from "@/components/layout/Context";

export default function Project(props: {params: Promise<{slug: string[]}>}) {
  const params = use(props.params);
  const [input, setInput] = useState('');
  const [summarizeOutput, setSummarizeOutput] = useState('');
  const [isPending, startTransition] = useTransition();
  const [ModalIsOpened, setModalIsOpened] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({x: 0, y: 0})
  const selectedTextRef = useRef("")

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const selection = window.getSelection();
      const selectedText = selection?.toString();

      if (selectedText && selectedText.trim() !== "") {
        selectedTextRef.current = selectedText;
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setShowMenu(true);
      } else {
        setShowMenu(false);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [])

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
      <main className="flex flex-col max-w-4xl w-full mx-auto p-4 space-y-4 max-h-[100vh]">
        
        <h1>{params.slug.map(e => decodeURIComponent(e)).join('/') + ''}</h1>
        <Textarea
          placeholder="Type here"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="resize-none min-h-[30%] max-h-[70vh] overflow-auto"
          />
        <div className="flex justify-end gap-[4px]  ">
          <Button onClick={handleSubmitSummarize} disabled={isPending}>
            Summarize
          </Button>
          <Button onClick={openModal} disabled={isPending}> {/* //alter error if there're no text */}
            Generate Quiz
          </Button>
        </div>
      </main>
      {/* alter add context menu */}

      </ContextMenu>
      <QuizDialog isOpen={ModalIsOpened} setIsOpen={setModalIsOpened}/>
    </>
  );
}
