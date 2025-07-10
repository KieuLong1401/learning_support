import { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { IFlashCard } from './FlashCard'

export default function FlashCardTwoSide({
	flashCard,
}: {
	flashCard: IFlashCard
}) {
	const [showContent, setShowContent] = useState(false)

	return (
		<Card className='border-2 border-black'>
			<CardContent onClick={() => setShowContent((pre) => !pre)}>
				{!showContent ? (
					<span className='h-100 w-80 flex justify-center items-center text-2xl font-bold pointer-event-none select-none'>
						{flashCard.label}
					</span>
				) : (
					<div className='text-lg h-100 w-80 overflow-auto select-none'>
						{flashCard.content}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
