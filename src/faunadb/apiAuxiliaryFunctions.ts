import { UsersState } from "cad-library"
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

const recursiveSubFoldersRetrieving = (subFolders: string[], all_folders: FaunaFolder[], all_projects: FaunaProject[]) => {
    let sfs: Folder[] = []
    if (subFolders.length > 0) {
        sfs = subFolders.reduce((subFs, sfRef) => {
            let sb = all_folders.filter(ff => ff.id === sfRef)[0].folder
            let remainingFolders = all_folders.filter(ff => ff.id !== sfRef)
            let sbFaunaProjects = all_projects.filter(fp => sb.projectList.includes(fp.id))
            let remainingFaunaProjects = all_projects.filter(fp => !faunaProjectInList(fp, sbFaunaProjects))
            let sbProjects = sbFaunaProjects.map(fp => convertInProjectThis(fp))
            let sbFolder = {
                ...sb,
                faunaDocumentId: sfRef,
                subFolders: recursiveSubFoldersRetrieving(sb.subFolders, remainingFolders, remainingFaunaProjects),
                projectList: sbProjects
            } as Folder
            subFs.push(sbFolder)
            return subFs
        }, [] as Folder[])
    }
    return sfs
}

export const constructSharedFolderStructure = (folders: FaunaFolder[], all_projects: FaunaProject[], user: UsersState) => {
    let rootFolder = {
        name: "My Shared Elements",
        owner: user,
        sharedWith: [],
        subFolders: [],
        projectList: [],
        parent: "root"
    }
    let rootSubFoldersIDs = folders.filter(faunaFolder => !faunaFolderHaveParentInList(faunaFolder, folders)).map((folder) => folder.id)
    let rootProjects = all_projects.filter(p => !faunaProjectHaveParentInFolderList(p, folders))
    let remainingProjects = all_projects.filter(p => !faunaProjectInList(p, rootProjects))
    let projs = rootProjects.map(p => convertInProjectThis(p))
    let root = {
        ...rootFolder,
        faunaDocumentId: "my_shared_elements",
        subFolders: recursiveSubFoldersRetrieving(rootSubFoldersIDs, folders, remainingProjects),
        projectList: projs
    } as Folder
    return root
}



const faunaProjectInList = (project: FaunaProject, projectsList: FaunaProject[]) => {
    return projectsList.filter(p => p.id === project.id).length > 0
}

const faunaFolderInList = (folder: FaunaFolder, folderList: FaunaFolder[]) => {
    return folderList.filter(f => f.id === folder.id).length > 0
}

const faunaFolderHaveParentInList = (folder: FaunaFolder, folderList: FaunaFolder[]) => {
    return folderList.filter(f => folderList.filter(fo => fo.id === f.folder.parent).length > 0)
}

const faunaProjectHaveParentInFolderList = (project: FaunaProject, folderList: FaunaFolder[]) => {
    return folderList.filter(f => f.id === project.project.parentFolder).length > 0
}

const convertInProjectThis = (faunaProject: FaunaProject) => {
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