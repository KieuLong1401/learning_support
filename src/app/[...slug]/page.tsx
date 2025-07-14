'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { RectangleVertical, Search } from 'lucide-react'
import QuizDialog from '@/components/quiz/QuizDialog'

import { IDocument } from '@/components/layout/Sidebar'

import mammoth from 'mammoth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FlashCardContainer from '@/components/flashCard/FlashCardContainer'
import { IFlashCard } from '@/components/flashCard/FlashCard'
import { toast } from 'sonner'

import JSZip from 'jszip'
import { parseStringPromise } from 'xml2js'

export default function Document(props: {
	params: Promise<{ slug: string[] }>
}) {
	const [slug, setSlug] = useState<string[]>([])
	const [documentData, setDocumentData] = useState<IDocument>()

	const [textareaErr, setTextareaErr] = useState<string | null>(null)

	const [modalOpen, setModalOpen] = useState(false)
	const [showConcept, setShowConcept] = useState<boolean>(false)

	const [showContextMenu, setShowContextMenu] = useState(false)
	const [contextMenuPosition, setContextMenuPosition] = useState({
		x: 0,
		y: 0,
	})
	const [concept, setConcept] = useState('')
	const [isStreaming, setIsStreaming] = useState(false)

	const [draggingFile, setDraggingFile] = useState<boolean>(false)

	const selectedTextRef = useRef('')
	const contextMenuRef = useRef<HTMLDivElement | null>(null)
	const textareaRef = useRef<HTMLTextAreaElement | null>(null)
	const highlightRef = useRef<HTMLDivElement | null>(null)
	const selectedTextAreaRef = useRef({
		start: 0,
		end: 0,
	})
	const textPreValueRef = useRef('')

	// get slug
	useEffect(() => {
		props.params.then((res) => {
			setSlug(res.slug)
		})
	}, [props])
	// get data
	useEffect(() => {
		const rawData = localStorage.getItem(
			process.env.NEXT_PUBLIC_LOCAL_STORAGE_DOCUMENTS || 'my_documents'
		)
		if (!rawData || slug.length == 0) return

		const documents = JSON.parse(rawData)
		const folderName = slug.length == 2 ? slug[0] : null
		const documentName = slug.length == 2 ? slug[1] : slug[0]

		
		const currentDocumentData: IDocument = documents.find(
			(document: IDocument) => {
				const isSameName =
					document.name.toLowerCase() == decodeURIComponent(documentName).toLowerCase()
				const isSameFolder = document.folder == (folderName != null ? decodeURIComponent(folderName) : null)
				return isSameName && isSameFolder
			}
		)
		setDocumentData(currentDocumentData)
		textPreValueRef.current = currentDocumentData.text
	}, [slug])
	// update data
	useEffect(() => {
		const rawData = localStorage.getItem(
			process.env.NEXT_PUBLIC_LOCAL_STORAGE_DOCUMENTS || 'my_documents'
		)
		if (!rawData || slug.length == 0 || documentData == null) return

		const oldData = JSON.parse(rawData)
		const folderName = slug.length == 2 ? slug[0] : null
		const documentName = slug.length == 2 ? slug[1] : slug[0]

		const updatedData = oldData.map((document: IDocument) => {
			const isSameName =
				document.name.toLowerCase() == decodeURIComponent(documentName).toLowerCase()
			const isSameFolder = document.folder == (folderName != null ? decodeURIComponent(folderName) : null)

			if (isSameName && isSameFolder) {
				return documentData
			}
			return document
		})

		localStorage.setItem(
			process.env.NEXT_PUBLIC_LOCAL_STORAGE_DOCUMENTS || 'my_documents',
			JSON.stringify(updatedData)
		)
	}, [documentData, slug])

	useEffect(() => {
		syncScroll()
		if (!documentData?.text || !documentData.highlight) return
		if (documentData.text === textPreValueRef.current) return

		const maxLen = documentData.text.length

		let changeIndex = -1
		while (
			changeIndex < documentData.text.length &&
			changeIndex < textPreValueRef.current.length &&
			documentData.text[changeIndex] ===
				textPreValueRef.current[changeIndex]
		) {
			changeIndex++
		}
		const addedLength =
			documentData.text.length - textPreValueRef.current.length

		const newHighlight: [number, number][] = documentData.highlight.map(
			([start, end]) => {
				const newEnd = Math.min(end, maxLen)
				if (newEnd - start <= 0) return [0, 0]
				if (changeIndex <= start) {
					return [start + addedLength, newEnd + addedLength]
				}
				if (changeIndex > start && changeIndex < newEnd) {
					return [start, newEnd + addedLength]
				}

				return [start, newEnd]
			}
		)

		textPreValueRef.current = documentData.text
		if (
			JSON.stringify(newHighlight) ==
			JSON.stringify(documentData.highlight)
		) {
			return
		}

		setDocumentData({
			...documentData,
			highlight: newHighlight,
		})
	}, [documentData])

	// reset context menu state
	useEffect(() => {
		setShowConcept(false)
		setConcept('')
	}, [showContextMenu])
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
			const activeElement = document.activeElement as HTMLTextAreaElement

			const selectedText = selectedTextRef.current
			const isFromTextarea =
				document.activeElement?.tagName === 'TEXTAREA'

			if (selectedText && isFromTextarea) {
				selectedTextAreaRef.current = {
					start: activeElement.selectionStart,
					end: activeElement.selectionEnd,
				}

				setContextMenuPosition({
					x: Math.min(e.clientX, window.innerWidth - 230),
					y: e.clientY + 20,
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
		setIsStreaming(true)

		const eventSource = new EventSource(
			process.env.NEXT_PUBLIC_SERVER_HOST +
				`explain_stream?word=${selectedTextRef.current}`
		)

		eventSource.onmessage = (event) => {
			const data = event.data
			if (data == '[DONE]') {
				setIsStreaming(false)
			} else {
				setConcept((prev) => prev + data)
			}
		}
		eventSource.onerror = () => {
			eventSource.close()
			setIsStreaming(false)
		}

		return () => {
			eventSource.close()
			setIsStreaming(false)
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

	const openModal = () => {
		if ((documentData?.text || '').trim() == '') {
			setTextareaErr('cannot generate quiz from an empty text')
			return
		}
		setModalOpen(true)
	}

	const extractTextFromDocx = async (file: File): Promise<string> => {
		const arrayBuffer = await file.arrayBuffer()
		const result = await mammoth.extractRawText({ arrayBuffer })
		return result.value
	}
	const extractTextFromHwpx = async (
		file: File
	): Promise<string | undefined> => {
		const arrayBuffer = await file.arrayBuffer()
		const zip = await JSZip.loadAsync(arrayBuffer)

		const xmlFile = zip.file('Contents/section0.xml')
		if (!xmlFile) {
			return
		}

		const xmlContent = await xmlFile.async('text')
		const json = await parseStringPromise(xmlContent)

		const sectionKey = Object.keys(json).find((k) => k.endsWith('sec'))
		const section = json[sectionKey || ''] || {}

		const paragraphKey = Object.keys(section).find((k) => k.endsWith(':p'))
		const paragraphs = section[paragraphKey || ''] || []

		let fullText = ''
		for (const para of paragraphs) {
			const runKey = Object.keys(para).find((k) => k.endsWith(':run'))
			const runs = para[runKey || ''] || []

			for (const r of runs) {
				const textKey = Object.keys(r).find((k) => k.endsWith(':t'))
				const textArray = r[textKey || '']
				if (Array.isArray(textArray)) {
					fullText += textArray[0]
				}
			}

			fullText += '\n'
		}

		return fullText
	}

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()

		const hasFiles = Array.from(e.dataTransfer.items).some(
			(item) => item.kind === 'file'
		)

		if (!draggingFile && hasFiles) setDraggingFile(true)
	}
	const handleDragExit = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		if (draggingFile) setDraggingFile(false)
	}
	const handleDropFile = async (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		if (draggingFile) setDraggingFile(false)

		const file = e.dataTransfer.files?.[0]
		if (!file) return

		switch (file.type) {
			case 'text/plain':
				const reader = new FileReader()
				reader.onload = (e) => {
					const result = e.target?.result as string

					setDocumentData({
						...(documentData as IDocument),
						text: result,
					})
					if (result.trim() != '') {
						setTextareaErr(null)
					}
				}

				reader.readAsText(file)
				break
			case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
				const extractedTextDocx = await extractTextFromDocx(file)
				setDocumentData({
					...(documentData as IDocument),
					text: extractedTextDocx,
				})
				if (extractedTextDocx.trim() != '') {
					setTextareaErr(null)
				}

				break
			case 'application/haansofthwpx':
				const extractedTextHwpx = await extractTextFromHwpx(file)

				if (!extractedTextHwpx) return

				setDocumentData({
					...(documentData as IDocument),
					text: extractedTextHwpx,
				})
				if (extractedTextHwpx.trim() != '') {
					setTextareaErr(null)
				}

				break
		}
	}

	const handleCreateFlashCard = () => {
		const flashCardData = documentData?.flashCard

		const isDuplicated = flashCardData?.some((flashCard: IFlashCard) => {
			return flashCard.label == selectedTextRef.current
		})

		if (isDuplicated) {
			toast('Duplicated')
		} else {
			setDocumentData({
				...(documentData as IDocument),
				flashCard: [
					{
						label: selectedTextRef.current,
						content: concept,
					},
					...(documentData?.flashCard as IFlashCard[]),
				],
			})
		}

		setShowContextMenu(false)
	}

	const syncScroll = () => {
		if (!textareaRef.current || !highlightRef.current) return

		highlightRef.current.scrollTop = textareaRef.current.scrollTop
		highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
	}
	const escapeHTML = (str: string) => {
		return str
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;')
	}
	const getHighlightedText = (text: string, ranges: [number, number][]) => {
		if (!ranges.length) return escapeHTML(text)

		ranges.sort((a, b) => a[0] - b[0])

		let result = ''
		let currentIndex = 0

		for (const [start, end] of ranges) {
			if (start >= end || start < 0 || end > text.length) continue

			const before = escapeHTML(text.slice(currentIndex, start))
			const highlighted = `<mark>${escapeHTML(
				text.slice(start, end)
			)}</mark>`

			result += before + highlighted
			currentIndex = end
		}

		result += escapeHTML(text.slice(currentIndex))

		return result
	}
	const mergeRanges = (ranges: [number, number][]): [number, number][] => {
		if (!ranges.length) return []

		ranges.sort((a, b) => a[0] - b[0])

		const merged: [number, number][] = []
		let [start, end] = ranges[0]

		for (let i = 1; i < ranges.length; i++) {
			const [nextStart, nextEnd] = ranges[i]

			if (nextStart <= end) {
				end = Math.max(end, nextEnd)
			} else {
				merged.push([start, end])
				start = nextStart
				end = nextEnd
			}
		}
		merged.push([start, end])

		return merged
	}
	function unhighlightParts(
		highlights: [number, number][],
		removeRange: [number, number]
	): [number, number][] {
		const [removeStart, removeEnd] = removeRange
		const result: [number, number][] = []

		for (const [start, end] of highlights) {
			if (end <= removeStart || start >= removeEnd) {
				result.push([start, end])
			} else {
				if (start < removeStart) {
					result.push([start, Math.max(start, removeStart)])
				}
				if (end > removeEnd) {
					result.push([Math.min(end, removeEnd), end])
				}
			}
		}

		return result
	}
	const highlight = () => {
		const start = selectedTextAreaRef.current.start
		const end = selectedTextAreaRef.current.end
		setDocumentData((pre) => {
			if (!pre) return pre
			return {
				...pre,
				highlight: mergeRanges([...pre?.highlight, [start, end]]),
			}
		})

		setShowContextMenu(false)
	}
	const clearHighlight = () => {
		const start = selectedTextAreaRef.current.start
		const end = selectedTextAreaRef.current.end
		setDocumentData((pre) => {
			if (!pre) return pre
			return {
				...pre,
				highlight: unhighlightParts(pre?.highlight, [start, end]),
			}
		})

		setShowContextMenu(false)
	}

	return (
		<>
			<main className='flex flex-col max-w-4xl flex-1 mx-auto p-4 space-y-4 h-screen overflow-hidden'>
				<h1 className='text-xl ml-1 font-bold'>
					{slug.map((e) => decodeURIComponent(e)).join(' / ')}
				</h1>

				<Tabs
					defaultValue='document'
					className='flex-1 flex flex-col overflow-hidden'
				>
					<TabsList>
						<TabsTrigger value='document'>Document</TabsTrigger>
						<TabsTrigger value='flashcards'>Flashcards</TabsTrigger>
					</TabsList>
					<TabsContent
						value='document'
						className='flex-1'
					>
						<div
							onDrop={handleDropFile}
							onDragOver={handleDragOver}
							onDragLeave={handleDragExit}
							className='relative flex flex-col space-y-2 min-h-[30%] max-h-[70vh]'
						>
							{textareaErr && (
								<p className='text-red-500 mb-2'>
									{textareaErr}
								</p>
							)}
							<div className='px-1 relative'>
								<div
									ref={highlightRef}
									className={`text-lg sm:text-lg md:text-sm text-transparent leading-relaxed tracking-wide absolute rounded-md border px-3 py-2 pr-5 outline-none min-h-[30vh] max-h-[70vh] h-full w-full overflow-y-scroll overflow-x-hidden hide-scrollbar z-2 whitespace-pre-wrap break-words`}
									dangerouslySetInnerHTML={{
										__html: getHighlightedText(
											documentData?.text
												? documentData?.text
												: '',
											documentData
												? documentData.highlight
												: []
										),
									}}
								></div>
								<Textarea
									ref={textareaRef}
									placeholder={
										draggingFile
											? ''
											: 'Type or drop a file here'
									}
									value={documentData?.text || ''}
									onChange={(e) => {
										setDocumentData({
											...(documentData as IDocument),
											text: e.target.value,
										})
										if (e.target.value.trim() != '') {
											setTextareaErr(null)
										}
									}}
									onScroll={syncScroll}
									className={`relative resize-none min-h-[30vh] h-full w-full max-h-[70vh] overflow-auto bg-transparent z-2 hide-scrollbar text-lg leading-relaxed tracking-wide`}
									spellCheck={false}
								/>
								{draggingFile && (
									<div className='absolute top-0 left-0 w-full h-full flex items-center justify-center border-4 border-blue-400 border-dashed bg-blue-100 pointer-events-none'>
										<span className='text-4xl font-bold text-blue-400'>
											Drop Here
										</span>
									</div>
								)}
							</div>
							<Button
								onClick={openModal}
								className='w-40 ml-auto'
							>
								Generate Quizzes
							</Button>
						</div>
					</TabsContent>
					<TabsContent
						value='flashcards'
						className='flex-1 flex flex-col overflow-hidden'
					>
						<FlashCardContainer
							flashCardData={documentData?.flashCard || []}
							documentData={documentData}
							setDocumentData={setDocumentData}
						/>
					</TabsContent>
				</Tabs>
			</main>

			{showContextMenu && (
				<div
					ref={contextMenuRef}
					className='absolute flex flex-col z-50 max-w-100 p-1 bg-white shadow-md border rounded-md animate-in fade-in'
					style={{
						top: contextMenuPosition.y,
						left: contextMenuPosition.x,
					}}
				>
					{showConcept ? (
						<div className='px-4 py-2'>
							<div className='mb-4 flex justify-between items-center'>
								<h1 className='text-lg'>
									{selectedTextRef.current}
								</h1>
								<div className='flex gap-2 h-full'>
									<Button
										disabled={isStreaming}
										variant={'outline'}
										className='h-full rounded-full'
										onClick={handleCreateFlashCard}
									>
										<RectangleVertical />
									</Button>
									<a
										href={`https://www.bing.com/search?&q=${encodeURIComponent(
											selectedTextRef.current
										)}`}
										target='_blank'
										rel='noopener noreferrer'
										className='h-full'
									>
										<Button
											className='h-full rounded-full'
											variant='outline'
										>
											<Search size={20} />
										</Button>
									</a>
								</div>
							</div>
							{concept == '' ? (
								<Skeleton className='h-50 w-90 rounded-md bg-gray-200' />
							) : (
								<p className='break-words whitespace-normal'>
									{concept}
								</p>
							)}
						</div>
					) : (
						<>
							<Button
								onClick={() => setShowConcept(true)}
								variant={'ghost'}
								className='w-52 h-8 text-left justify-start rounded-sm'
							>
								Get Concept
							</Button>
							<Button
								onClick={highlight}
								variant={'ghost'}
								className='w-52 h-8 text-left justify-start rounded-sm'
							>
								Highlight
							</Button>
							<Button
								onClick={clearHighlight}
								variant={'ghost'}
								className='w-52 h-8 text-left justify-start rounded-sm'
							>
								Clear Highlight
							</Button>
						</>
					)}
				</div>
			)}
			<QuizDialog
				isOpen={modalOpen}
				setIsOpen={setModalOpen}
				text={documentData?.text || ''}
			/>
		</>
	)
}
