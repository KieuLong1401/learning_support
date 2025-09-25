import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import JSZip from 'jszip'
import { parseStringPromise } from 'xml2js'
import mammoth from 'mammoth'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function extractTextFromDocx(file: File): Promise<string>{
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
}
export async function extractTextFromHwpx(file: File): Promise<string | undefined>{
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

export function escapeHTML(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}