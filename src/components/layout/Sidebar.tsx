'use client'

import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
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

export default function Sidebar() {
  const [projects, setProjects] = useState<Project[]>([])
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addParents, setAddParents] = useState<string[]>([])
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<'folder' | 'project'>('project')
  const [nameInputErr, setNameInputErr] = useState<string | null>(null)

  useEffect(() => {
    const data = localStorage.getItem(localStorageProjects)
    if (data) {
      setProjects(JSON.parse(data))
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
      setNameInputErr('Please use a valid name')
      return
    }
  //alter separate duplication check of project and folder
    function addProjectRec(items: Project[], path: string[]): Project[] {
      if (path.length === 0) {
        if (items.find((p) => p.name.toLowerCase() === name.toLowerCase())) {
          setNameInputErr(`This ${newType} name already exist`) //alter don't close modal if error
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
      <div className="w-60 bg-gray-200 text-black h-screen p-2 overflow-auto space-y-1">
        <h2 className="text-lg font-bold px-4 py-2 flex justify-between items-center">
          Projects
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant={"ghost"}>...</Button>
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
        {projects.map((project) => {
          return project.children ?
            <Folder name={project.name} folder_children={project.children} handleDelete={handleDelete} handleCreateProject={openAddModal} key={'folder-' + project.name}/> :
            <Project name={project.name} key={'project-' + project.name} handleDelete={handleDelete}/>
        })}
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
              {nameInputErr && (
                <p className='text-red-500'>{nameInputErr}</p>
              )}
              <p></p>
              <Input
                id="project-name"
                autoFocus
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value)
                  if(e.target.value.trim() != '') {
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
