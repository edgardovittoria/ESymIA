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
}

export const addFolderToStore = (state: ProjectState, folderToAdd: Folder) => {
    let selectedFolder = folderByID(state, state.selectedFolder)
    selectedFolder?.subFolders.push(folderToAdd)
}

export const removeFolderFromStore = (state: ProjectState, folderToRemove: Folder) => {
    let selectedFolder = folderByID(state, state.selectedFolder)
    if (selectedFolder){
        selectedFolder.subFolders = selectedFolder.subFolders.filter(f => f.faunaDocumentId !== folderToRemove.faunaDocumentId)
    }
}

export const moveProject = (state: ProjectState, projectToMove: Project, targetFolder: string) => {
    removeProjectFromStore(state, projectToMove.faunaDocumentId as string)
    let targetF = folderByID(state, targetFolder)
    targetF?.projectList.push({...projectToMove, parentFolder: targetF.faunaDocumentId} as Project)
}

export const moveFolder = (state: ProjectState, folderToMove: Folder, targetFolder: string) => {
    removeFolderFromStore(state, folderToMove)
    let targetF = folderByID(state, targetFolder)
    targetF?.subFolders.push({...folderToMove, parent: targetF.faunaDocumentId} as Folder)
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



