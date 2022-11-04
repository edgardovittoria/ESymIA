import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {MesherOutput} from "../model/MesherInputOutput";

export type MesherState = {
    output: MesherOutput | undefined,
    meshGenerated: 'Not Generated' | 'Generated' | 'Generating',
    meshApproved: boolean,
    numberOfCells: number[],
    downloadPercentage: number,
}

export const MesherSlice = createSlice({
    name: 'Mesher',
    initialState: {
        output: undefined,
        meshGenerated: "Not Generated",
        meshApproved: false,
        numberOfCells: [],
        downloadPercentage: 0
    } as MesherState,
    reducers: {
        //qui vanno inserite le azioni
        setMesherOutput(state: MesherState, action: PayloadAction<MesherOutput>){
            state.output = action.payload
            state.numberOfCells = getNumberOfCells(state)
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
export const NumberOfCellsSelector = (state: { mesher : MesherState }) => state.mesher.numberOfCells;
export const DownloadPercentageSelector = (state: { mesher : MesherState }) => state.mesher.downloadPercentage;

function getNumberOfCells(state: MesherState){
    let numberOfCells: number[] = []
    let matrices: boolean[][][][] = []
    if(state.output){
        Object.values(state.output.mesher_matrices).forEach(matrix => {
            matrices.push(matrix)
        })
        matrices.forEach(matrix => {
            let cells = 0
            matrix.forEach(m => {
                m.forEach(m => {
                    m.forEach(m => {
                        if (m) {
                            cells += 1
                        }
                    })
                })
            })
            numberOfCells.push(cells)
        })
    }
    return numberOfCells
}
