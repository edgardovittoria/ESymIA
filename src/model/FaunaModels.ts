import { CanvasState, UsersState } from "cad-library"
import {Port, Probe, Signal} from "./Port"
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
    simulations: Simulation[],
    screenshot: string | undefined,
    owner: UsersState
    sharedWidth?: UsersState[]
}

export type FaunaFolder = {
    id: string,
    folder: FaunaFolderDetails
}

export type FaunaFolderDetails = {
    name: string,
    owner: UsersState,
    sharedWith: UsersState[],
    projectList: string[],
    subFolders: string[],
    parent: string,
}