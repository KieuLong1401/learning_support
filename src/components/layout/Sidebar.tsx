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
import Project from './Project'
import { usePathname, useRouter } from 'next/navigation'
import { IFlashCard } from '../flashCard/FlashCard'
import { Ellipsis, Pyramid } from 'lucide-react'

export interface IProject {
	name: string
	folder: string | null
	text: string
	flashCard: IFlashCard[]
}

export default function Sidebar() {
	const [projects, setProjects] = useState<IProject[]>([])
	const [folders, setFolders] = useState<string[]>([])
	const [addModalOpen, setAddModalOpen] = useState(false)
	const [addParents, setAddParents] = useState<string | null>(null)
	const [newName, setNewName] = useState('')
	const [newType, setNewType] = useState<'folder' | 'project'>('project')
	const [nameInputErr, setNameInputErr] = useState<string | null>(null)
	const [deletePath, setDeletePath] = useState<string[]>([])

	const router = useRouter()
	const pathName = usePathname()

	useEffect(() => {
		const projectsData = getNewestProjectData()
		if (projectsData) {
			setProjects(projectsData)
		}

		const foldersData = getNewestFolderData()
		if (foldersData) {
			setFolders(foldersData)
		}
	}, [])
	useEffect(() => {
		localStorage.setItem(
			process.env.NEXT_PUBLIC_LOCAL_STORAGE_PROJECTS || 'my_projects',
			JSON.stringify(projects)
		)
	}, [projects])
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
		setAddParents(null)
		setNewType('project')
	}, [addModalOpen])

	useEffect(() => {
		if (deletePath.length === 0) return

		if (deletePath.some((deleted) => deleted === pathName)) {
			router.push('/')
		}
		setDeletePath([])
	}, [deletePath, pathName, router])

	function getNewestProjectData() {
		const rawData = localStorage.getItem(
			process.env.NEXT_PUBLIC_LOCAL_STORAGE_PROJECTS || 'my_projects'
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

	function openProjectCreateModal(folder: string | null) {
		setAddParents(folder)
		setNewType('project')
		setAddModalOpen(true)
	}
	function openFolderCreateModal() {
		setAddParents(null)
		setNewType('folder')
		setAddModalOpen(true)
	}

	function createProject(name: string) {
		const newestProjectData = getNewestProjectData()
		if (!newestProjectData) return

		const isDuplicated = newestProjectData.some((project: IProject) => {
			const isSameName = project.name.toLowerCase() == name.toLowerCase()
			const isSameFolder = project.folder == addParents

			return isSameName && isSameFolder
		})
		if (isDuplicated) {
			setNameInputErr(`This project is already exist`)
			return
		}

		setProjects([
			...newestProjectData,
			{
				name: name,
				folder: addParents,
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

		if (newType == 'project') {
			createProject(name)
		} else {
			createFolder(name)
		}

		setAddModalOpen(false)
	}

	function deleteProject(folder: string | null, name: string) {
		setDeletePath([`/${folder ? folder + '/' : ''}${name}`])
		const newestProjectData = getNewestProjectData()
		if (!newestProjectData) return

		const newProjects = newestProjectData.filter((project: IProject) => {
			const isSameName = project.name.toLowerCase() == name.toLowerCase()
			const isSameFolder = project.folder == folder

			return !(isSameName && isSameFolder)
		})

		setProjects(newProjects)
	}
	function deleteFolder(name: string) {
		const newestFolderData = getNewestFolderData()
		const newestProjectData = getNewestProjectData()
		if (!newestFolderData || !newestProjectData) return

		const deletePaths = newestProjectData
			.filter((project: IProject) => project.folder === name)
			.map((project: IProject) => `/${name}/${project.name}`)
		setDeletePath(deletePaths ? deletePaths : [])

		const newFolders = newestFolderData.filter((folder: string) => {
			return folder !== name
		})
		setFolders(newFolders)

		const newProjects = newestProjectData.filter((project: IProject) => {
			return project.folder != name
		})
		setProjects(newProjects)
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
								onClick={() => openProjectCreateModal(null)}
							>
								📄 New Project
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => openFolderCreateModal()}
							>
								📁 New Folder
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</h2>
				{folders.map((folder: string) => {
					return (
						<Folder
							name={folder}
							folder_children={projects.filter(
								(project: IProject) => project.folder == folder
							)}
							handleDelete={deleteFolder}
							handleDeleteProject={deleteProject}
							handleCreateProject={openProjectCreateModal}
							key={'folder-' + folder}
						/>
					)
				})}
				{projects
					.filter((project) => project.folder === null)
					.map((project) => {
						return (
							<Project
								key={'project-' + project.name}
								name={project.name}
								handleDelete={deleteProject}
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
							<Label htmlFor='project-name'>Name</Label>
							{nameInputErr && (
								<p className='text-red-500'>{nameInputErr}</p>
							)}
							<p></p>
							<Input
								id='project-name'
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
