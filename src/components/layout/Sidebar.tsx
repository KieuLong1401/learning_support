'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import slugify from 'slugify'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'

// 📌 프로젝트/폴더 구조 인터페이스 정의
interface Project {
  name: string
  children?: Project[]
}

const localStorageProjects = 'my_projects' // localStorage 키 이름

const defaultProjects: Project[] = [
  { name: 'Project 1' },
]

// 📌 경로(주소) 생성 함수
function buildPath(parents: string[], name: string) {
  const slugPath = [...parents, name].map((p) =>
    slugify(p, { lower: true })
  )
  return "/" + slugPath.join("/")
}

// 📌 프로젝트/폴더 트리 구성 함수 (재귀)
function ProjectTree({
  project,
  parents = [],
  onAdd,
  onDelete,
  onSelectFolder
}: {
  project: Project
  parents?: string[]
  onAdd: (parents: string[], type: 'project' | 'folder') => void
  onDelete: (parents: string[], name: string) => void
  onSelectFolder: (parents: string[]) => void
}) {
  const pathname = usePathname()
  const fullPath = buildPath(parents, project.name)
  const isActive = pathname === fullPath

  if (project.children?.length) {
    return (
      <Accordion type="single" collapsible className="w-full" key={fullPath}>
        <AccordionItem value={fullPath}>
          <AccordionTrigger className="flex justify-between items-center px-4 py-2 text-left w-full">
            <span>{project.name}</span>
            <div className="space-x-1">
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onAdd([...parents, project.name], 'folder') }}>+ 폴더</Button>
              <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onSelectFolder([...parents, project.name]) }}>선택</Button>
              <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); if (confirm(`"${project.name}"과 하위 항목을 삭제할까요?`)) onDelete(parents, project.name) }}>삭제</Button>
            </div>
          </AccordionTrigger>
          <AccordionContent className="ml-4">
            {project.children.map((child) => (
              <ProjectTree
                key={child.name}
                project={child}
                parents={[...parents, project.name]}
                onAdd={onAdd}
                onDelete={onDelete}
                onSelectFolder={onSelectFolder}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  return (
    <div key={fullPath} className="flex items-center space-x-2">
      <Link href={fullPath} className="flex-grow">
        <Button variant={isActive ? 'secondary' : 'ghost'} className="w-full justify-start px-4">
          {project.name}
        </Button>
      </Link>
      <Button size="sm" variant="secondary" onClick={() => onSelectFolder([...parents, project.name])}>선택</Button>
      <Button size="sm" variant="destructive" onClick={() => { if (confirm(`"${project.name}"을 삭제할까요?`)) onDelete(parents, project.name) }}>삭제</Button>
    </div>
  )
}

// 📌 실제 Sidebar 컴포넌트
export default function Sidebar() {
  const [projects, setProjects] = useState<Project[]>([])
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addParents, setAddParents] = useState<string[]>([])
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<'folder' | 'project'>('project')
  const [selectedParents, setSelectedParents] = useState<string[] | null>(null)

  useEffect(() => {
    const data = localStorage.getItem(localStorageProjects)
    if (data) {
      setProjects(JSON.parse(data))
    } else {
      setProjects(defaultProjects)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(localStorageProjects, JSON.stringify(projects))
  }, [projects])

  function openAddModal(parents: string[], type: 'folder' | 'project') {
    setAddParents(parents)
    setNewName('')
    setNewType(type)
    setAddModalOpen(true)
  }

  function handleAddSubmit() {
    const name = newName.trim()
    if (!name) {
      alert('이름을 입력하세요.')
      return
    }

    function addProjectRec(items: Project[], path: string[]): Project[] {
      if (path.length === 0) {
        if (items.find((p) => p.name.toLowerCase() === name.toLowerCase())) {
          alert('이름이 이미 있어요!')
          return items
        }
        const newItem: Project = newType === 'folder' ? { name, children: [] } : { name }
        return [...items, newItem]
      }

      return items.map((item) => {
        if (item.name === path[0]) {
          const children = item.children ?? []
          return {
            ...item,
            children: addProjectRec(children, path.slice(1)),
          }
        }
        return item
      })
    }

    setProjects((prev) => addProjectRec(prev, addParents))
    setAddModalOpen(false)
  }

  function handleDelete(parents: string[], nameToDelete: string) {
    function deleteProjectRec(items: Project[], path: string[]): Project[] {
      if (path.length === 0) {
        return items.filter((p) => p.name !== nameToDelete)
      }
      return items.map((item) => {
        if (item.name === path[0]) {
          const children = item.children ?? []
          return {
            ...item,
            children: deleteProjectRec(children, path.slice(1)),
          }
        }
        return item
      })
    }

    setProjects((prev) => deleteProjectRec(prev, parents))
  }

  return (
    <>
      <div className="w-64 bg-gray-900 text-white h-screen p-2 overflow-auto border-r border-gray-700 space-y-1">
        <h2 className="text-lg font-bold px-4 py-2 flex justify-between items-center">
          프로젝트 목록
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">+ 새로 만들기</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openAddModal(selectedParents ?? [], 'project')}>
                📄 프로젝트 만들기
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openAddModal(selectedParents ?? [], 'folder')}>
                📁 폴더 만들기
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </h2>

        <div className="flex justify-between items-center px-4">
          <span className="text-sm">선택된 폴더:</span>
          <span className="text-xs text-gray-400">{selectedParents ? selectedParents.join(' / ') : '없음'}</span>
          <Button size="sm" variant="ghost" onClick={() => setSelectedParents(null)}>
            초기화
          </Button>
        </div>

        {projects.map((proj) => (
          <ProjectTree
            key={proj.name}
            project={proj}
            onAdd={openAddModal}
            onDelete={handleDelete}
            onSelectFolder={setSelectedParents}
          />
        ))}
      </div>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 {newType === 'folder' ? '폴더' : '프로젝트'} 만들기</DialogTitle>
            <DialogDescription>이름을 입력하세요.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="project-name">이름</Label>
              <Input
                id="project-name"
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSubmit()
                  }
                }}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleAddSubmit}>만들기</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
