'use client'

import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import Folder from './Folder'
import Document from './Document'
import { usePathname, useRouter } from 'next/navigation'
import { IFlashCard } from '../flashCard/FlashCard'
import { Ellipsis, File, Folders, Pyramid } from 'lucide-react'

export interface IDocument {
	name: string
	folder: string | null
	text: string
	flashCard: IFlashCard[]
}

export default function Sidebar() {
	const [documents, setDocuments] = useState<IDocument[]>([])
	const [folders, setFolders] = useState<string[]>([])
	const [addModalOpen, setAddModalOpen] = useState(false)
	const [parentFolder, setParentFolder] = useState<string | null>(null)
	const [newName, setNewName] = useState('')
	const [newType, setNewType] = useState<'folder' | 'document'>('document')
	const [nameInputErr, setNameInputErr] = useState<string | null>(null)
	const [deletePath, setDeletePath] = useState<string[]>([])

	const router = useRouter()
	const pathName = usePathname()

	useEffect(() => {
		const documentsData = getNewestDocumentData()
		if (documentsData) {
			setDocuments(documentsData)
		}

		const foldersData = getNewestFolderData()
		if (foldersData) {
			setFolders(foldersData)
		}
	}, [])
	useEffect(() => {
		localStorage.setItem(
			process.env.NEXT_PUBLIC_LOCAL_STORAGE_DOCUMENTS || 'my_documents',
			JSON.stringify(documents)
		)
	}, [documents])
	useEffect(() => {
		localStorage.setItem(
			process.env.NEXT_PUBLIC_LOCAL_STORAGE_FOLDERS || 'my_folders',
			JSON.stringify(folders)
		)
	}, [folders])

	useEffect(() => {
		if (addModalOpen) return
		setNewName('')
		setNameInputErr(null)
		setParentFolder(null)
		setNewType('document')
	}, [addModalOpen])

	useEffect(() => {
		if (deletePath.length === 0) return

		if (deletePath.some((deleted) => deleted === pathName)) {
			router.push('/')
		}
		setDeletePath([])
	}, [deletePath, pathName, router])

	function getNewestDocumentData() {
		const rawData = localStorage.getItem(
			process.env.NEXT_PUBLIC_LOCAL_STORAGE_DOCUMENTS || 'my_documents'
		)
		if (!rawData) return null
		return JSON.parse(rawData)
	}
	function getNewestFolderData() {
		const rawData = localStorage.getItem(
			process.env.NEXT_PUBLIC_LOCAL_STORAGE_FOLDERS || 'my_folders'
		)
		if (!rawData) return null
		return JSON.parse(rawData)
	}

	function openDocumentCreateModal(folder: string | null) {
		setParentFolder(folder)
		setNewType('document')
		setAddModalOpen(true)
	}
	function openFolderCreateModal() {
		setParentFolder(null)
		setNewType('folder')
		setAddModalOpen(true)
	}

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
			return
		}

		setDocuments([
			...newestDocumentData,
			{
				name: name,
				folder: parentFolder,
				text: '',
				flashCard: [],
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
			return
		}

		setFolders([...newestFolderData, name])
	}
	function handleAddSubmit() {
		const name = newName.trim()

		if (!name) {
			setNameInputErr('Please use a valid name')
			return
		}

		if (newType == 'document') {
			createDocument(name)
		} else {
			createFolder(name)
		}

		setAddModalOpen(false)
	}

	function deleteDocument(folder: string | null, name: string) {
		setDeletePath([`/${folder ? folder + '/' : ''}${name}`])
		const newestDocumentData = getNewestDocumentData()
		if (!newestDocumentData) return

		const newDocuments = newestDocumentData.filter(
			(document: IDocument) => {
				const isSameName =
					document.name.toLowerCase() == name.toLowerCase()
				const isSameFolder = document.folder == folder

				return !(isSameName && isSameFolder)
			}
		)

		setDocuments(newDocuments)
	}
	function deleteFolder(name: string) {
		const newestFolderData = getNewestFolderData()
		const newestDocumentData = getNewestDocumentData()
		if (!newestFolderData || !newestDocumentData) return

		const deletePaths = newestDocumentData
			.filter((document: IDocument) => document.folder === name)
			.map((document: IDocument) => `/${name}/${document.name}`)
		setDeletePath(deletePaths ? deletePaths : [])

		const newFolders = newestFolderData.filter((folder: string) => {
			return folder !== name
		})
		setFolders(newFolders)

		const newDocuments = newestDocumentData.filter(
			(document: IDocument) => {
				return document.folder != name
			}
		)
		setDocuments(newDocuments)
	}

	return (
		<>
			<div className='min-w-60 text-black h-screen p-2 overflow-auto space-y-1 border-r border-r-1 border-r-gray-200'>
				<h2 className='text-lg font-bold px-4 py-2 flex justify-between items-center'>
					<div className='flex flex-row items-center gap-2'>
						<Pyramid />
						<span>name</span>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								size='sm'
								variant={'ghost'}
							>
								<Ellipsis />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem
								onClick={() => openDocumentCreateModal(null)}
							>
								<File /> New Document
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => openFolderCreateModal()}
							>
								<Folders /> New Folder
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</h2>
				{folders.map((folder: string) => {
					return (
						<Folder
							name={folder}
							folder_children={documents.filter(
								(document: IDocument) =>
									document.folder == folder
							)}
							handleDelete={deleteFolder}
							handleDeleteDocument={deleteDocument}
							handleCreateDocument={openDocumentCreateModal}
							key={'folder-' + folder}
						/>
					)
				})}
				{documents
					.filter((document) => document.folder === null)
					.map((document) => {
						return (
							<Document
								key={'document-' + document.name}
								name={document.name}
								handleDelete={deleteDocument}
							/>
						)
					})}
			</div>

			<Dialog
				open={addModalOpen}
				onOpenChange={setAddModalOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create new {newType}</DialogTitle>
						<DialogDescription>
							Name your new {newType}
						</DialogDescription>
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
						<Button onClick={handleAddSubmit}>Create</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
