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

interface Project {
  name: string
  children?: Project[]
}

const localStorageProjects = 'my_projects'

const defaultProjects: Project[] = [
  { name: 'Project 1' },
]

function buildPath(parents: string[], name: string) {
  const slugPath = [...parents, name].map((p) =>
    slugify(p, { lower: true })
  );
  return "/" + slugPath.join("/");
}

function ProjectTree({ 
  project, 
  parents = [],
  onAdd,
  onDelete
}: { 
  project: Project; 
  parents?: string[],
  onAdd: (parents: string[], type: 'project' | 'folder') => void
  onDelete: (parents: string[], name: string) => void
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
            <div className="space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onAdd([...parents, project.name], 'folder') // default tạo folder bên trong folder
              }}
            >
              + Folder
            </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  if (
                    confirm(
                      `Bạn có chắc muốn xóa "${project.name}" và tất cả con không?`
                    )
                  ) {
                    onDelete(parents, project.name)
                  }
                }}
              >
                Xóa
              </Button>
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
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          className="w-full justify-start px-4"
        >
          {project.name}
        </Button>
      </Link>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => {
          if (confirm(`Bạn có chắc muốn xóa "${project.name}" không?`)) {
            onDelete(parents, project.name)
          }
        }}
      >
        Xóa
      </Button>
    </div>
  )
}

export default function Sidebar() {
  const [projects, setProjects] = useState<Project[]>([])
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addParents, setAddParents] = useState<string[]>([])
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<'folder' | 'project'>('project')

  // Load từ localStorage lúc mount
  useEffect(() => {
    const data = localStorage.getItem(localStorageProjects)
    if (data) {
      setProjects(JSON.parse(data))
    } else {
      setProjects(defaultProjects)
    }
  }, [])

  // Lưu khi projects thay đổi
  useEffect(() => {
    localStorage.setItem(localStorageProjects, JSON.stringify(projects))
  }, [projects])

  function openAddModal(parents: string[], type: 'folder' | 'project') {
    setAddParents(parents)
    setNewName('')
    setNewType(type)
    setAddModalOpen(true)
  }

  // Thêm mới
  function handleAddSubmit() {
    const name = newName.trim()
    if (!name) {
      alert('Vui lòng nhập tên hợp lệ')
      return
    }
  
    function addProjectRec(items: Project[], path: string[]): Project[] {
      if (path.length === 0) {
        if (items.find((p) => p.name.toLowerCase() === name.toLowerCase())) {
          alert('Tên đã tồn tại trong thư mục này!')
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

  // Xóa project/folder
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
      <div className="w-60 bg-gray-900 text-white h-screen p-2 overflow-auto border-r border-gray-700 space-y-1">
        <h2 className="text-lg font-bold px-4 py-2 flex justify-between items-center">
          Projects
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">+ Tạo mới</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openAddModal([], 'project')}>
                📄 Tạo Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openAddModal([], 'folder')}>
                📁 Tạo Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </h2>
        {projects.map((proj) => (
          <ProjectTree
            key={proj.name}
            project={proj}
            onAdd={openAddModal}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Modal for adding new project/folder */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo Folder hoặc Project mới</DialogTitle>
            <DialogDescription>
              Nhập tên cho folder hoặc project mới bạn muốn tạo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="project-name">Tên mới</Label>
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
              Hủy
            </Button>
            <Button onClick={handleAddSubmit}>Tạo</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
