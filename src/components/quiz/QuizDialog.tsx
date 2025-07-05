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
import { sleep } from '@/lib/utils'
import { Slider } from '../ui/slider'
import MCQQuiz from './MCQQuiz'

const mockMCQRes = [
	{
		question_statement: '1which one is the right answer?',
		answer: 'right answer',
		options: ['wrong answer 1', 'wrong answer 2', 'wrong answer 3'],
		context: 'this is the context',
	},
	{
		question_statement: '2which one is the right answer?',
		answer: 'right answer',
		options: ['wrong answer 1', 'wrong answer 2', 'wrong answer 3'],
		context: 'this is the context',
	},
	{
		question_statement: '3which one is the right answer?',
		answer: 'right answer',
		options: ['wrong answer 1', 'wrong answer 2', 'wrong answer 3'],
		context: 'this is the context',
	},
	{
		question_statement: '4which one is the right answer?',
		answer: 'right answer',
		options: ['wrong answer 1', 'wrong answer 2', 'wrong answer 3'],
		context: 'this is the context',
	},
]

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
	const [tfCount, setTfCount] = useState([0])
	const [error, setError] = useState<string | null>(null)
	const [showQuiz, setShowQuiz] = useState<boolean>(false)

	useEffect(() => {
		if (!isOpen) {
			setShowQuiz(false)
			setError(null)
			setMcqCount([0])
			setTfCount([0])
			return
		}

		if (showQuiz) {
			startTransition(async () => {
				try {
					//alter get questions
					// const res = await server.post('/question', { input_text: input, max_question: 4 });
					// setQuizGenerateOutput(res.data.question || 'No result');
					await sleep(10000)
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
					//alter get max count of each question
					await sleep(1000)
				} catch (err) {
					setError(
						err instanceof Error
							? err.message
							: 'unknown error occurred'
					)
				}
			})
		}
	}, [isOpen, showQuiz])

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
							: mockMCQRes.map((mcqQuiz, i) => {
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
								<span>{`${mcqCount}/10`}</span>{' '}
								{/* alter turn into api response */}
							</div>
							{isPending ? (
								<Skeleton className='h-10 w-full rounded-md bg-gray-200'></Skeleton>
							) : (
								<Slider
									value={mcqCount}
									max={10} //alter turn into api response
									min={0}
									onValueChange={(value) =>
										setMcqCount(value)
									}
								/>
							)}
						</div>
						<div>
							<div className='flex justify-between items-centers'>
								<label className='block text-sm font-medium mb-1'>
									True/False Count
								</label>
								<span>{`${tfCount}/10`}</span>{' '}
								{/* alter turn into api response */}
							</div>
							{isPending ? (
								<Skeleton className='h-10 w-full rounded-md bg-gray-200'></Skeleton>
							) : (
								<div>
									<Slider
										value={tfCount}
										max={10} //alter turn into api response
										min={0}
										onValueChange={(value) =>
											setTfCount(value)
										}
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
			)}
		</Dialog>
	)
}
