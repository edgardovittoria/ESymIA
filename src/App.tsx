import {useEffect, useMemo} from 'react';
import './App.css';
import './GlobalColors.css'
import 'font-awesome/css/font-awesome.min.css';
import 'react-contexify/dist/ReactContexify.css';
import {TabsContainer} from "./application/TabsContainer";
import {
    setProjectsFolderToUser
} from "./store/projectSlice";
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
import { useTabs } from './contexts/tabsAndMenuitemsHooks';

function App() {

    const dispatch = useDispatch()

    //SELECTORS
    const user = useSelector(usersStateSelector)

    const {tabSelected} = useTabs()
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


    //MEMOIZED COMPONENTS
    const memoizedTabsContainer = useMemo(() => <TabsContainer
        user={user}
    />, [user]);

    return (
        <>
            {memoizedTabsContainer}
            <MenuBar />
            {(tabSelected === 'DASHBOARD')
                ?
                <DashboardTabsContentFactory />
                :
                <SimulationTabsContentFactory />
            }
        </>


    );
}

export default App;
