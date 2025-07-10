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
import { Label } from '../ui/label'
import { IDocument } from './Sidebar'

export default function DocumentModal({
	addModalOpen,
	setAddModalOpen,
	newType,
	setDocuments,
	setFolders,
	parentFolder,
	getNewestDocumentData,
	getNewestFolderData,
	name = '',
}: {
	addModalOpen: boolean
	setAddModalOpen: Dispatch<SetStateAction<boolean>>
	newType: string
	setDocuments: Dispatch<SetStateAction<IDocument[]>>
	setFolders: Dispatch<SetStateAction<string[]>>
	parentFolder: string | null
	getNewestDocumentData: () => IDocument[]
	getNewestFolderData: () => string[]
	name?: string
}) {
	const [newName, setNewName] = useState(name)
	const [nameInputErr, setNameInputErr] = useState<string | null>(null)

	useEffect(() => {
		setNewName(name)
		setNameInputErr(null)
	}, [addModalOpen, name])

	function createDocument(name: string) {
		const newestDocumentData = getNewestDocumentData()
		if (!newestDocumentData) return

		const isDuplicated = newestDocumentData.some((document: IDocument) => {
			const isSameName = document.name.toLowerCase() == name.toLowerCase()
			const isSameFolder = document.folder == parentFolder

			return isSameName && isSameFolder
		})
		if (isDuplicated) {
			setNameInputErr(`This document is already exist`)
			return 'error'
		}

		setDocuments([
			...newestDocumentData,
			{
				name: name,
				folder: parentFolder,
				text: '',
				flashCard: [],
				highlight: [],
			},
		])
	}
	function createFolder(name: string) {
		const newestFolderData = getNewestFolderData()
		if (!newestFolderData) return

		const isDuplicated = newestFolderData.some((folder: string) => {
			const isSameName = folder.toLowerCase() == name.toLowerCase()

			return isSameName
		})
		if (isDuplicated) {
			setNameInputErr(`This folder is already exist`)
			return 'error'
		}

		setFolders([...newestFolderData, name])
	}

	function modifyDocument() {
		const newestDocumentData = getNewestDocumentData()
		if (!newestDocumentData) return

		const currentDocuments = newestDocumentData.filter(
			(e: IDocument) => e.name != name
		)

		const isDuplicated = currentDocuments.some((document: IDocument) => {
			const isSameName =
				document.name.toLowerCase() == newName.toLowerCase()
			const isSameFolder = document.folder == parentFolder

			return isSameName && isSameFolder
		})

		if (isDuplicated) {
			setNameInputErr(`This document is already exist`)
			return 'error'
		}

		setDocuments(
			newestDocumentData.map((document: IDocument) => {
				if (document.name == name) {
					return {
						...document,
						name: newName,
					}
				}

				return document
			})
		)
	}
	function modifyFolder() {
		const newestFolderData = getNewestFolderData()
		if (!newestFolderData) return
		const newestDocumentData = getNewestDocumentData()
		if (!newestDocumentData) return

		const currentFolder = newestFolderData.filter((e: string) => e != name)

		const isDuplicated = currentFolder.some(
			(folder: string) => folder == newName
		)

		if (isDuplicated) {
			setNameInputErr(`This folder is already exist`)
			return 'error'
		}

		setFolders(
			newestFolderData.map((folder: string) => {
				if (folder == name) {
					return newName
				}

				return folder
			})
		)
		setDocuments(
			newestDocumentData.map((document: IDocument) => {
				if (document.folder == name) {
					return {
						...document,
						folder: newName,
					}
				}
				return document
			})
		)
	}

	function handleAddSubmit() {
		const createName = newName.trim()

		if (!createName) {
			setNameInputErr('Please use a valid name')
			return
		}
		let error: string | undefined = undefined

		if (newType == 'document') {
			if (name == '') {
				error = createDocument(createName)
			} else {
				error = modifyDocument()
			}
		} else {
			if (name == '') {
				error = createFolder(createName)
			} else {
				error = modifyFolder()
			}
		}

		if (error) return
		setAddModalOpen(false)
	}

	return (
		<Dialog
			open={addModalOpen}
			onOpenChange={setAddModalOpen}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{`${
						name == '' ? 'Create new' : 'Rename your'
					} ${newType}`}</DialogTitle>
					<DialogDescription>description</DialogDescription>
				</DialogHeader>
				<div className='grid gap-2 py-4'>
					<div className='flex flex-col space-y-1'>
						<Label htmlFor='document-name'>Name</Label>
						{nameInputErr && (
							<p className='text-red-500'>{nameInputErr}</p>
						)}
						<p></p>
						<Input
							id='document-name'
							autoFocus
							value={newName}
							onChange={(e) => {
								setNewName(e.target.value)
								if (e.target.value.trim() != '') {
									setNameInputErr(null)
								}
							}}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault()
									handleAddSubmit()
								}
							}}
						/>
					</div>
				</div>
				<div className='flex justify-end space-x-2'>
					<Button
						variant='outline'
						onClick={() => setAddModalOpen(false)}
					>
						Cancel
					</Button>
					<Button onClick={handleAddSubmit}>
						{name == '' ? 'Create' : 'Rename'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
