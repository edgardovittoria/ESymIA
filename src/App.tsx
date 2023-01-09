import {useEffect, useMemo, useState} from 'react';
import './App.css';
import './GlobalColors.css'
import 'font-awesome/css/font-awesome.min.css';
import 'react-contexify/dist/ReactContexify.css';
import {TabsContainer} from "./application/TabsContainer";
import {
    mainFolderSelector, setProjectsFolderToUser
} from "./store/projectSlice";
import {Project} from "./model/Project";
import {useDispatch, useSelector} from "react-redux";
import {MenuBar} from './application/MenuBar';
import {
    DashboardTabsContentFactory
} from './application/dashboardTabsManagement/DashboardTabsContentFactory';
import {
    SimulationTabsContentFactory
} from './application/simulationTabsManagement/SimulationTabsContentFactory';
import {
    usersStateSelector,
    useFaunaQuery
} from "cad-library";
import {selectFolder} from "./store/projectSlice";
import {
    constructFolderStructure,
    getFoldersByOwner,
    getSharedSimulationProjects,
    getSimulationProjectsByOwner
} from "./faunadb/projectsFolderAPIs";

function App() {

    const dispatch = useDispatch()

    //SELECTORS
    const user = useSelector(usersStateSelector)

    //STATE VARIABLES
    const [tabSelected, setTabSelected] = useState("DASHBOARD");
    const [projectsTab, setProjectsTab] = useState<Project[]>([]);
    const menuItems = getMenuItemsArrayBasedOnTabType(tabSelected)
    const [menuItemSelected, setMenuItemSelected] = useState(menuItems[0]);
    const mainFolder = useSelector(mainFolderSelector)
    const {execQuery} = useFaunaQuery()

    //USE EFFECT
    useEffect(() => {
        if (user.userName) {
            execQuery(getFoldersByOwner, user.email)
                .then(folders => {
                    execQuery(getSimulationProjectsByOwner, user.email).then(projects => {
                        execQuery(getSharedSimulationProjects, user.email).then(sharedProjects => {
                            let allProjects = [...projects, ...sharedProjects]
                            let folder = constructFolderStructure(folders, allProjects)
                            dispatch(setProjectsFolderToUser(folder))
                            dispatch(selectFolder(folder.faunaDocumentId as string))
                        })

                    })
                })
        }
    }, [user.userName]);

    useEffect(() => {
        if (tabSelected === "DASHBOARD") {
            setMenuItemSelected(menuItems[0])
            dispatch(selectFolder(mainFolder.faunaDocumentId as string))
        } else if (menuItemSelected !== 'Results') {
            setMenuItemSelected(menuItems[0])
        }
    }, [tabSelected])


    //MEMOIZED COMPONENTS
    const memoizedTabsContainer = useMemo(() => <TabsContainer
        selectTab={setTabSelected}
        selectedTab={tabSelected}
        projectsTab={projectsTab}
        setProjectsTab={setProjectsTab}
        user={user}
    />, [tabSelected, projectsTab, user]);

    return (
        <>
            {memoizedTabsContainer}
            <MenuBar setMenuItem={setMenuItemSelected} activeMenuItem={menuItemSelected} menuItems={menuItems}/>
            {(tabSelected === 'DASHBOARD')
                ?
                <DashboardTabsContentFactory
                    menuItem={menuItemSelected}
                    projectsTab={projectsTab}
                    setProjectsTab={setProjectsTab}
                    selectTab={setTabSelected}
                    setSimulationCoreMenuItemSelected={setMenuItemSelected}
                    setMenuItem={setMenuItemSelected}
                />
                :
                <SimulationTabsContentFactory
                    menuItem={menuItemSelected}
                    setMenuItem={setMenuItemSelected}
                />
            }
        </>


    );
}

const getMenuItemsArrayBasedOnTabType = (tabType: string) => {
    switch (tabType) {
        case "DASHBOARD":
            return ['Overview', 'Projects', 'Simulations']
        default:
            return ['Modeler', 'Physics', 'Simulator', 'Results']
    }
}

export default App;
