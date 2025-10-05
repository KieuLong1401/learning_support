import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { IDocument } from '../layout/Sidebar'
import { IFlashCard } from './FlashCard'

export default function FlashCardModal({
	open,
	onOpenChange,
	documentData,
	setDocumentData,
	title = '',
	content = '',
}: {
	open: boolean
	onOpenChange: Dispatch<SetStateAction<boolean>>
	documentData: IDocument | undefined
	setDocumentData: Dispatch<React.SetStateAction<IDocument | undefined>>
	title?: string
	content?: string
}) {
	const [titleInput, setTitleInput] = useState(title)
	const [contentInput, setContentInput] = useState(content)
	const [titleError, setTitleError] = useState<string | null>(null)
	const [contentError, setContentError] = useState<string | null>(null)

	const isModify = title !== '' && content !== ''

	useEffect(() => {
		setTitleInput(title)
		setContentInput(content)
		setTitleError(null)
		setContentError(null)
	}, [open, title, content])

	function handleCreate() {
		if (titleInput == '' || contentInput == '') {
			if (titleInput == '') setTitleError('제목은 비워둘 수 없습니다')
			if (contentInput == '')
				setContentError('콘텐츠는 비워둘 수 없습니다')
			return
		}

		const isDuplicated = documentData?.flashCard.some((flashCard) => {
			const isSameName =
				flashCard.label.toLowerCase() == titleInput.toLocaleLowerCase()
			return isSameName
		})

		if (isDuplicated) {
			setTitleError('중복된 제목입니다')
			return
		}

		setDocumentData({
			...(documentData as IDocument),
			flashCard: [
				{
					label: titleInput,
					content: contentInput,
				},
				...(documentData?.flashCard as IFlashCard[]),
			],
		})

		onOpenChange(false)
	}
	function handleModify() {
		if (titleInput == '' || contentInput == '') {
			if (titleInput == '') setTitleError('제목은 비워둘 수 없습니다')
			if (contentInput == '')
				setContentError('콘텐츠는 비워둘 수 없습니다')
			return
		}

		const currentFlashCards = documentData?.flashCard.filter(
			(e) => e.label != title
		)

		const isDuplicated = currentFlashCards?.some((flashCard) => {
			const isSameName =
				flashCard.label.toLowerCase() == titleInput.toLocaleLowerCase()
			return isSameName
		})

		if (isDuplicated) {
			setTitleError('중복된 제목입니다')
			return
		}

		setDocumentData({
			...(documentData as IDocument),
			flashCard:
				documentData?.flashCard.map((flashCard) => {
					if (flashCard.label == title) {
						return {
							label: titleInput,
							content: contentInput,
						}
					}

					return flashCard
				}) || [],
		})

		onOpenChange(false)
	}

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{isModify ? '플래시카드 수정' : '플래시카드 추가'}
					</DialogTitle>
				</DialogHeader>
				<div className='flex flex-col gap-2 max-w-fulls overflow-hidden p-1'>
					{titleError && (
						<p className='text-red-500 text-sm ml-1'>
							{titleError}
						</p>
					)}
					<Input
						id='document-name'
						placeholder='제목'
						value={titleInput}
						onChange={(e) => {
							setTitleError(null)
							setTitleInput(e.target.value)
						}}
					/>
					{contentError && (
						<p className='text-red-500 text-sm ml-1'>
							{contentError}
						</p>
					)}
					<Textarea
						className='resize-none max-h-70 h-70 w-full overflow-auto break-words whitespace-pre-wrap'
						placeholder='콘텐츠'
						value={contentInput}
						onChange={(e) => {
							setContentError(null)
							setContentInput(e.target.value)
						}}
					/>
				</div>
				<div className='flex justify-end space-x-2'>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}
					>
						취소
					</Button>
					<Button
						onClick={() => {
							if (isModify) {
								handleModify()
							} else {
								handleCreate()
							}
						}}
					>
						{isModify ? '수정' : '추가'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
