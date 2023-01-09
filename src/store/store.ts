import {combineReducers, configureStore} from '@reduxjs/toolkit';
import { UsersSlice } from 'cad-library';
import {ProjectSlice} from "./projectSlice";
import {SolverSlice} from "./solverSlice";


const rootReducer = combineReducers({
  projects: ProjectSlice.reducer,
  solver: SolverSlice.reducer,
  user: UsersSlice.reducer
});

export const store = configureStore({
  reducer: rootReducer
});

export type RootState = ReturnType<typeof store.getState>;


