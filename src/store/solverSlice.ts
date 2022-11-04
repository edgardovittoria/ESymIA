import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {SolverOutput} from "../model/SolverInputOutput";

export type SolverState = {
    output: SolverOutput | undefined,
    simulationStatus: "notStarted" | "started" | "completed",
    downloadPercentage: number
}

export const SolverSlice = createSlice({
    name: 'solver',
    initialState: {
        output: undefined,
        simulationStatus: "notStarted",
        downloadPercentage: 0
    } as SolverState,
    reducers: {
        setSolverOutput(state: SolverState, action: PayloadAction<SolverOutput>){
            state.output = action.payload
        },
        setSimulationStatus(state: SolverState, action: PayloadAction<"notStarted" | "started" | "completed">){
            state.simulationStatus = action.payload
        },
        setSolverDownloadPercentage(state: SolverState, action: PayloadAction<number>){
            state.downloadPercentage = action.payload
        }
    },
    extraReducers: {
        //qui inseriamo i metodi : PENDING, FULLFILLED, REJECT utili per la gestione delle richieste asincrone
}
})


export const {
    //qui vanno inserite tutte le azioni che vogliamo esporatare
    setSolverOutput, setSimulationStatus, setSolverDownloadPercentage
} = SolverSlice.actions

export const SolverOutputSelector = (state: { solver: SolverState }) => state.solver.output;
export const SimulationStatusSelector = (state: { solver: SolverState }) => state.solver.simulationStatus;
export const SolverDownloadPercentageSelector = (state: { solver: SolverState }) => state.solver.downloadPercentage;
