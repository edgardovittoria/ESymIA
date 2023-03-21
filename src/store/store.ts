import {combineReducers, configureStore} from '@reduxjs/toolkit';
import { UsersSlice } from 'cad-library';
import {ProjectSlice} from "./projectSlice";
import {SolverSlice} from "./solverSlice";
import { TabsAndMenuItemsSlice } from './tabsAndMenuItemsSlice';


const rootReducer = combineReducers({
  projects: ProjectSlice.reducer,
  solver: SolverSlice.reducer,
  user: UsersSlice.reducer,
  tabsAndMenuItems: TabsAndMenuItemsSlice.reducer
});

export const store = configureStore({
  reducer: rootReducer
});

export type RootState = ReturnType<typeof store.getState>;


