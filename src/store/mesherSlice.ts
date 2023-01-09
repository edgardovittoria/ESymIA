import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {MesherOutput} from "../model/MesherInputOutput";

export type MesherState = {
    output: MesherOutput | undefined,
    meshGenerated: 'Not Generated' | 'Generated' | 'Generating',
    meshApproved: boolean,
    downloadPercentage: number,
}

export const MesherSlice = createSlice({
    name: 'Mesher',
    initialState: {
        output: undefined,
        meshGenerated: "Not Generated",
        meshApproved: false,
        downloadPercentage: 0
    } as MesherState,
    reducers: {
        //qui vanno inserite le azioni
        setMesherOutput(state: MesherState, action: PayloadAction<MesherOutput>){
            state.output = action.payload
        },
        setMeshGenerated(state: MesherState, action: PayloadAction<'Not Generated' | 'Generated' | 'Generating'>){
            state.meshGenerated = action.payload
        },
        setMeshApproved(state: MesherState, action: PayloadAction<boolean>){
            state.meshApproved = action.payload
        },
        setDownloadPercentage(state: MesherState, action: PayloadAction<number>){
            state.downloadPercentage = action.payload
        }

    },
    extraReducers: {
        //qui inseriamo i metodi : PENDING, FULLFILLED, REJECT utili per la gestione delle richieste asincrone
}
})


export const {
    //qui vanno inserite tutte le azioni che vogliamo esporatare
    setMesherOutput, setMeshGenerated, setMeshApproved, setDownloadPercentage
} = MesherSlice.actions

export const MesherOutputSelector = (state: { mesher : MesherState }) => state.mesher.output;
export const MeshGeneratedSelector = (state: { mesher : MesherState }) => state.mesher.meshGenerated;
export const MeshApprovedSelector = (state: { mesher : MesherState }) => state.mesher.meshApproved;
export const DownloadPercentageSelector = (state: { mesher : MesherState }) => state.mesher.downloadPercentage;
