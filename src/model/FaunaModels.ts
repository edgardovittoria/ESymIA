import { CanvasState, UsersState } from "cad-library"
import {Port, Probe, Signal} from "./Port"
import { MeshData } from "./Project"
import { Simulation } from "./Simulation"

export type FaunaProject = {
    id: string,
    project: FaunaProjectDetails
}

export type FaunaProjectDetails = {
    name: string,
    description: string,
    model: CanvasState,
    ports: (Port | Probe)[],
    signal: Signal,
    simulation?: Simulation,
    meshData: MeshData,
    screenshot: string | undefined,
    owner: UsersState
    sharedWith?: string[],

}

export type FaunaFolder = {
    id: string,
    folder: FaunaFolderDetails
}

export type FaunaFolderDetails = {
    name: string,
    owner: UsersState,
    sharedWith?: string[],
    projectList: string[],
    subFolders: string[],
    parent: string,
}

export type FaunaUserSharingInfo = {
    user: string,
    sharedFolders: string[],
    sharedProjects: string[]
}