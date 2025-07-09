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
		<Card>
			<CardContent onClick={() => setShowContent((pre) => !pre)}>
				{!showContent ? (
					<span className='h-100 flex justify-center items-center text-2xl font-bold pointer-event-none select-none'>
						{flashCard.label}
					</span>
				) : (
					<div className='text-lg h-100 overflow-auto select-none'>
						{flashCard.content}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
