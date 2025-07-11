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
	const [error, setError] = useState<string | null>(null)
	const [mcqData, setMcqData] = useState<IMcqQuiz[]>([])

	useEffect(() => {
		if (!isOpen) {
			setError(null)
			setMcqData([])
			return
		}
		startTransition(async () => {
			try {
				const res = await server.post('/generate-mcq', {
					input_text: text,
					max_questions: 10,
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
	}, [isOpen, text])

	return (
		<Dialog
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<DialogContent className='flex flex-col h-[95%]'>
				<DialogHeader>
					<DialogTitle>Quizzes</DialogTitle>
					<DialogDescription>description</DialogDescription>
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
										/>
									)
								})}
				</div>
			</DialogContent>
		</Dialog>
	)
}
