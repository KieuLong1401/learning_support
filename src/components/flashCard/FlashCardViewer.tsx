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
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../ui/drawer'

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
		<Drawer
			open={open}
			onOpenChange={onOpenChange}
		>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>플래시카드</DrawerTitle>
				</DrawerHeader>
				<div className='px-30 pb-20 max-h-[80vh] h-[80vh] flex items-center justify-center'>
					<Carousel className='max-w-100'>
						<CarouselContent>
							{flashCardData.map((flashCard, i) => {
								return (
									<CarouselItem key={i}>
										<FlashCardTwoSide
											flashCard={flashCard}
										/>
									</CarouselItem>
								)
							})}
						</CarouselContent>
						<CarouselPrevious />
						<CarouselNext />
					</Carousel>
				</div>
			</DrawerContent>
		</Drawer>
	)
}
