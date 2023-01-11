import { useEffect, useMemo } from "react";
import "./App.css";
import "./GlobalColors.css";
import "font-awesome/css/font-awesome.min.css";
import "react-contexify/dist/ReactContexify.css";
import { TabsContainer } from "./application/TabsContainer";
import {
	setFolderOfElementsSharedWithUser,
	setProjectsFolderToUser,
} from "./store/projectSlice";
import { useDispatch, useSelector } from "react-redux";
import { MenuBar } from "./application/MenuBar";
import { DashboardTabsContentFactory } from "./application/dashboardTabsManagement/DashboardTabsContentFactory";
import { SimulationTabsContentFactory } from "./application/simulationTabsManagement/SimulationTabsContentFactory";
import { usersStateSelector, useFaunaQuery, UsersState } from "cad-library";
import { selectFolder } from "./store/projectSlice";
import {
	constructFolderStructure,
	getFolderByFaunaID,
	getFoldersByOwner,
	getProjectByFaunaID,
	getSharedSimulationProjects,
	getSharingInfoByUserEmail,
	getSimulationProjectsByOwner,
} from "./faunadb/projectsFolderAPIs";
import { useTabs } from "./contexts/tabsAndMenuitemsHooks";
import {
	FaunaFolder,
	FaunaProject,
	FaunaUserSharingInfo,
} from "./model/FaunaModels";
import { Folder } from "./model/Folder";

function App() {
	const dispatch = useDispatch();

	//SELECTORS
	const user = useSelector(usersStateSelector);

	const { tabSelected } = useTabs();
	const { execQuery } = useFaunaQuery();

	//USE EFFECT
	useEffect(() => {
		if (user.userName) {
			execQuery(getFoldersByOwner, user.email).then((folders) => {
				execQuery(getSimulationProjectsByOwner, user.email).then((projects) => {
					let folder = constructFolderStructure(folders, projects);
					dispatch(setProjectsFolderToUser(folder));
					dispatch(selectFolder(folder.faunaDocumentId as string));
				});
			});
			// let sharedFolders: FaunaFolder[] = [];
			// let sharedProjects: FaunaProject[] = [];
			// execQuery(getSharingInfoByUserEmail, user.email).then((sharingInfo) => {
			// 	(sharingInfo as FaunaUserSharingInfo).sharedFolders.map((folderID) => {
			// 		execQuery(getFolderByFaunaID, folderID).then((folder) =>
			// 			sharedFolders.push(folder)
			// 		);
			// 	});
			// 	(sharingInfo as FaunaUserSharingInfo).sharedProjects.map(
			// 		(projectID) => {
			// 			execQuery(getProjectByFaunaID, projectID).then((project) =>
			// 				sharedProjects.push(project)
			// 			);
			// 		}
			// 	);
			// 	let mainSharedFolderElements = {
			// 		folder: {
			// 			name: "My Shared Elements",
			// 			owner: {} as UsersState,
			// 			sharedWith: [],
			// 			subFolders: [],
			// 			projectList: [],
			// 			parent: "root",
			// 		},
			// 		id: "sharedElementsMainFolder",
			// 	} as FaunaFolder;
			// 	let sharedElementsFolder = constructFolderStructure(
			// 		[mainSharedFolderElements, ...sharedFolders],
			// 		sharedProjects
			// 	);
			// 	dispatch(setFolderOfElementsSharedWithUser(sharedElementsFolder));
			// });
		}
	}, [user.userName]);

	//MEMOIZED COMPONENTS
	const memoizedTabsContainer = useMemo(
		() => <TabsContainer user={user} />,
		[user]
	);

	return (
		<>
			{memoizedTabsContainer}
			<MenuBar />
			{tabSelected === "DASHBOARD" ? (
				<DashboardTabsContentFactory />
			) : (
				<SimulationTabsContentFactory />
			)}
		</>
	);
}

export default App;
