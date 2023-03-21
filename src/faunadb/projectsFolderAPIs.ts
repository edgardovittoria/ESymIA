import faunadb from "faunadb";
import { Folder, Project } from "../model/esymiaModels";
import { FaunaFolder, FaunaFolderDetails, FaunaProject, FaunaProjectDetails } from "../model/FaunaModels";
import {
    recursiveFindFolders,
    takeAllProjectsIn
} from "../store/auxiliaryFunctions/managementProjectsAndFoldersFunction";
import { convertInFaunaFolderDetailsThis, convertInFaunaProjectThis } from "./apiAuxiliaryFunctions";



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
            (projects as string[]).forEach(p => faunaClient.query(faunaQuery.Delete(faunaQuery.Ref(faunaQuery.Collection('SimulationProjects'), p))));
            (oldParent !== 'root') && faunaClient.query(faunaQuery.Call('remove_subfolder_from_folder', folderToDelete, oldParent))
        })
    })
}

export const addIDInSubFoldersList = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, folderFaunaID: string, selectedFolder: Folder) => {
    let folder = convertInFaunaFolderDetailsThis(selectedFolder)
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
    let folder = convertInFaunaFolderDetailsThis(selectedFolder)
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
        (parentFolder !== 'root') && faunaClient.query(faunaQuery.Call('remove_project_from_folder', projectToDelete, parentFolder))
    }
    )
}


export const removeIDInFolderProjectsList = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, projectFaunaID: string, selectedFolder: Folder) => {
    let folder = convertInFaunaFolderDetailsThis(selectedFolder)
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
    let folder = convertInFaunaFolderDetailsThis(selectedFolder)
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

export const updateProjectInFauna = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, projectToUpdate: FaunaProject) => {
    const response = await faunaClient.query(
        faunaQuery.Update(faunaQuery.Ref(faunaQuery.Collection('SimulationProjects'), projectToUpdate.id), {
            data: projectToUpdate.project
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
            data: convertInFaunaFolderDetailsThis(folderToUpdate)
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
            data: convertInFaunaFolderDetailsThis(folderToMove)
        })
    ).then(() => {
        (oldParent !== 'root') && faunaClient.query(faunaQuery.Call('remove_subfolder_from_folder', folderToMove.faunaDocumentId as string, oldParent));
        (folderToMove.parent !== 'root') && faunaClient.query(faunaQuery.Call('add_subfolder_to_folder', folderToMove.faunaDocumentId as string, folderToMove.parent))
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
        (oldParent !== 'root') && faunaClient.query(faunaQuery.Call('remove_project_from_folder', projectToUpdate.faunaDocumentId as string, oldParent));
        (projectToUpdate.parentFolder !== 'root') && faunaClient.query(faunaQuery.Call('add_project_to_folder', projectToUpdate.faunaDocumentId as string, projectToUpdate.parentFolder))
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

export const recursiveUpdateSharingInfoFolderInFauna = async (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, folderToUpdate: Folder) => {
    let allFolders = recursiveFindFolders(folderToUpdate, [])
    allFolders.forEach(f => updateFolderInFauna(faunaClient, faunaQuery, f))
    let allProjects = takeAllProjectsIn(folderToUpdate)
    allProjects.forEach(p => updateProjectInFauna(faunaClient, faunaQuery, convertInFaunaProjectThis(p)))
}