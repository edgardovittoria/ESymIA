import React, {useEffect, useMemo, useState} from "react";
import "./App.css";
import "./GlobalColors.css";
import "font-awesome/css/font-awesome.min.css";
import "react-contexify/dist/ReactContexify.css";
import {TabsContainer} from "./application/TabsContainer";
import {
    setFolderOfElementsSharedWithUser,
    setProjectsFolderToUser,
} from "./store/projectSlice";
import {useDispatch, useSelector} from "react-redux";
import {MenuBar} from "./application/MenuBar";
import {DashboardTabsContentFactory} from "./application/dashboardTabsManagement/DashboardTabsContentFactory";
import {SimulationTabsContentFactory} from "./application/simulationTabsManagement/SimulationTabsContentFactory";
import {usersStateSelector, useFaunaQuery} from "cad-library";
import {selectFolder} from "./store/projectSlice";
import {
    constructFolderStructure,
    constructSharedFolderStructure,
    getFoldersByOwner,
    getSharedFolders,
    getSharedSimulationProjects,
    getSimulationProjectsByOwner,
} from "./faunadb/projectsFolderAPIs";
import {tabSelectedSelector} from "./store/tabsAndMenuItemsSlice";
import {ImSpinner} from "react-icons/im";

function App() {
    const dispatch = useDispatch();

    //SELECTORS
    const user = useSelector(usersStateSelector);
    const tabSelected = useSelector(tabSelectedSelector)
    const [loginSpinner, setLoginSpinner] = useState(false)

    const {execQuery} = useFaunaQuery();

    //USE EFFECT
    useEffect(() => {
        if (user.userName) {
            setLoginSpinner(true)
            execQuery(getFoldersByOwner, user.email).then((folders) => {
                execQuery(getSimulationProjectsByOwner, user.email).then((projects) => {
                    let folder = constructFolderStructure(folders, projects);
                    dispatch(setProjectsFolderToUser(folder));
                    dispatch(selectFolder(folder.faunaDocumentId as string));
                    setLoginSpinner(false)
                });
            });
            execQuery(getSharedFolders, user.email).then((folders) => {
                execQuery(getSharedSimulationProjects, user.email).then((projects) => {
                    let folder = constructSharedFolderStructure(folders, projects, user);
                    dispatch(setFolderOfElementsSharedWithUser(folder));
                })
            })
        }
    }, [user.userName]);

    //MEMOIZED COMPONENTS
    const memoizedTabsContainer = useMemo(
        () => <TabsContainer user={user}/>,
        [user]
    );

    return (
        <>
            {loginSpinner &&
                <ImSpinner className={`animate-spin w-12 h-12 absolute left-1/2 top-1/2`}/>
            }
            <div className={`${loginSpinner && 'opacity-40'}`}>
                {memoizedTabsContainer}
                <MenuBar/>
                {tabSelected === "DASHBOARD" ? (
                    <DashboardTabsContentFactory/>
                ) : (
                    <SimulationTabsContentFactory/>
                )}
            </div>
        </>
    );
}

export default App;
