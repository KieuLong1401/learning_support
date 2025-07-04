"use client"

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useTransition } from "react";
import server from '../../lib/axios'
import { Skeleton } from "@/components/ui/skeleton";
import MCQQuiz from "@/components/quiz/MCQQuiz";
import { usePathname } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";   // 📌 슬라이더 추가
import { Input } from "@/components/ui/input"; // 📌 Input 가져오기

export default function Project() {
  const pathname = usePathname();
  const slug = pathname.split('/').filter(Boolean);

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isPending, startTransition] = useTransition();
  const [copyText, setCopyText] = useState('복사');
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizCount, setQuizCount] = useState(1);       // 📌 문제 수 상태
  const [quizList, setQuizList] = useState<any[]>([]); // 📌 퀴즈 배열 상태

  const handleSummarize = () => {
    startTransition(async () => {
      try {
        const res = await server.post('/summarize', { text: input });
        setOutput(res.data.sumary || '결과 없음');
      } catch (err) {
        console.error(err);
        setOutput('오류 발생');
      }
    });
  };

  const handleSearch = () => {
    const query = encodeURIComponent(input.trim());
    if (!query) {
      alert("검색할 내용을 입력하세요.");
      return;
    }
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setInput(text);
      }
    };
    reader.readAsText(file);
  };

  const handleCopy = async () => {
    if (!output.trim()) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopyText('복사됨');
      setTimeout(() => setCopyText('복사'), 2000);
    } catch (err) {
      console.error('복사 실패', err);
    }
  };

  // 📌 퀴즈 문제 수만큼 mock 퀴즈 생성
  const handleMakeQuiz = () => {
    const newQuizList = Array.from({ length: quizCount }, (_, idx) => ({
      type: 'mcq',
      question: `${idx + 1}번 문제: 정답은 무엇일까요?`,
      answer: '정답',
      wrongAnswers: ['오답 1', '오답 2', '오답 3'],
    }));

    setQuizList(newQuizList);
    setIsQuizOpen(true);
  };

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-4">
      <h1>{slug.join(' / ')}</h1>

      {/* 입력창 */}
      <Textarea
        placeholder="여기에 내용을 입력하세요"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {/* 파일 업로드 */}
      <input 
        type="file"
        accept=".txt"
        onChange={handleFileUpload}
        className="block"
      />

      {/* 요약/검색 버튼 */}
      <div className="flex space-x-2">
        <Button onClick={handleSummarize} disabled={isPending}>
          요약하기
        </Button>
        <Button variant="secondary" onClick={handleSearch}>
          검색
        </Button>
      </div>

      {/* 결과 출력 */}
      {isPending ? (
        <Skeleton className="w-full h-[150px] rounded-md" />
      ) : (
        <div className="space-y-2">
          <Textarea
            placeholder="결과가 여기에 표시됩니다"
            value={output}
            readOnly
          />
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCopy}>
              {copyText}
            </Button>
          </div>
        </div>
      )}

      {/* 퀴즈 개수 슬라이더 */}
      <div className="space-y-2">
        <p>퀴즈 개수: {quizCount}개</p>
  
        <div className="flex items-center space-x-4">
          <Slider 
            value={[quizCount]}
            min={1}
            max={20}
            step={1}
            onValueChange={(value) => setQuizCount(value[0])}
            className="w-1/2"
          />
          <Input 
            type="number"
            min={1}
            max={20}
            value={quizCount}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 1 && val <= 20) {
                setQuizCount(val);
              }
            }}
            className="w-20"
          />
        </div>
      </div>

      {/* 퀴즈 만들기 버튼 */}
      <Button onClick={handleMakeQuiz}>
        퀴즈 만들기
      </Button>

      {/* 퀴즈 팝업 */}
      <Dialog open={isQuizOpen} onOpenChange={setIsQuizOpen}>
        <DialogContent className="max-w-lg space-y-4">
          <DialogHeader>
           <DialogTitle>퀴즈 ({quizCount}개)</DialogTitle>
          </DialogHeader>

          {/* 스크롤 가능한 영역 */}
          <div className="overflow-y-auto max-h-[500px] space-y-4 pr-2">
            {quizList.map((quiz, index) => (
              <MCQQuiz key={index} quiz={quiz} />
             ))}
          </div>

        </DialogContent>
      </Dialog>
    </main>
  )
}
