import { UsersState } from "cad-library";
import faunadb from "faunadb";
import { Folder, Project, sharingInfoUser } from "../model/esymiaModels";
import { FaunaFolder, FaunaFolderDetails, FaunaProject, FaunaProjectDetails } from "../model/FaunaModels";
import {
    recursiveFindFolders,
    takeAllProjectsIn
} from "../store/auxiliaryFunctions/managementProjectsAndFoldersFunction";



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

export const getFoldersByOwnerUsername = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, owner: string) => {
    const response = await faunaClient.query(
        faunaQuery.Select("data",
            faunaQuery.Map(
                faunaQuery.Paginate(faunaQuery.Match(faunaQuery.Index("folders_by_owner_username"), owner)),
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
            faunaDocumentId: fp.id,
            sharedWith: [] as sharingInfoUser[]
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
                    faunaDocumentId: fp.id,
                    sharedWith: fp.project.sharedWith as sharingInfoUser[]
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

export const constructSharedFolderStructure = (folders: FaunaFolder[], all_projects: FaunaProject[], user: UsersState) => {
    let rootFolder = {
        name: "My Shared Elements",
        owner: user,
        sharedWith: [],
        subFolders: [],
        projectList: [],
        parent: "root"
    }
    let remainingFolders = folders.filter(faunaFolder => folders.filter(f => f.id === faunaFolder.folder.parent).length > 0)
    let rootSubFoldersIDs = folders.filter(f => remainingFolders.filter(folder => folder.id === f.id).length === 0).reduce((ids, folder) => {
        ids.push(folder.id)
        return ids
    }, [] as string[])
    let faunaProjects = all_projects.filter(fp => folders.filter(folder => folder.folder.projectList.filter(p => p === fp.id).length > 0).length === 0)
    let remainingProjects = all_projects.filter(fp => folders.filter(folder => folder.folder.projectList.filter(p => p === fp.id).length > 0).length > 0)
    let projs = faunaProjects.reduce((projects, fp) => {
        let p: Project = {
            ...fp.project,
            faunaDocumentId: fp.id,
            sharedWith: fp.project.sharedWith as sharingInfoUser[]
        }
        projects.push(p)
        return projects
    }, [] as Project[])
    let root = {
        ...rootFolder,
        faunaDocumentId: "my_shared_elements",
        subFolders: recursiveSubFoldersRetrieving(rootSubFoldersIDs, folders, remainingProjects),
        projectList: projs
    } as Folder
    return root
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

export const deleteFolderFromFauna = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, folderToDelete: string, oldParent: string) => {
    faunaClient.query(faunaQuery.Call('get_all_subfolders_of_folder', folderToDelete)).then(subFolders => {
        faunaClient.query(faunaQuery.Call('get_all_projects_recursively_of_folder', folderToDelete)).then(projects => {
            faunaClient.query(faunaQuery.Delete(faunaQuery.Ref(faunaQuery.Collection('Folders'), folderToDelete)));
            (subFolders as string[]).forEach(sb => faunaClient.query(faunaQuery.Delete(faunaQuery.Ref(faunaQuery.Collection('Folders'), sb))));
            (projects as string[]).forEach(p => faunaClient.query(faunaQuery.Delete(faunaQuery.Ref(faunaQuery.Collection('SimulationProjects'), p))))
            faunaClient.query(faunaQuery.Call('remove_subfolder_from_folder', folderToDelete, oldParent))
        })
    })
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


export const deleteSimulationProjectFromFauna = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, projectToDelete: string, parentFolder: string) => {
    faunaClient.query(faunaQuery.Delete(faunaQuery.Ref(faunaQuery.Collection('SimulationProjects'), projectToDelete))).then(() => {
        (parentFolder) && faunaClient.query(faunaQuery.Call('remove_project_from_folder', projectToDelete, parentFolder))
    }
    )
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

export const updateFolderInFauna = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, folderToUpdate: Folder) => {
    const response = await faunaClient.query(
        faunaQuery.Update(faunaQuery.Ref(faunaQuery.Collection('Folders'), folderToUpdate.faunaDocumentId), {
            data: convertFolderInFaunaFolderDetails(folderToUpdate)
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

export const moveFolderInFauna = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, folderToMove: Folder, oldParent: string) => {
    faunaClient.query(
        faunaQuery.Update(faunaQuery.Ref(faunaQuery.Collection('Folders'), folderToMove.faunaDocumentId), {
            data: convertFolderInFaunaFolderDetails(folderToMove)
        })
    ).then(() => {
        faunaClient.query(faunaQuery.Call('remove_subfolder_from_folder', folderToMove.faunaDocumentId as string, oldParent))
        faunaClient.query(faunaQuery.Call('add_subfolder_to_folder', folderToMove.faunaDocumentId as string, folderToMove.parent))
    })

}

export const moveProjectInFauna = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, projectToUpdate: Project, oldParent: string) => {
    faunaClient.query(
        faunaQuery.Update(faunaQuery.Ref(faunaQuery.Collection('SimulationProjects'), projectToUpdate.faunaDocumentId), {
            data: {
                ...projectToUpdate
            } as FaunaProjectDetails
        })
    ).then(() => {
        faunaClient.query(faunaQuery.Call('remove_project_from_folder', projectToUpdate.faunaDocumentId as string, oldParent))
        faunaClient.query(faunaQuery.Call('add_project_to_folder', projectToUpdate.faunaDocumentId as string, projectToUpdate.parentFolder as string))
    })

}

export const getSharedSimulationProjects = async (
    faunaClient: faunadb.Client,
    faunaQuery: typeof faunadb.query,
    user: string
) => {
    const response = await faunaClient.query(
        faunaQuery.Select("data",
            faunaQuery.Map(
                faunaQuery.Paginate(
                    faunaQuery.Match(
                        faunaQuery.Index("get_shared_projects_by_user_email"),
                        user
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

export const getSharedFolders = async (
    faunaClient: faunadb.Client,
    faunaQuery: typeof faunadb.query,
    user: string
) => {
    const response = await faunaClient.query(
        faunaQuery.Select("data",
            faunaQuery.Map(
                faunaQuery.Paginate(
                    faunaQuery.Match(
                        faunaQuery.Index("get_shared_folders_by_user_email"),
                        user
                    )
                ),
                faunaQuery.Lambda("folder", {
                    id: faunaQuery.Select(
                        ["ref", "id"],
                        faunaQuery.Get(
                            faunaQuery.Var("folder")
                        )
                    ),
                    folder: faunaQuery.Select(
                        ["data"],
                        faunaQuery.Get(
                            faunaQuery.Var("folder")
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
    return response as FaunaFolder[]
}

export const getFolderByFaunaID = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, faunaID: string) => {
    const response = await faunaClient.query(
        faunaQuery.Select(["data"], faunaQuery.Get(faunaQuery.Match(faunaQuery.Index("get_folder_by_id"), faunaID))),
    )
        .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
        ));
    return { id: faunaID, folder: response } as FaunaFolder
}

export const getProjectByFaunaID = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, faunaID: string) => {
    const response = await faunaClient.query(
        faunaQuery.Select(["data"], faunaQuery.Get(faunaQuery.Match(faunaQuery.Index("get_project_by_id"), faunaID))),
    )
        .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
        ));
    return { id: faunaID, project: response } as FaunaProject
}

export const recursiveUpdateSharingInfoFolderInFauna = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, folderToUpdate: Folder) => {
    let allFolders = recursiveFindFolders(folderToUpdate, [])
    allFolders.forEach(f => updateFolderInFauna(faunaClient, faunaQuery, f))
    let allProjects = takeAllProjectsIn(folderToUpdate)
    allProjects.forEach(p => updateProjectInFauna(faunaClient, faunaQuery, p))
}
