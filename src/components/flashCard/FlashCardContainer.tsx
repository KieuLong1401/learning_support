import { Dispatch, useState } from 'react'
import { Button } from '../ui/button'
import FlashCardModal from './FlashCardModal'
import FlashCard, { IFlashCard } from './FlashCard'
import { IDocument } from '../layout/Sidebar'
import FlashCardViewer from './FlashCardViewer'
import { toast } from 'sonner'

export default function FlashCardContainer({
	flashCardData,
	documentData: documentData,
	setDocumentData: setDocumentData,
}: {
	flashCardData: IFlashCard[]
	documentData: IDocument | undefined
	setDocumentData: Dispatch<React.SetStateAction<IDocument | undefined>>
}) {
	const [openModal, setOpenModal] = useState(false)
	const [openShow, setOpenShow] = useState(false)

	return (
		<div className='flex flex-col flex-1 overflow-hidden'>
			<Button
				variant={'outline'}
				onClick={() => {
					if (flashCardData.length < 1) {
						toast('표시할 플래시카드가 없습니다')
						return
					}
					setOpenShow(true)
				}}
				className='mb-2'
			>
				플래시카드 보기
			</Button>
			<Button
				onClick={() => setOpenModal(true)}
				className='mb-4'
			>
				플래시카드 추가
			</Button>
			<div className='flex-1 overflow-auto'>
				<div className='grid gap-4 grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))]'>
					{flashCardData.map((e, i) => {
						return (
							<FlashCard
								key={i}
								data={e}
								documentData={documentData}
								setDocumentData={setDocumentData}
							/>
						)
					})}
				</div>
			</div>
			<FlashCardModal
				open={openModal}
				onOpenChange={setOpenModal}
				documentData={documentData}
				setDocumentData={setDocumentData}
			/>
			<FlashCardViewer
				open={openShow}
				onOpenChange={setOpenShow}
				flashCardData={flashCardData}
			/>
		</div>
	)
}
