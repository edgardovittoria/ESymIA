import { Folder, Project, sharingInfoUser } from "../model/esymiaModels"
import {FaunaFolder, FaunaFolderDetails, FaunaProject, FaunaProjectDetails} from "../model/FaunaModels"
import {CanvasState} from "cad-library";

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
        simulation: (faunaProject.project.simulation === undefined || faunaProject.project.simulation === null) ? undefined : faunaProject.project.simulation,
        model: {} as CanvasState,
        sharedWith: faunaProject.project.sharedWith as sharingInfoUser[]
    }
    return project
}

export const convertInFaunaProjectThis = (project: Project) => {
    let faunaProject: FaunaProject = {
        id: project.faunaDocumentId as string,
        project: {
            name: project.name,
            description: project.description,
            modelS3: project.modelS3,
            ports: project.ports,
            portKey: project.portKey,
            signal: project.signal,
            simulation: project.simulation === undefined ? null : project.simulation ,
            meshData: project.meshData,
            screenshot: project.screenshot,
            owner: project.owner,
            sharedWith: project.sharedWith,
            parentFolder: project.parentFolder
        } as FaunaProjectDetails
    }
    return faunaProject
}

export const convertInFaunaFolderDetailsThis = (folder: Folder): FaunaFolderDetails => {
    let faunaFolder = {
        ...folder,
        subFolders: folder.subFolders.map(sf => sf.faunaDocumentId as string),
        projectList: folder.projectList.map(p => p.faunaDocumentId as string)
    } as FaunaFolderDetails
    return faunaFolder
}