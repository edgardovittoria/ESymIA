import {createSlice} from '@reduxjs/toolkit';


export type SharingInfoState = {

}

export const SharingInfoSlice = createSlice({
    name: 'sharingInfoSlice',
    initialState: {

    } as SharingInfoState,
    reducers: {
        //qui vanno inserite le azioni
    },
    extraReducers: {
        //qui inseriamo i metodi : PENDING, FULLFILLED, REJECT utili per la gestione delle richieste asincrone
}
})


export const {
    //qui vanno inserite tutte le azioni che vogliamo esporatare

} = SharingInfoSlice.actions

//export const StateSelector = (state: { : SharingInfoState }) => state.;
