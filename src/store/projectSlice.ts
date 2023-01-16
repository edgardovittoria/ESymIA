import { ImportActionParamsObject, UsersState } from 'cad-library';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from "../model/Project";
import { Port, Probe, RLCParams } from "../model/Port";
import { Simulation } from "../model/Simulation";
import { Signal } from "../model/Port";
import { Folder, sharingInfoUser } from "../model/Folder";
import {
    addFolderToStore,
    addProjectToStore,
    moveFolder,
    moveProject,
    recursiveFindFolders, removeFolderFromStore, removeProjectFromStore,
    takeAllProjectsIn
} from "./auxiliaryFunctions/managementProjectsAndFoldersFunction";
import { addProjectTab, closeProjectTab, selectMenuItem, selectTab } from './tabsAndMenuItemsSlice';
import {deleteFileS3} from "../aws/mesherAPIs";


export type ProjectState = {
    projects: Folder,
    sharedElements: Folder,
    selectedProject: string | undefined,
    selectedFolder: string | undefined,
}

export const ProjectSlice = createSlice({
    name: 'projects',
    initialState: {
        projects: {
            name: "My Files",
            owner: {} as UsersState,
            sharedWith: [],
            subFolders: [],
            projectList: [],
            parent: "root"
        },
        sharedElements: {
            name: "My Shared Elements",
            owner: {} as UsersState,
            sharedWith: [],
            subFolders: [],
            projectList: [],
            parent: "root"
        },
        selectedProject: undefined,
        selectedFolder: undefined,
    } as ProjectState,
    reducers: {
        addProject(state: ProjectState, action: PayloadAction<Project>) {
            addProjectToStore(state, action.payload)
        },
        setProjectsFolderToUser(state: ProjectState, action: PayloadAction<Folder>) {
            state.projects = action.payload
        },
        setFolderOfElementsSharedWithUser(state: ProjectState, action: PayloadAction<Folder>) {
            state.sharedElements = action.payload
        },
        removeProject(state: ProjectState, action: PayloadAction<string>) {
            let project = findProjectByFaunaID(takeAllProjectsIn(state.projects), action.payload)
            deleteFileS3(project?.meshData.mesh as string).catch((err) => console.log(err))
            removeProjectFromStore(state, action.payload)
        },
        moveObject(state: ProjectState, action: PayloadAction<{
            objectToMove: Project | Folder,
            targetFolder: string
        }>) {
            if ("model" in action.payload.objectToMove) {
                moveProject(state, action.payload.objectToMove, action.payload.targetFolder)
            } else {
                moveFolder(state, action.payload.objectToMove, action.payload.targetFolder)
            }
        },
        shareProject(state: ProjectState, action: PayloadAction<{ projectToShare: Project, user: sharingInfoUser }>) {
            let project = findProjectByFaunaID(takeAllProjectsIn(state.projects), action.payload.projectToShare.faunaDocumentId);
            (project && project.sharedWith) && project.sharedWith.push(action.payload.user)
        },
        shareFolder(state: ProjectState, action: PayloadAction<{ folderToShare: string, user: sharingInfoUser }>) {
            let folder = folderByID(state, action.payload.folderToShare);
            if (folder) {
                recursiveFindFolders(folder, []).forEach(f => f.sharedWith.push(action.payload.user));
                takeAllProjectsIn(folder).forEach(f => f.sharedWith.push(action.payload.user));
            }
        },
        renameProject(state: ProjectState, action: PayloadAction<{ projectToRename: string, name: string }>) {
            let project = findProjectByFaunaID(takeAllProjectsIn(state.projects), action.payload.projectToRename);
            let selectedFolder = folderByID(state, project?.parentFolder)
            if (project && selectedFolder) {
                project.name = action.payload.name
                selectedFolder.projectList = selectedFolder.projectList.filter(p => p.faunaDocumentId !== project?.faunaDocumentId)
                selectedFolder.projectList.push(project)
            }
        },
        renameFolder(state: ProjectState, action: PayloadAction<{ folderToRename: Folder, name: string }>) {
            removeFolderFromStore(state, action.payload.folderToRename)
            addFolderToStore(state, {
                ...action.payload.folderToRename,
                name: action.payload.name
            })
        },
        selectProject(state: ProjectState, action: PayloadAction<string | undefined>) {
            if (action.payload !== undefined) {
                state.selectedProject = action.payload
            }
        },
        addFolder(state: ProjectState, action: PayloadAction<Folder>) {
            addFolderToStore(state, action.payload)
        },
        removeFolder(state: ProjectState, action: PayloadAction<Folder>) {
            removeFolderFromStore(state, action.payload)
        },
        selectFolder(state: ProjectState, action: PayloadAction<string>) {
            state.selectedFolder = action.payload
        },
        importModel(state: ProjectState, action: PayloadAction<ImportActionParamsObject>) {
            let selectedProject = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject)
            if (selectedProject) {
                selectedProject.model = action.payload.canvas
            }
        },
        updateSimulation(state: ProjectState, action: PayloadAction<Simulation>) {
            let selectedProject = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject)
            if (selectedProject) selectedProject.simulation = action.payload;
        },
        addPorts(state: ProjectState, action: PayloadAction<Port | Probe>) {
            let selectedProject = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject)
            selectedProject?.ports.push(action.payload)
        },
        selectPort(state: ProjectState, action: PayloadAction<string>) {
            let selectedProject = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject)
            selectedProject?.ports.forEach(port => {
                port.isSelected = port.name === action.payload;
            })
        },
        deletePort(state: ProjectState, action: PayloadAction<string>) {
            let selectedProject = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject)
            let updatedPortsArray = selectedProject?.ports.filter(port => port.name !== action.payload)
            if (selectedProject && updatedPortsArray) {
                selectedProject.ports = updatedPortsArray
            }
        },
        setPortType(state: ProjectState, action: PayloadAction<{ name: string, type: number }>) {
            let selectedProject = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject)
            selectedProject?.ports.forEach(port => {
                if (port.category === 'port' || port.category === 'lumped') {
                    if (port.name === action.payload.name) {
                        port.type = action.payload.type
                    }
                }
            })
        },
        updatePortPosition(state: ProjectState, action: PayloadAction<{ type: 'first' | 'last' | 'probe', position: [number, number, number] }>) {
            let selectedPort = findSelectedPort(findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject))
            if (selectedPort) {
                if (selectedPort.category === 'port' || selectedPort.category === 'lumped') {
                    (action.payload.type === 'first') ? selectedPort.inputElement.transformationParams.position = action.payload.position : selectedPort.outputElement.transformationParams.position = action.payload.position
                } else if (action.payload.type === 'probe') {
                    (selectedPort as Probe).groupPosition = action.payload.position
                }
            }
        },
        setRLCParams(state: ProjectState, action: PayloadAction<RLCParams>) {
            let selectedPort = findSelectedPort(findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject));
            if (selectedPort) {
                if (selectedPort.category === 'port' || selectedPort.category === 'lumped') {
                    selectedPort.rlcParams = action.payload
                }
            }
        },
        setAssociatedSignal(state: ProjectState, action: PayloadAction<Signal>) {
            let project = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject);
            if (project) project.signal = action.payload
        },
        setScreenshot(state: ProjectState, action: PayloadAction<string>) {
            let selectedProject = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject)
            if (selectedProject) {
                selectedProject.screenshot = action.payload
            }
        },
        setQuantum(state: ProjectState, action: PayloadAction<[number, number, number]>) {
            let project = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject);
            if (project) project.meshData.quantum = action.payload
        },
        setMesh(state: ProjectState, action: PayloadAction<string>) {
            let project = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject);
            if (project) project.meshData.mesh = action.payload
        },
        unsetMesh(state: ProjectState) {
            let project = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject);
            if (project) project.meshData.mesh = undefined
        },
        setMeshGenerated(state: ProjectState, action: PayloadAction<"Not Generated" | "Generated" | "Generating">) {
            let project = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject);
            if (project) project.meshData.meshGenerated = action.payload
        },
        setMeshApproved(state: ProjectState, action: PayloadAction<boolean>) {
            let project = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject);
            if (project) project.meshData.meshApproved = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(selectTab, (state, action) => {
                selectTabEffects(state, action.payload)
            })
            .addCase(closeProjectTab, (state) => {
                selectTabEffects(state, "DASHBOARD")
            })
            .addCase(addProjectTab, (state, action) => {
                selectTabEffects(state, action.payload.faunaDocumentId as string)
            })
            .addCase(selectMenuItem, (state, action) => {
                if(action.payload === 'Projects'){
                    state.selectedFolder = state.projects.faunaDocumentId
                }
            })
    }
})


