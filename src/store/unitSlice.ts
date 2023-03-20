import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface UnitState {
    units: {unit: string, projectId?: string}[]
}

export const UnitSlice = createSlice({
    name: 'units',
    initialState: {
        units: []
    } as UnitState,
    reducers: {
        addUnit(state: UnitState, action: PayloadAction<{unit: string, projectId?: string}>){
            state.units.push(action.payload)
        },
        removeUnit(state: UnitState, action: PayloadAction<string>){
            state.units = state.units.filter(u => u.projectId !== action.payload)
        }
    }
})

export const {
    addUnit, removeUnit
} = UnitSlice.actions

/*
Selettori
export const ComponentSelector = (state: {: UnitState}) => state..proprietà
*/
export const unitsSelector = (state: {units: UnitState}) => state.units.units
