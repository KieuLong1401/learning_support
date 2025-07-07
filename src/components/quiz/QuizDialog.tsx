import { useEffect, useState, useTransition } from 'react'
import { Button } from '../ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog'
import { Skeleton } from '../ui/skeleton'
import { Slider } from '../ui/slider'
import MCQQuiz from './MCQQuiz'
import server from '../../lib/axios'

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
	const [mcqCount, setMcqCount] = useState([0])
	const [maxMcq, setMaxMcq] = useState<number>(0)
	const [error, setError] = useState<string | null>(null)
	const [showQuiz, setShowQuiz] = useState<boolean>(false)
	const [mcqData, setMcqData] = useState<IMcqQuiz[]>([])

	useEffect(() => {
		if (!isOpen) {
			setShowQuiz(false)
			setError(null)
			setMcqCount([0])
			setMaxMcq(0)
			return
		}

		if (showQuiz) {
			startTransition(async () => {
				try {
					const res = await server.post('/generate-mcq', {
						input_text: text,
						max_questions: maxMcq,
					})
					setMcqData(res.data)
				} catch (err) {
					setError(
						err instanceof Error
							? err.message
							: 'unknown error occurred'
					)
				}
			})
		} else {
			startTransition(async () => {
				try {
					const res = await server.post('/valid_mcq_question_count', {
						input_text: text,
					})

					setMaxMcq(res.data.valid_mcq_question_count)
				} catch (err) {
					setError(
						err instanceof Error
							? err.message
							: 'unknown error occurred'
					)
				}
			})
		}
	}, [isOpen, showQuiz, text, maxMcq])

	const handleSubmitGenerateQuiz = () => {
		setShowQuiz(true)
	}

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			{showQuiz ? (
				<DialogContent className='flex flex-col h-[95%]'>
					<DialogHeader>
						<DialogTitle>Quizzes</DialogTitle>
						<DialogDescription>description</DialogDescription>
					</DialogHeader>
					<div className='overflow-auto flex flex-col gap-y-4 flex-1'>
						{isPending
							? Array(2)
									.fill(0)
									.map((e, i) => {
										return (
											<Skeleton
												key={i}
												className='h-[300px] w-full rounded-md bg-gray-200'
											/>
										)
									})
							: mcqData.map((mcqQuiz, i) => {
									return (
										<MCQQuiz
											quiz={mcqQuiz}
											key={i}
										/>
									)
							  })}
					</div>
					<Button onClick={() => setShowQuiz(false)}>Go Back</Button>
				</DialogContent>
			) : (
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Generate Quiz Custom</DialogTitle>
						<DialogDescription>{error}</DialogDescription>
					</DialogHeader>
					<div className='space-y-4 p-2'>
						<div>
							<div className='flex justify-between items-centers'>
								<label className='block text-sm font-medium mb-1'>
									MCQ Count
								</label>
								<span>{`${mcqCount}/${maxMcq}`}</span>{' '}
							</div>
							{isPending ? (
								<Skeleton className='h-10 w-full rounded-md bg-gray-200'></Skeleton>
							) : (
								<Slider
									value={mcqCount}
									max={maxMcq}
									min={0}
									onValueChange={(value) =>
										setMcqCount(value)
									}
								/>
							)}
						</div>
						<Button
							disabled={isPending}
							onClick={handleSubmitGenerateQuiz}
						>
							Generate Custom Quiz
						</Button>
					</div>
				</DialogContent>
			)}
		</Dialog>
	)
}
