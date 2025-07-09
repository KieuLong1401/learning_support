import { Dispatch, useState } from 'react'
import { IDocument } from '../layout/Sidebar'
import { Button } from '../ui/button'
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '../ui/card'
import FlashCardModal from './FlashCardModal'
import { Delete, DeleteIcon, Pencil, XIcon } from 'lucide-react'

export interface IFlashCard {
	label: string
	content: string
}

export default function FlashCard({
	data,
	documentData,
	setDocumentData,
}: {
	data: IFlashCard
	documentData: IDocument | undefined
	setDocumentData: Dispatch<React.SetStateAction<IDocument | undefined>>
}) {
	const [openModal, setOpenModal] = useState(false)

	const handleDelete = () => {
		setDocumentData({
			...(documentData as IDocument),
			flashCard:
				documentData?.flashCard.filter((e) => e.label != data.label) ||
				[],
		})
	}

	return (
		<>
			<Card className='h-80 px-6'>
				<CardHeader className='p-0'>
					<CardTitle className='font-bold text-2xl'>
						{data.label}
					</CardTitle>
					<CardAction>
						<Button
							variant={'outline'}
							onClick={() => setOpenModal(true)}
							className='mr-1'
						>
							<Pencil />
						</Button>
						<Button
							variant={'outline'}
							onClick={handleDelete}
							className='hover:bg-red-400 hover:text-white'
						>
							<XIcon />
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent className='text-lg w-full break-words whitespace-pre-wrap overflow-auto p-0'>
					{data.content}
				</CardContent>
			</Card>
			<FlashCardModal
				open={openModal}
				onOpenChange={setOpenModal}
				documentData={documentData}
				setDocumentData={setDocumentData}
				title={data.label}
				content={data.content}
			/>
		</>
	)
}
