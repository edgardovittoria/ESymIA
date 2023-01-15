import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Project } from '../model/Project';

const getMenuItemsArrayBasedOnTabType = (tabType: string) => {
    switch (tabType) {
        case "DASHBOARD":
            return ["Overview", "Projects", "Simulations"];
        default:
            return ["Modeler", "Physics", "Simulator", "Results"];
    }
};

type TabsAndMenuItemsState = {
    tabSelected: string;
    projectsTabs: Project[];
    menuItems: string[];
    menuItemSelected: string;
}

export const TabsAndMenuItemsSlice = createSlice({
    name: 'tabsAndMenuItems',
    initialState: {
        tabSelected: "DASHBOARD",
        menuItems: getMenuItemsArrayBasedOnTabType("DASHBOARD"),
        menuItemSelected: "Overview",
        projectsTabs: []
    } as TabsAndMenuItemsState,
    reducers: {
        selectTab(state: TabsAndMenuItemsState, action: PayloadAction<string>) {
            setTab(state, action.payload)
        },
        addProjectTab(state: TabsAndMenuItemsState, action: PayloadAction<Project>) {
            if (!(state.projectsTabs.filter((projectTab) => projectTab.faunaDocumentId === action.payload.faunaDocumentId).length > 0)) {
                state.projectsTabs.push(action.payload)
            }
            setTab(state, action.payload.faunaDocumentId as string)
        },
        closeProjectTab(state: TabsAndMenuItemsState, action: PayloadAction<string>) {
            state.projectsTabs = state.projectsTabs.filter((projectTab) => projectTab.faunaDocumentId !== action.payload)
            setTab(state, "DASHBOARD")
        },
        selectMenuItem(state: TabsAndMenuItemsState, action: PayloadAction<string>) {
            state.menuItemSelected = action.payload
        },
    }
});

export const { selectTab, addProjectTab, closeProjectTab, selectMenuItem } = TabsAndMenuItemsSlice.actions


const setTab = (state: TabsAndMenuItemsState, tab: string) => {
    state.tabSelected = tab
    state.menuItems = getMenuItemsArrayBasedOnTabType(tab)
    if (tab === "DASHBOARD" || state.menuItemSelected !== "Results") {
        state.menuItemSelected = state.menuItems[0]
    }
}
export const tabSelectedSelector = (state: { tabsAndMenuItems: TabsAndMenuItemsState }) => state.tabsAndMenuItems.tabSelected
export const menuItemsSelector = (state: { tabsAndMenuItems: TabsAndMenuItemsState }) => state.tabsAndMenuItems.menuItems
export const selectedMenuItemSelector = (state: { tabsAndMenuItems: TabsAndMenuItemsState }) => state.tabsAndMenuItems.menuItemSelected
export const projectsTabsSelector = (state: { tabsAndMenuItems: TabsAndMenuItemsState }) => state.tabsAndMenuItems.projectsTabs
