import { CanvasState, ComponentEntity, UsersState } from "cad-library"

export type Folder = {
    name: string,
    owner: UsersState,
    sharedWith: sharingInfoUser[],
    projectList: Project[],
    subFolders: Folder[],
    parent: string,
    faunaDocumentId?: string
}


export type sharingInfoUser = {
    userEmail: string,
    read: boolean,
    write: boolean
}


export type Project = {
    name: string,
    description: string,
    model: CanvasState,
    ports: (Port | Probe)[],
    signal: Signal | undefined,
    simulation?: Simulation,
    meshData: MeshData,
    screenshot: string | undefined,
    owner: UsersState
    sharedWith: sharingInfoUser[]
    faunaDocumentId?: string,
    parentFolder?: string
}

export type Port = {
    name: string,
    category: 'port' | 'lumped',
    type: number,
    inputElement: ComponentEntity,
    outputElement: ComponentEntity,
    isSelected: boolean,
    rlcParams: RLCParams,
}

export type TempLumped = {
    value: number
}&Port

export type RLCParams = {
    inductance?: number,
    resistance?: number,
    capacitance?: number,
}

export interface Signal {
    id: string,
    name: string,
    type: string,
    signalValues: SignalValues[]
    powerPort: string | undefined
}

export interface SignalValues {
    freq: number,
    signal: {
        Re: number,
        Im: number
    }
}

export type Probe = {
    name: string,
    category: 'probe',
    isSelected: boolean,
    elements: ComponentEntity[],
    groupPosition: [number, number, number]
}

export type MeshData = {
    mesh?: string,
    meshGenerated: "Not Generated" | "Generated" | "Generating",
    meshApproved: boolean,
    quantum: [number, number, number]
}


export type Simulation = {
    name: string,
    started: string,
    ended: string,
    status: 'Queued' | 'Paused' | 'Completed' | 'Failed'
    results: SolverOutput,
    associatedProject: string
}

export type SolverOutput = {
    matrix_Z: string,
    matrix_S: string,
    matrix_Y: string,
}