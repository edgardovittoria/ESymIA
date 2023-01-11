import { Folder } from "../../model/Folder";
import { Project } from "../../model/Project";
import { folderByID, ProjectState } from "../projectSlice";

export const addProjectToStore = (state: ProjectState, projectToAdd: Project) => {
    let selectedFolder = folderByID(state, state.selectedFolder)
    selectedFolder?.projectList.push(projectToAdd)
    // if (selectedFolder?.name === "My Files" && (!projectAlreadyExists(state.projects.projectList, projectToAdd))) {
    //     state.projects.projectList.push(projectToAdd)
    // }
    // else {
    //     selectedFolder?.projectList.push(projectToAdd)
    //     recursiveProjectAdd(state.projects.subFolders, (selectedFolder?.faunaDocumentId) as string, projectToAdd)
    // }
    // if (selectedFolder?.name === "My Shared Elements" && (!projectAlreadyExists(state.sharedElements.projectList, projectToAdd))) {
    //     state.projects.projectList.push(projectToAdd)
    // }
    // else {
    //     selectedFolder?.projectList.push(projectToAdd)
    //     recursiveProjectAdd(state.sharedElements.subFolders, (selectedFolder?.faunaDocumentId) as string, projectToAdd)
    // }
}

export const removeProjectFromStore = (state: ProjectState, projectToRemove: string) => {
    let selectedFolder = folderByID(state, state.selectedFolder)
    if (selectedFolder){
        selectedFolder.projectList = selectedFolder.projectList.filter(p => p.faunaDocumentId !== projectToRemove)
    }
    // if (selectedFolder?.name === "My Files") {
    //     state.projects.projectList = state.projects.projectList.filter(p => p.faunaDocumentId !== projectToRemove)
    // } else {
    //     recursiveProjectRemove(state.projects.subFolders, state.selectedFolder.faunaDocumentId as string, projectToRemove)
    // }
}

export const addFolderToStore = (state: ProjectState, folderToAdd: Folder) => {
    let selectedFolder = folderByID(state, state.selectedFolder)
    selectedFolder?.subFolders.push(folderToAdd)
    // if (state.selectedFolder.name === "My Files") {
    //     state.projects.subFolders.push(folderToAdd)
    // } else {
    //     recursiveFoldersAdd(state.projects.subFolders, (state.selectedFolder?.faunaDocumentId) as string, folderToAdd)
    // }
    // state.selectedFolder.subFolders.push(folderToAdd)
}

export const removeFolderFromStore = (state: ProjectState, folderToRemove: Folder) => {
    let selectedFolder = folderByID(state, state.selectedFolder)
    if (selectedFolder){
        selectedFolder.subFolders = selectedFolder.subFolders.filter(f => f.faunaDocumentId !== folderToRemove.faunaDocumentId)
    }
    // if (state.selectedFolder.name === "My Files") {
    //     state.projects.subFolders = state.projects.subFolders.filter(sf => sf.name !== folderToRemove.name)
    // } else {
    //     recursiveFolderRemove(state.projects.subFolders, state.selectedFolder.faunaDocumentId as string, folderToRemove)
    // }
    // state.selectedFolder.subFolders = state.selectedFolder.subFolders.filter(sf => sf.name !== folderToRemove.name)
}

export const moveProject = (state: ProjectState, projectToMove: Project, targetFolder: string) => {
    removeProjectFromStore(state, projectToMove.faunaDocumentId as string)
    let targetF = folderByID(state, targetFolder)
    targetF?.projectList.push(projectToMove)
    // if (state.selectedFolder.name === "My Files") {
    //     state.projects.projectList = state.projects.projectList.filter(p => p.faunaDocumentId !== projectToMove.faunaDocumentId)
    // } else {
    //     recursiveProjectRemove(state.projects.subFolders, state.selectedFolder.faunaDocumentId as string, projectToMove.faunaDocumentId as string)
    // }
    // state.selectedFolder.projectList = state.selectedFolder.projectList.filter(p => p.faunaDocumentId !== projectToMove.faunaDocumentId)
    // if (targetFolder === state.projects.faunaDocumentId) {
    //     state.projects.projectList.push(projectToMove)
    // } else {
    //     recursiveProjectAdd(state.projects.subFolders, targetFolder, projectToMove)
    // }
}

export const moveFolder = (state: ProjectState, folderToMove: Folder, targetFolder: string) => {
    removeFolderFromStore(state, folderToMove)
    let targetF = folderByID(state, targetFolder)
    targetF?.subFolders.push(folderToMove)
    // if (state.selectedFolder.name === "My Files") {
    //     state.projects.subFolders = state.projects.subFolders.filter(sf => sf.faunaDocumentId !== folderToMove.faunaDocumentId)
    // } else {
    //     recursiveFolderRemove(state.projects.subFolders, state.selectedFolder.faunaDocumentId as string, folderToMove)
    // }
    // state.selectedFolder.subFolders = state.selectedFolder.subFolders.filter(sf => sf.faunaDocumentId !== folderToMove.faunaDocumentId)
    // let updatedFolder = { ...folderToMove, parent: targetFolder }
    // if (targetFolder === state.projects.faunaDocumentId) {
    //     state.projects.subFolders.push(updatedFolder)
    // } else {
    //     recursiveFoldersAdd(state.projects.subFolders, targetFolder, updatedFolder)
    // }
}

export const recursiveFindFolders = (folder: Folder, allFolders: Folder[]): Folder[] => {
    allFolders.push(folder)
    folder.subFolders.forEach(sb => recursiveFindFolders(sb, allFolders))
    return allFolders
}

export const takeAllProjectsIn = (folder: Folder): Project[] => {
    return folder.subFolders.reduce((projects, subF) => projects.concat(takeAllProjectsIn(subF)), folder.projectList)
}

export const projectAlreadyExists = (projects: Project[], newProject: Project) => {
    return projects.filter(project => project.name === newProject.name).length > 0
}

export const recursiveFoldersAdd = (subFolders: Folder[], parent: string, folderToAdd: Folder) => {
    subFolders.forEach(sf => {
        if (sf.faunaDocumentId === parent) {
            sf.subFolders.push(folderToAdd)
        } else {
            recursiveFoldersAdd(sf.subFolders, parent, folderToAdd)
        }
    })

}

export const recursiveFolderRemove = (subFolders: Folder[], parent: string, folderToRemove: Folder) => {
    subFolders.forEach(sf => {
        if (sf.faunaDocumentId === parent) {
            sf.subFolders = sf.subFolders.filter(f => f.faunaDocumentId !== folderToRemove.faunaDocumentId)
        } else {
            recursiveFolderRemove(sf.subFolders, parent, folderToRemove)
        }
    })
}

export const recursiveProjectAdd = (subFolders: Folder[], parent: string, projectToAdd: Project) => {
    subFolders.forEach(sf => {
        if (sf.faunaDocumentId === parent && (!projectAlreadyExists(sf.projectList, projectToAdd))) {
            sf.projectList.push(projectToAdd)
        } else {
            recursiveProjectAdd(sf.subFolders, parent, projectToAdd)
        }
    })
}

export const recursiveProjectRemove = (subFolders: Folder[], parent: string, projectToRemove: string) => {
    subFolders.forEach(sf => {
        if (sf.faunaDocumentId === parent) {
            sf.projectList = sf.projectList.filter(p => p.faunaDocumentId !== projectToRemove)
        } else {
            recursiveProjectRemove(sf.subFolders, parent, projectToRemove)
        }
    })
}



