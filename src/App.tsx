import {useEffect, useMemo, useState} from 'react';
import './App.css';
import './GlobalColors.css'
import 'font-awesome/css/font-awesome.min.css';
import 'react-contexify/dist/ReactContexify.css';
import {TabsContainer} from "./application/tabsContainer/TabsContainer";
import {
    importModel, mainFolderSelector, selectedProjectSelector, setProjectsFolderToUser
} from "./store/projectSlice";
import {Project} from "./model/Project";
import {useDispatch, useSelector} from "react-redux";
import {CreateNewProjectModal} from "./application/modals/createNewProjectModal/CreateNewProjectModal";
import {Simulation} from "./model/Simulation";
import {MenuBar} from './application/tabsContent/menuBar/MenuBar';
import {
    TabsContentProjectManagementFactory
} from './application/tabsContent/tabsContentProjectManagement/factory/TabsContentProjectManagementFactory';
import {
    TabsContentSimulationFactory
} from './application/tabsContent/tabsContentSimulation/factory/TabsContentSimulationFactory';
import {
    ImportActionParamsObject,
    ImportModelFromDBModal,
    usersStateSelector,
    CanvasState,
    useFaunaQuery
} from "cad-library";
import {CreateNewFolderModal} from "./application/modals/createNewFolderModal/CreateNewFolderModal";
import {selectFolder} from "./store/projectSlice";
import {constructFolderStructure, getFoldersByOwner, getSimulationProjectsByOwner} from "./faunadb/api/projectsFolderAPIs";


function App() {

    const dispatch = useDispatch()

    //SELECTORS
    const selectedProject = useSelector(selectedProjectSelector)
    const user = useSelector(usersStateSelector)

    //STATE VARIABLES
    const [tabSelected, setTabSelected] = useState("DASHBOARD");
    const [projectsTab, setProjectsTab] = useState<Project[]>([]);
    const [showCreateNewProjectModal, setShowCreateNewProjectModal] = useState(false);
    const [showCreateNewFolderModal, setShowCreateNewFolderModal] = useState(false);
    const [showModalLoadFromDB, setShowModalLoadFromDB] = useState(false)
    const menuItems = getMenuItemsArrayBasedOnTabType(tabSelected)
    const [menuItemSelected, setMenuItemSelected] = useState(menuItems[0]);
    const [selectedSimulation, setSelectedSimulation] = useState<Simulation | undefined>(undefined);
    const mainFolder = useSelector(mainFolderSelector)
    const [chartVisualizationMode, setChartVisualizationMode] = useState<'grid' | 'full'>("grid");
    

    const {execQuery} = useFaunaQuery()

    //USE EFFECT
    useEffect(() => {
        if (user.userName) {
            execQuery(getFoldersByOwner, user.userName)
                .then(folders => {
                    execQuery(getSimulationProjectsByOwner, user.userName).then(projects => {
                        let folder = constructFolderStructure(folders, projects)
                        dispatch(setProjectsFolderToUser(folder))
                        dispatch(selectFolder(folder.faunaDocumentId as string))
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
        setShowModal={setShowCreateNewProjectModal}
        user={user}
    />, [tabSelected, projectsTab, user]);

    return (
        <>
            {memoizedTabsContainer}
            <MenuBar setMenuItem={setMenuItemSelected} activeMenuItem={menuItemSelected} menuItems={menuItems}/>
            {(tabSelected === 'DASHBOARD')
                ?
                <TabsContentProjectManagementFactory
                    menuItem={menuItemSelected}
                    setShowModal={setShowCreateNewProjectModal}
                    setShowNewFolderModal={setShowCreateNewFolderModal}
                    projectsTab={projectsTab}
                    setProjectsTab={setProjectsTab}
                    selectTab={setTabSelected}
                    setSimulationCoreMenuItemSelected={setMenuItemSelected}
                    setSelectedSimulation={setSelectedSimulation}
                    setMenuItem={setMenuItemSelected}
                />
                :
                <TabsContentSimulationFactory
                    menuItem={menuItemSelected}
                    setMenuItem={setMenuItemSelected}
                    selectedSimulation={selectedSimulation}
                    setSelectedSimulation={setSelectedSimulation}
                    setShowLoadFromDBModal={setShowModalLoadFromDB}
                />
            }
            {(showCreateNewProjectModal) && <CreateNewProjectModal
                setShow={setShowCreateNewProjectModal}
                projectsTab={projectsTab}
                setProjectsTab={setProjectsTab}
                selectTab={setTabSelected}
            />}
            {(showCreateNewFolderModal) && <CreateNewFolderModal setShowNewFolderModal={setShowCreateNewFolderModal}/>}
            {(showModalLoadFromDB) && <ImportModelFromDBModal
                showModalLoad={setShowModalLoadFromDB}
                importAction={importModel}
                importActionParams={
                    {
                        canvas: {
                            components: [],
                            lastActionType: "",
                            numberOfGeneratedKey: 0,
                            selectedComponentKey: 0
                        } as CanvasState,
                        id: selectedProject?.name
                    } as ImportActionParamsObject
                }
            />}
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
