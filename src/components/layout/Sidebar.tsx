'use client'

import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'
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
import DocumentModal from './DocumentModal'
import Link from 'next/link'

export interface IDocument {
	name: string
	folder: string | null
	text: string
	flashCard: IFlashCard[]
	highlight: [number, number][]
}

export default function Sidebar() {
	const [documents, setDocuments] = useState<IDocument[]>([])
	const [folders, setFolders] = useState<string[]>([])
	const [addModalOpen, setAddModalOpen] = useState(false)
	const [parentFolder, setParentFolder] = useState<string | null>(null)
	const [newType, setNewType] = useState<'folder' | 'document'>('document')
	const [deletePath, setDeletePath] = useState<string[]>([])
	const [isScrolled, setIsScrolled] = useState(false)

	const scrollRef = useRef<HTMLDivElement>(null)

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
		const handleScroll = () => {
			if (scrollRef.current) {
				setIsScrolled(scrollRef.current.scrollTop > 0)
			}
		}

		const current = scrollRef.current
		if (current) {
			current.addEventListener('scroll', handleScroll)
		}

		return () => {
			if (current) {
				current.removeEventListener('scroll', handleScroll)
			}
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
		if (deletePath.length === 0) return

		if (
			deletePath.some(
				(deleted) => deleted === decodeURIComponent(pathName)
			)
		) {
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
			<div className='flex flex-col min-w-60 text-black h-screen p-2 overflow-hidden space-y-1 border-r border-r-2 border-r-gray-300'>
				<h2
					className={`px-2 py-2 flex justify-between items-center mb-2 ${
						isScrolled
							? 'shadow-[0_4px_4px_-2px_rgba(0,0,0,0.1)]'
							: ''
					}`}
				>
					<Link
						href={'/'}
						className='flex flex-row items-center gap-2'
					>
						<Pyramid />
						<span className='text-xl font-bold mb-1'>Aether</span>
					</Link>
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
								<File /> 문서 생성
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => openFolderCreateModal()}
							>
								<Folders /> 폴더 생성
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</h2>
				<div
					className='overflow-auto h-full'
					ref={scrollRef}
				>
					{folders.map((folder: string) => {
						return (
							<Folder
								key={'folder-' + folder}
								name={folder}
								folder_children={documents.filter(
									(document: IDocument) =>
										document.folder == folder
								)}
								handleDelete={deleteFolder}
								handleDeleteDocument={deleteDocument}
								handleCreateDocument={openDocumentCreateModal}
								setDocuments={setDocuments}
								setFolders={setFolders}
								getNewestDocumentData={getNewestDocumentData}
								getNewestFolderData={getNewestFolderData}
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
									setDocuments={setDocuments}
									setFolders={setFolders}
									getNewestDocumentData={
										getNewestDocumentData
									}
									getNewestFolderData={getNewestFolderData}
								/>
							)
						})}
				</div>
			</div>

			<DocumentModal
				addModalOpen={addModalOpen}
				setAddModalOpen={setAddModalOpen}
				newType={newType}
				setDocuments={setDocuments}
				setFolders={setFolders}
				parentFolder={parentFolder}
				getNewestDocumentData={getNewestDocumentData}
				getNewestFolderData={getNewestFolderData}
			/>
		</>
	)
}
