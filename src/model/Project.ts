import {CanvasState, UsersState} from "cad-library";
import {Simulation} from "./Simulation";
import {Port, Probe, Signal} from "./Port";

export type Project = {
    name: string,
    description: string,
    model: CanvasState,
    ports: (Port | Probe)[],
    signal: Signal | undefined,
    simulations: Simulation[],
    screenshot: string | undefined,
    owner: UsersState
    sharedWidth?: UsersState[]
    faunaDocumentId?: string
}
