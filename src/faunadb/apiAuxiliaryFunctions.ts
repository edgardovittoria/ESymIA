import { Folder, Project, sharingInfoUser } from "../model/esymiaModels"
import { FaunaFolder, FaunaFolderDetails, FaunaProject } from "../model/FaunaModels"

export const constructFolderStructure = (folderID: string, all_folders: FaunaFolder[], all_projects: FaunaProject[]) => {
    let rootFaunaFolder = all_folders.filter(faunaFolder => faunaFolder.id === folderID)[0]
    let remainingFolders = all_folders.filter(faunaFolder => faunaFolder.id !== folderID)
    let rootFaunaProjects = all_projects.filter(fp => rootFaunaFolder.folder.projectList.includes(fp.id))
    let remainingFaunaProjects = all_projects.filter(fp => !faunaProjectInList(fp, rootFaunaProjects))
    let rootProjects = rootFaunaProjects.map(p => convertInProjectThis(p))
    let root = {
        ...rootFaunaFolder.folder,
        faunaDocumentId: rootFaunaFolder.id,
        subFolders: (rootFaunaFolder.folder.subFolders.length > 0) ?  rootFaunaFolder.folder.subFolders.map(sf => constructFolderStructure(sf, remainingFolders, remainingFaunaProjects)): [],
        projectList: rootProjects
    } as Folder
    return root
}

export const faunaProjectInList = (project: FaunaProject, projectsList: FaunaProject[]) => {
    return projectsList.filter(p => p.id === project.id).length > 0
}

export const faunaFolderInList = (folder: FaunaFolder, folderList: FaunaFolder[]) => {
    return folderList.filter(f => f.id === folder.id).length > 0
}

export const faunaFolderHaveParentInList = (folder: FaunaFolder, folderList: FaunaFolder[]) => {
    return folderList.filter(f => folder.folder.parent === f.id).length > 0
}

export const faunaProjectHaveParentInFolderList = (project: FaunaProject, folderList: FaunaFolder[]) => {
    return folderList.filter(f => f.id === project.project.parentFolder).length > 0
}

export const convertInProjectThis = (faunaProject: FaunaProject) => {
    let project: Project = {
        ...faunaProject.project,
        faunaDocumentId: faunaProject.id,
        sharedWith: faunaProject.project.sharedWith as sharingInfoUser[]
    }
    return project
}

export const convertInFaunaFolderDetailsThis = (folder: Folder): FaunaFolderDetails => {
    let faunaFolder = {
        ...folder,
        subFolders: folder.subFolders.map(sf => sf.faunaDocumentId as string),
        projectList: folder.projectList.map(p => p.faunaDocumentId as string)
    } as FaunaFolderDetails
    return faunaFolder
}