import faunadb from "faunadb";
import { FaunaFolder, FaunaFolderDetails, FaunaProject, FaunaProjectDetails } from "../../model/FaunaModels";
import { Folder } from "../../model/Folder";
import { Project } from "../../model/Project";



export const getFoldersByOwner = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, owner: string) => {
    const response = await faunaClient.query(
        faunaQuery.Select("data",
            faunaQuery.Map(
                faunaQuery.Paginate(faunaQuery.Match(faunaQuery.Index("folders_by_owner"), owner)),
                faunaQuery.Lambda("folder", {
                    id: faunaQuery.Select(["ref", "id"], faunaQuery.Get(faunaQuery.Var("folder"))),
                    folder: faunaQuery.Select(["data"], faunaQuery.Get(faunaQuery.Var("folder")))
                })
            )
        )
    )
        .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
        ));
    return response as FaunaFolder[]
}

export const getSimulationProjectsByOwner = async (
    faunaClient: faunadb.Client,
    faunaQuery: typeof faunadb.query,
    owner: string
) => {
    const response = await faunaClient.query(
        faunaQuery.Select("data",
            faunaQuery.Map(
                faunaQuery.Paginate(
                    faunaQuery.Match(
                        faunaQuery.Index("simulationProjects_by_owner"),
                        owner
                    )
                ),
                faunaQuery.Lambda("project", {
                    id: faunaQuery.Select(
                        ["ref", "id"],
                        faunaQuery.Get(
                            faunaQuery.Var("project")
                        )
                    ),
                    project: faunaQuery.Select(
                        ["data"],
                        faunaQuery.Get(
                            faunaQuery.Var("project")
                        )
                    )
                })
            )
        )
    )
        .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
        ));
    return response as FaunaProject[]
}

export const constructFolderStructure = (folders: FaunaFolder[], all_projects: FaunaProject[]) => {
    let rootFolder = folders.filter(faunaFolder => faunaFolder.folder.parent === 'root')[0]
    let remainingFolders = folders.filter(faunaFolder => faunaFolder.folder.parent !== 'root')
    let faunaProjects = all_projects.filter(fp => rootFolder.folder.projectList.includes(fp.id))
    let remainingProjects = all_projects.filter(fp => !rootFolder.folder.projectList.includes(fp.id))
    let projs = faunaProjects.reduce((projects, fp) => {
        let p: Project = {
            ...fp.project,
            faunaDocumentId: fp.id
        }
        projects.push(p)
        return projects
    }, [] as Project[])
    let root = {
        ...rootFolder.folder,
        faunaDocumentId: rootFolder.id,
        subFolders: recursiveSubFoldersRetrieving(rootFolder.folder.subFolders, remainingFolders, remainingProjects),
        projectList: projs
    } as Folder
    return root
}

const recursiveSubFoldersRetrieving = (subFolders: string[], all_folders: FaunaFolder[], all_projects: FaunaProject[]) => {
    let sfs: Folder[] = []
    if (subFolders.length > 0) {
        sfs = subFolders.reduce((subFs, sfRef) => {
            let sb = all_folders.filter(ff => ff.id === sfRef)[0].folder
            let remainingFolders = all_folders.filter(ff => ff.id !== sfRef)
            let faunaProjects = all_projects.filter(fp => sb.projectList.includes(fp.id))
            let remainingProjects = all_projects.filter(fp => !sb.projectList.includes(fp.id))
            let projs = faunaProjects.reduce((projects, fp) => {
                let p: Project = {
                    ...fp.project,
                    faunaDocumentId: fp.id
                }
                projects.push(p)
                return projects
            }, [] as Project[])
            let sbFolder = {
                ...sb,
                faunaDocumentId: sfRef,
                subFolders: recursiveSubFoldersRetrieving(sb.subFolders, remainingFolders, remainingProjects),
                projectList: projs
            } as Folder
            subFs.push(sbFolder)
            return subFs
        }, [] as Folder[])
    }
    return sfs
}

export const createFolderInFauna = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, folderToSave: Folder) => {
    const response = await faunaClient.query(
        faunaQuery.Create(faunaQuery.Collection("Folders"), {
            data: {
                ...folderToSave,
                projectList: [],
                subFolders: []
            } as FaunaFolderDetails
        }
        )
    )
        .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
        ));
    return response

}

export const deleteFolderFromFauna = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, folderToDelete: string) => {
    const response = await faunaClient.query(
        faunaQuery.Delete(faunaQuery.Ref(faunaQuery.Collection('Folders'), folderToDelete))
    )
        .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
        ));
    return response

}

