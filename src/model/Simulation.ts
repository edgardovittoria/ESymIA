import {SolverOutput} from "./SolverInputOutput";

export type Simulation = {
    name: string,
    started: string,
    ended: string,
    status: 'Queued' | 'Paused' | 'Completed' | 'Failed'
    results: SolverOutput,
    associatedProject: string
}