export const {
    //qui vanno inserite tutte le azioni che vogliamo esporatare
    addProject, removeProject, importModel, selectProject, updateSimulation, addPorts,
    selectPort, deletePort, setPortType, updatePortPosition, setRLCParams, setAssociatedSignal, setScreenshot, addFolder, selectFolder,
    setProjectsFolderToUser, moveObject, removeFolder, shareProject, renameProject,
    renameFolder, shareFolder, setQuantum, setMesh, setMeshGenerated, setMeshApproved, setFolderOfElementsSharedWithUser,
    unsetMesh
} = ProjectSlice.actions

const selectTabEffects = (state: ProjectState, tab: string) => {
    if (tab === "DASHBOARD") {
        state.selectedFolder = state.projects.faunaDocumentId
        state.selectedProject = undefined
    }
    else {
        state.selectedProject = tab
    }
}
export const projectsSelector = (state: { projects: ProjectState }) => takeAllProjectsIn(state.projects.projects)
export const folderByIDSelector = (state: { projects: ProjectState }, id: string) => {
    return recursiveFindFolders(state.projects.projects, [] as Folder[]).filter(f => f.faunaDocumentId === id)[0]
}
export const mainFolderSelector = (state: { projects: ProjectState }) => state.projects.projects
export const sharedElementsFolderSelector = (state: { projects: ProjectState }) => state.projects.sharedElements
export const SelectedFolderSelector = (state: { projects: ProjectState }) => folderByID(state.projects, state.projects.selectedFolder);
export const selectedProjectSelector = (state: { projects: ProjectState }) => findProjectByFaunaID(takeAllProjectsIn(state.projects.projects), state.projects.selectedProject);
export const simulationSelector = (state: { projects: ProjectState }) => findProjectByFaunaID(takeAllProjectsIn(state.projects.projects), state.projects.selectedProject)?.simulation;
export const allProjectFoldersSelector = (state: { projects: ProjectState }) => {
    let allFolders: Folder[] = []
    return recursiveFindFolders(state.projects.projects, allFolders)
}
export const findProjectByFaunaID = (projects: Project[], faunaDocumentId: string | undefined) => {
    return (faunaDocumentId !== undefined) ? projects.filter(project => project.faunaDocumentId === faunaDocumentId)[0] : undefined
}
export const findSelectedPort = (project: Project | undefined) => (project) ? project.ports.filter(port => port.isSelected)[0] : undefined
export const folderByID = (state: ProjectState, folderID: string | undefined) => {
    if (folderID) {
        let folders = recursiveFindFolders(state.projects, [] as Folder[]).filter(f => f.faunaDocumentId === folderID)
        if (folders.length > 0) return folders[0]
        folders = recursiveFindFolders(state.sharedElements, [] as Folder[]).filter(f => f.faunaDocumentId === folderID)
        if (folders.length > 0) return folders[0]
    }
    return undefined
}