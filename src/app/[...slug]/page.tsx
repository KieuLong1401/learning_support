'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import QuizDialog from '@/components/quiz/QuizDialog'
import { IProject } from '@/components/layout/Sidebar'

const localStorageProjects = 'my_projects'

export default function Project(props: {
	params: Promise<{ slug: string[] }>
}) {
	const [slug, setSlug] = useState<string[]>([])
	const [projectData, setProjectData] = useState<IProject>()

	const [textareaErr, setTextareaErr] = useState<string | null>(null)

	const [modalOpen, setModalOpen] = useState(false)
	const [showConcept, setShowConcept] = useState<boolean>(false)

	const [showContextMenu, setShowContextMenu] = useState(false)
	const [contextMenuPosition, setContextMenuPosition] = useState({
		x: 0,
		y: 0,
	})
	const [concept, setConcept] = useState('')

	const selectedTextRef = useRef('')
	const contextMenuRef = useRef<HTMLDivElement | null>(null)

	// get slug
	useEffect(() => {
		props.params.then((res) => {
			setSlug(res.slug)
		})
	}, [props])

	// get data
	useEffect(() => {
		const rawData = localStorage.getItem(localStorageProjects)
		if (!rawData || slug.length == 0) return

		const projects = JSON.parse(rawData)
		const folderName = slug.length == 2 ? slug[0] : null
		const projectName = slug.length == 2 ? slug[1] : slug[0]

		const currentProjectData = projects.find((project: IProject) => {
			const isSameName =
				project.name.toLowerCase() == projectName.toLowerCase()
			const isSameFolder = project.folder == folderName

			return isSameName && isSameFolder
		})
		setProjectData(currentProjectData)
	}, [slug])
	// update data
	useEffect(() => {
		const rawData = localStorage.getItem(localStorageProjects)
		if (!rawData || slug.length == 0 || projectData == null) return

		const oldData = JSON.parse(rawData)
		const folderName = slug.length == 2 ? slug[0] : null
		const projectName = slug.length == 2 ? slug[1] : slug[0]

		const updatedData = oldData.map((project: IProject) => {
			const isSameName =
				project.name.toLowerCase() == projectName.toLowerCase()
			const isSameFolder = project.folder == folderName

			if (isSameName && isSameFolder) {
				return projectData
			}
			return project
		})

		localStorage.setItem(localStorageProjects, JSON.stringify(updatedData))
	}, [projectData, slug])

	// text selection and menu position
	useEffect(() => {
		const handleSelectionChange = () => {
			const selection = window.getSelection()
			const selectedText = selection?.toString().trim() ?? ''
			const isFromTextarea =
				document.activeElement?.tagName === 'TEXTAREA'

			if (selectedText && isFromTextarea) {
				selectedTextRef.current = selectedText
			} else {
				if (showConcept) return
				selectedTextRef.current = ''
				setShowContextMenu(false)
				setShowConcept(false)
				setConcept('')
			}
		}

		const handleMouseUp = (e: MouseEvent) => {
			const selectedText = selectedTextRef.current
			const isFromTextarea =
				document.activeElement?.tagName === 'TEXTAREA'

			if (selectedText && isFromTextarea) {
				setContextMenuPosition({
					x: Math.min(e.clientX, window.innerWidth - 230),
					y: e.clientY + 15,
				})
				setShowContextMenu(true)
			}
		}

		const handleClickOutside = (e: MouseEvent) => {
			if (
				contextMenuRef.current &&
				!contextMenuRef.current.contains(e.target as Node)
			) {
				setShowConcept(false)
				setShowContextMenu(false)
			}
		}

		document.addEventListener('selectionchange', handleSelectionChange)
		document.addEventListener('mouseup', handleMouseUp)
		document.addEventListener('mousedown', handleClickOutside)

		return () => {
			document.removeEventListener(
				'selectionchange',
				handleSelectionChange
			)
			document.removeEventListener('mouseup', handleMouseUp)
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [showConcept])

	// fetching concept
	useEffect(() => {
		if (!showConcept) return
		// to api
		const eventSource = new EventSource(
			process.env.NEXT_PUBLIC_SERVER_HOST +
				`explain_stream?word=${selectedTextRef.current}`
		)

		eventSource.onmessage = (event) => {
			const data = event.data
			setConcept((prev) => prev + data)
		}
		eventSource.onerror = () => {
			eventSource.close()
		}

		return () => {
			eventSource.close()
		}
	}, [showConcept])

	// prevent concept box from going off-screen
	useEffect(() => {
		if (!showConcept) return
		setContextMenuPosition({
			...contextMenuPosition,
			x: Math.min(contextMenuPosition.x, window.innerWidth - 410),
		})
	}, [showConcept])

	//alter fix handleSubmit method for real api
	const openModal = () => {
		if ((projectData?.text || '').trim() == '') {
			setTextareaErr('cannot generate quiz from an empty text')
			return
		}
		setModalOpen(true)
	}

	return (
		<>
			<main className='flex flex-col max-w-4xl flex-1 overflow-auto mx-auto p-4 space-y-4 max-h-[100vh]'>
				<h1 className='text-xl'>
					{slug.map((e) => decodeURIComponent(e)).join('/')}
				</h1>

				{textareaErr && <p className='text-red-500'>{textareaErr}</p>}

				<Textarea
					placeholder='Type here'
					value={projectData?.text || ''}
					onChange={(e) => {
						setProjectData({
							...(projectData as IProject),
							text: e.target.value,
						})
						if (e.target.value.trim() != '') {
							setTextareaErr(null)
						}
					}}
					className='resize-none min-h-[30%] max-h-[70vh] overflow-auto'
				/>

				<Button
					onClick={openModal}
					className='w-40 ml-auto'
				>
					Generate Quiz
				</Button>
			</main>

			{showContextMenu && (
				<div
					ref={contextMenuRef}
					className='absolute z-50 max-w-100 p-1 bg-white shadow-md border rounded-md animate-in fade-in'
					style={{
						top: contextMenuPosition.y,
						left: contextMenuPosition.x,
					}}
				>
					{showConcept ? (
						<div className='px-4 py-2'>
							<h1 className='mb-2 text-lg'>
								{selectedTextRef.current}
							</h1>
							{concept == '' ? (
								<Skeleton className='h-50 w-90 rounded-md bg-gray-200' />
							) : (
								<p className='break-words whitespace-normal'>
									{concept}
								</p>
							)}
						</div>
					) : (
						<Button
							onClick={() => setShowConcept(true)}
							variant={'ghost'}
							className='w-52 h-8 text-left justify-start rounded-sm'
						>
							Get concept
						</Button>
					)}
				</div>
			)}
			<QuizDialog
				isOpen={modalOpen}
				setIsOpen={setModalOpen}
				text={projectData?.text || ''}
			/>
		</>
	)
}
