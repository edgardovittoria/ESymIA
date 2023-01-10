import { useContext } from "react"
import { TabsAndMenuItemsContext } from "./tabsAndMenuitemsProvider"

export const useMenuItems = () => {
    const {menuItems, menuItemSelected, selectMenuItem} = useContext(TabsAndMenuItemsContext)
    return {menuItems, menuItemSelected, selectMenuItem}
}

export const useTabs = () => {
    const {selectTab, tabSelected, addProjectTab, projectsTabs, closeProjectTab} = useContext(TabsAndMenuItemsContext)
    return {selectTab, tabSelected, addProjectTab, projectsTabs, closeProjectTab}
}