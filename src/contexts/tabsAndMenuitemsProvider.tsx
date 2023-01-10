import { createContext, FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Project } from "../model/Project";
import { mainFolderSelector, selectFolder } from "../store/projectSlice";

const getMenuItemsArrayBasedOnTabType = (tabType: string) => {
  switch (tabType) {
    case "DASHBOARD":
      return ["Overview", "Projects", "Simulations"];
    default:
      return ["Modeler", "Physics", "Simulator", "Results"];
  }
};

export type TabsAndMenuItemsContextType = {
  tabSelected: string;
  selectTab: Function;
  projectsTabs: Project[];
  addProjectTab: Function;
  closeProjectTab: Function;
  menuItems: string[];
  menuItemSelected: string;
  selectMenuItem: Function;
};

export const TabsAndMenuItemsContext =
  createContext<TabsAndMenuItemsContextType>({
    tabSelected: "DASHBOARD",
    menuItems: getMenuItemsArrayBasedOnTabType("DASHBOARD"),
    addProjectTab: (f: any) => f,
    menuItemSelected: "Overview",
    projectsTabs: [],
    selectMenuItem: (f: any) => f,
    selectTab: (f: any) => f,
    closeProjectTab: (f: any) => f
  });

export const TabsAndMenuItemsContextProvider: FC<{}> = ({ children }) => {
  const [tabSelected, selectTab] = useState("DASHBOARD");
  const [projectsTabs, setProjectsTabs] = useState<Project[]>([]);
  const menuItems = getMenuItemsArrayBasedOnTabType(tabSelected);
  const [menuItemSelected, selectMenuItem] = useState(menuItems[0]);
  const mainFolder = useSelector(mainFolderSelector)
  const dispatch = useDispatch()

  const addProjectTab = (project: Project) => {
    if (!(projectsTabs.filter((projectTab) => projectTab.faunaDocumentId === project.faunaDocumentId).length > 0)) {
      setProjectsTabs(projectsTabs.concat(project));
    }
  };

  const closeProjectTab = (projectID: string) => {
    setProjectsTabs(
      projectsTabs.filter(
        (projectTab) => projectTab.faunaDocumentId !== projectID
      )
    );
    selectTab("DASHBOARD");
  };

  useEffect(() => {
    if (tabSelected === "DASHBOARD") {
        selectMenuItem(menuItems[0])
        dispatch(selectFolder(mainFolder.faunaDocumentId as string))
    } else if (menuItemSelected !== 'Results') {
        selectMenuItem(menuItems[0])
    }
}, [tabSelected])

  return (
    <TabsAndMenuItemsContext.Provider
      value={
        {
          tabSelected: tabSelected,
          selectTab: selectTab,
          addProjectTab: addProjectTab,
          menuItems: menuItems,
          menuItemSelected: menuItemSelected,
          projectsTabs: projectsTabs,
          selectMenuItem: selectMenuItem,
          closeProjectTab: closeProjectTab
        } as TabsAndMenuItemsContextType
      }
    >
      {children}
    </TabsAndMenuItemsContext.Provider>
  );
};