export const addIDInSubFoldersList = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, folderFaunaID: string, selectedFolder: Folder) => {
    let folder = convertFolderInFaunaFolderDetails(selectedFolder)
    const response = await faunaClient.query(
        faunaQuery.Update(faunaQuery.Ref(faunaQuery.Collection('Folders'), selectedFolder.faunaDocumentId), {
            data: {
                ...folder,
                subFolders: [...folder.subFolders, folderFaunaID]
            }
        })
    )
        .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
        ));
    return response

}

export const removeIDInSubFoldersList = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, folderFaunaID: string, selectedFolder: Folder) => {
    let folder = convertFolderInFaunaFolderDetails(selectedFolder)
    const response = await faunaClient.query(
        faunaQuery.Update(faunaQuery.Ref(faunaQuery.Collection('Folders'), selectedFolder.faunaDocumentId), {
            data: {
                ...folder,
                subFolders: [...folder.subFolders.filter(id => id !== folderFaunaID)]

            }
        })
    )
        .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
        ));
    return response

}


export const deleteSimulationProjectFromFauna = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, projectToDelete: string) => {
    const response = await faunaClient.query(
        faunaQuery.Delete(faunaQuery.Ref(faunaQuery.Collection('SimulationProjects'), projectToDelete))
    )
        .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
        ));
    return response

}


export const removeIDInFolderProjectsList = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, projectFaunaID: string, selectedFolder: Folder) => {
    let folder = convertFolderInFaunaFolderDetails(selectedFolder)
    const response = await faunaClient.query(
        faunaQuery.Update(faunaQuery.Ref(faunaQuery.Collection('Folders'), selectedFolder.faunaDocumentId), {
            data: {
                ...folder,
                projectList: [...folder.projectList.filter(id => id !== projectFaunaID)]

            }
        })
    )
        .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
        ));
    return response

}



export const getAllSubFoldersOfThisOne = (folder: Folder): string[] => {
    if (folder.subFolders.length > 0) {
        return folder.subFolders.reduce((IDs, sb) => {
            IDs.push(sb.faunaDocumentId as string)
            IDs.push(...getAllSubFoldersOfThisOne(sb))
            return IDs
        }, [] as string[])
    }
    else {
        return []
    }

}

export const getAllProjectsWithinThisFolder = (folder: Folder): string[] => {
    let projectIDs: string[] = []
    if (folder.projectList.length > 0) {
        projectIDs.push(...folder.projectList.reduce((IDs, p) => {
            IDs.push(p.faunaDocumentId as string)
            return IDs
        }, [] as string[]))
    }
    if (folder.subFolders.length > 0) {
        projectIDs.push(...folder.subFolders.reduce((IDs, sb) => {
            IDs.push(...getAllProjectsWithinThisFolder(sb))
            return IDs
        }, [] as string[]))
    }
    return projectIDs

}

export const createSimulationProjectInFauna = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, projectToSave: Project) => {
    const response = await faunaClient.query(
        faunaQuery.Create(faunaQuery.Collection("SimulationProjects"), { data: { ...projectToSave } as FaunaProjectDetails }
        )
    )
        .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
        ));
    return response

}

export const addIDInFolderProjectsList = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, projectFaunaID: string, selectedFolder: Folder) => {
    let folder = convertFolderInFaunaFolderDetails(selectedFolder)
    const response = await faunaClient.query(
        faunaQuery.Update(faunaQuery.Ref(faunaQuery.Collection('Folders'), selectedFolder.faunaDocumentId), {
            data: {
                ...folder,
                projectList: [...folder.projectList, projectFaunaID]

            }
        })
    )
        .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
        ));
    return response

}

const convertFolderInFaunaFolderDetails = (folder: Folder): FaunaFolderDetails => {
    let faunaFolder = {
        ...folder,
        subFolders: [...folder.subFolders.reduce((subIDs, sb) => {
            subIDs.push(sb.faunaDocumentId as string)
            return subIDs
        }, [] as string[])],
        projectList: [...folder.projectList.reduce((pIDs, p) => {
            pIDs.push(p.faunaDocumentId as string)
            return pIDs
        }, [] as string[])]
    } as FaunaFolderDetails
    return faunaFolder
}


export const updateProjectInFauna = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, projectToUpdate: Project) => {
    const response = await faunaClient.query(
        faunaQuery.Update(faunaQuery.Ref(faunaQuery.Collection('SimulationProjects'), projectToUpdate.faunaDocumentId), {
            data: {
                ...projectToUpdate
            } as FaunaProjectDetails
        })
    )
        .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
        ));
    return response

}