import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Button } from '../ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { IProject } from '../layout/Sidebar'
import { IFlashCard } from './FlashCard'

export default function FlashCardModal({
	open,
	onOpenChange,
	projectData,
	setProjectData,
	title = '',
	content = '',
}: {
	open: boolean
	onOpenChange: Dispatch<SetStateAction<boolean>>
	projectData: IProject | undefined
	setProjectData: Dispatch<React.SetStateAction<IProject | undefined>>
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

	const handleCreate = () => {
		if (titleInput == '' || contentInput == '') {
			if (titleInput == '') setTitleError('Title can not be empty')
			if (contentInput == '') setContentError('Content can not be empty')
			return
		}

		const isDuplicated = projectData?.flashCard.some((flashCard) => {
			const isSameName =
				flashCard.label.toLowerCase() == titleInput.toLocaleLowerCase()
			return isSameName
		})

		if (isDuplicated) {
			setTitleError('Duplicated title')
			return
		}

		setProjectData({
			...(projectData as IProject),
			flashCard: [
				{
					label: titleInput,
					content: contentInput,
				},
				...(projectData?.flashCard as IFlashCard[]),
			],
		})

		onOpenChange(false)
	}
	const handleModify = () => {
		if (titleInput == '' || contentInput == '') {
			if (titleInput == '') setTitleError('Title can not be empty')
			if (contentInput == '') setContentError('Content can not be empty')
			return
		}

		const currentFlashCards = projectData?.flashCard.filter(
			(e) => e.label != title
		)

		const isDuplicated = currentFlashCards?.some((flashCard) => {
			const isSameName =
				flashCard.label.toLowerCase() == titleInput.toLocaleLowerCase()
			return isSameName
		})

		if (isDuplicated) {
			setTitleError('Duplicated title')
			return
		}

		setProjectData({
			...(projectData as IProject),
			flashCard:
				projectData?.flashCard.map((flashCard) => {
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
					<DialogTitle>Create new flash card</DialogTitle>
					<DialogDescription>
						Create your new flash card
					</DialogDescription>
				</DialogHeader>
				<div className='flex flex-col gap-2 max-w-full'>
					{titleError && (
						<p className='text-red-500 text-sm ml-1'>
							{titleError}
						</p>
					)}
					<Input
						id='project-name'
						placeholder='Title'
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
						className='h-70 resize-none max-w-full break-words whitespace-pre-wrap'
						placeholder='Content'
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
						Cancel
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
						{isModify ? 'Modify' : 'Create'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
