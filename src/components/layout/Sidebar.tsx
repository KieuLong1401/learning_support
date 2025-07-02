'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import slugify from 'slugify'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import Folder from './Folder'
import Project from './Project'

interface Project {
  name: string
  children?: Project[]
}

const localStorageProjects = 'my_projects'

const defaultProjects: Project[] = [
  { 
    name: 'Project 1'
  },
  { 
    name: 'a',
    children: [
      { name: 'c' }
    ]
  }
]

function ProjectTree({ 
  project
}: { 
  project: Project
}) {
  return project.children ?
    <Folder folder_children={project.children} name={project.name} /> :
    <Project name={project.name}/>
}

export default function Sidebar() {
  const [projects, setProjects] = useState<Project[]>([])
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addParents, setAddParents] = useState<string[]>([])
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<'folder' | 'project'>('project')

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

  // Thêm mới
  function handleAddSubmit() {
    const name = newName.trim()
    if (!name) {
      alert('Please use a valid name') //alter : turn into input error
      return
    }
  
    function addProjectRec(items: Project[], path: string[]): Project[] {
      if (path.length === 0) {
        if (items.find((p) => p.name.toLowerCase() === name.toLowerCase())) {
          alert(`This ${newType} name already exist`) //alter : turn into input error
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
              <Button size="sm">:</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openAddModal([], 'project')}>
                📄 New Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openAddModal([], 'folder')}>
                📁 New Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </h2>
        {projects.map((proj) => (
          <ProjectTree
            key={proj.name}
            project={proj}
          />
        ))}
      </div>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new {newType}</DialogTitle>
            <DialogDescription>
              Name your new {newType}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="project-name">Name</Label>
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
              Cancel
            </Button>
            <Button onClick={handleAddSubmit}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
