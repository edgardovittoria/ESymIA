import { CanvasState, UsersState } from "cad-library";
import { Simulation } from "./Simulation";
import { Port, Probe, Signal } from "./Port";
import { sharingInfoUser } from "./Folder";

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

export type MeshData = {
    mesh?: string,
    meshGenerated: "Not Generated" | "Generated" | "Generating",
    meshApproved: boolean,
    downloadPercentage: number,
    quantum: [number, number, number]
}
