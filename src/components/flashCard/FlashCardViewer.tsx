import { Dispatch, SetStateAction } from 'react'
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '../ui/carousel'
import { IFlashCard } from './FlashCard'
import FlashCardTwoSide from './FlashCardTwoSide'

export default function FlashCardViewer({
	open,
	flashCardData,
	onOpenChange,
}: {
	open: boolean
	flashCardData: IFlashCard[]
	onOpenChange: Dispatch<SetStateAction<boolean>>
}) {
	return (
		<Carousel>
			<CarouselContent>
				{flashCardData.map((flashCard, i) => {
					return (
						<CarouselItem key={i}>
							<FlashCardTwoSide flashCard={flashCard} />
						</CarouselItem>
					)
				})}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	)
}
