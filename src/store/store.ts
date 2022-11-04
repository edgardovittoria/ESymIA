import {combineReducers, configureStore} from '@reduxjs/toolkit';
import { UsersSlice } from 'cad-library';
import {ProjectSlice} from "./projectSlice";
import {MesherSlice} from "./mesherSlice";
import {SolverSlice} from "./solverSlice";


const rootReducer = combineReducers({
  projects: ProjectSlice.reducer,
  mesher: MesherSlice.reducer,
  solver: SolverSlice.reducer,
  user: UsersSlice.reducer
});

export const store = configureStore({
  reducer: rootReducer
});

export type RootState = ReturnType<typeof store.getState>;


