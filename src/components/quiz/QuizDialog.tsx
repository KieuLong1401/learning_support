import { use, useEffect, useState, useTransition } from 'react'
import { Button } from '../ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog'
import { Skeleton } from '../ui/skeleton'
import MCQQuiz from './MCQQuiz'
import server from '../../lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Progress, ProgressIndicator } from '@radix-ui/react-progress'

interface IMcqQuiz {
	answer: string
	context: string
	options: string[]
	question_statement: string
}

export default function QuizDialog({
	isOpen,
	setIsOpen,
	text,
}: {
	isOpen: boolean
	setIsOpen: (value: boolean) => void
	text: string
}) {
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)
	const [mcqData, setMcqData] = useState<IMcqQuiz[]>([])
	const [openResultPage, setOpenResultPage] = useState(false)
	const [correctCount, setCorrectCount] = useState(0)
	const [startTime, setStartTime] = useState<number | null>(null)

	useEffect(() => {
		if (!isOpen) {
			setError(null)
			setMcqData([])
			setOpenResultPage(false)
			setCorrectCount(0)
			setStartTime(null)
			return
		}
		startTransition(async () => {
			try {
				const res = await server.post('/generate-mcq', {
					input_text: text,
					max_questions: 10,
				})
				setMcqData(res.data)
				setStartTime(Date.now())
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: 'unknown error occurred'
				)
			}
		})
	}, [isOpen, text])

	useEffect(() => {
		if (openResultPage) return

		setStartTime(Date.now())
		setCorrectCount(0)
	}, [openResultPage])

	const addCorectCount = () => {
		setCorrectCount(pre => pre + 1)
	}
	const makeOtherQuizzes = () => {
		setOpenResultPage(false)
		startTransition(async () => {
			try {
				const res = await server.post('/generate-mcq', {
					input_text: text,
					max_questions: 10,
				})
				setMcqData(res.data)
				setStartTime(Date.now())
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: 'unknown error occurred'
				)
			}
		})
	}

	const progress = (correctCount / mcqData.length * 100) | 0
	var progressBarColor = 'bg-green-500'
	if (progress < 80) {
		progressBarColor = 'bg-yellow-300'
	} 
	if (progress < 50) {
		progressBarColor = 'bg-orange-400'
	} 
	if (progress < 30) {
		progressBarColor = 'bg-red-500'
	}

	const completedTime = startTime ? Date.now() - startTime : 0
	const completedMinutes = String(Math.floor(completedTime / 1000 / 60)).padStart(2, '0');
	const completedSeconds = String(Math.floor(completedTime / 1000 % 60)).padStart(2, '0');

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<DialogContent className='flex flex-col h-[95%]'>
				{
					openResultPage ?
					(
						<>
							<DialogHeader>
								<DialogTitle>Results</DialogTitle>
							</DialogHeader>
							<Card>
								<CardHeader>
									<CardTitle>
										Completed Time
									</CardTitle>
								</CardHeader>
								<CardContent>
									<span
										className='text-[60px] font-bold'
									>
										{`${completedMinutes}:${completedSeconds}`}
									</span>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>
										Correct Answer
									</CardTitle>
								</CardHeader>
								<CardContent>
									<span
										className='text-[60px] font-bold'
									>
										<span
											className='block mb-2 text-2xl, font-bold'
										>
											{`${correctCount} / ${mcqData.length}`}
										</span>
										<Progress className="ProgressRoot w-[100%] h-6 rounded-full overflow-hidden bg-gray-200" value={progress}>
											<ProgressIndicator
												className={`ProgressIndicator w-full h-full ${progressBarColor}`}
												style={{ transform: `translateX(-${100 - progress}%)` }}
											/>
										</Progress>
									</span>
								</CardContent>
							</Card>

							<div className='mt-auto flex flex-col gap-2'>
								<Button onClick={makeOtherQuizzes}>
									Other Quizzes
								</Button>
								<Button onClick={() => setOpenResultPage(false)}>
									Do These Quizzes Again
								</Button>
							</div>

						</>
					):
					(
						<>
							<DialogHeader>
								<DialogTitle>Quizzes</DialogTitle>
							</DialogHeader>
							<div className='overflow-auto flex flex-col gap-y-4 flex-1'>
								{isPending
									? 
									<Skeleton
										className='flex-1 w-full rounded-md bg-gray-200'
									/>
									: error ? 
										<span className='text-red-500'>{error}</span>
									: 
										mcqData.map((mcqQuiz, i) => {
												return (
													<MCQQuiz
														quiz={mcqQuiz}
														key={i}
														addCorectCount={addCorectCount}
													/>
												)
											})}
							</div>
							<Button onClick={() => setOpenResultPage(true)} disabled={isPending}>
								Finish
							</Button>
						</>
					)
				}

			</DialogContent>
		</Dialog>
	)
}
