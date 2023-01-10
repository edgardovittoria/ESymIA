import { ComponentEntity, ImportActionParamsObject, UsersState } from 'cad-library';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from "../model/Project";
import { Port, Probe, RLCParams } from "../model/Port";
import { Simulation } from "../model/Simulation";
import { Signal } from "../model/Port";
import { Folder } from "../model/Folder";
import {
    addFolderToStore,
    addProjectToStore,
    moveFolder,
    moveProject,

    recursiveFindFolders, recursiveSelectFolder, removeFolderFromStore, removeProjectFromStore,
    takeAllProjectsIn
} from "./auxiliaryFunctions/managementProjectsAndFoldersFunction";
import { MesherOutput } from '../model/MesherInputOutput';


export type ProjectState = {
    projects: Folder,
    selectedProject: string | undefined,
    selectedFolder: Folder,
    // selectedComponent: ComponentEntity[]
    projectToShare?: Project,
    projectToRename?: Project
    folderToRename?: Folder,
    folderToShare?: Folder,
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
        selectedProject: undefined,
        selectedFolder: {
            name: "My Files",
            owner: {} as UsersState,
            sharedWith: [],
            subFolders: [],
            projectList: [],
            parent: "root"
        },
        // selectedComponent: []
    } as ProjectState,
    reducers: {
        addProject(state: ProjectState, action: PayloadAction<Project>) {
            addProjectToStore(state, action.payload)
        },
        setProjectsFolderToUser(state: ProjectState, action: PayloadAction<Folder>) {
            state.projects = action.payload
        },
        removeProject(state: ProjectState, action: PayloadAction<string>) {
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
        shareProject(state: ProjectState, action: PayloadAction<{ projectToShare: Project, user: string }>) {
            let project = findProjectByFaunaID(takeAllProjectsIn(state.projects), action.payload.projectToShare.name);
            (project && project.sharedWith) && project.sharedWith.push(action.payload.user)
        },
        shareFolder(state: ProjectState, action: PayloadAction<{ folderToShare: Folder, user: string }>) {
            let folder = recursiveFindFolders(state.projects, []).filter(folder => folder.faunaDocumentId === action.payload.folderToShare.faunaDocumentId)[0];
            (folder && folder.sharedWith) && folder.sharedWith.push(action.payload.user)
        },
        setProjectToShare(state: ProjectState, action: PayloadAction<Project | undefined>) {
            state.projectToShare = action.payload
        },
        setFolderToShare(state: ProjectState, action: PayloadAction<Folder | undefined>) {
            state.folderToShare = action.payload
        },
        renameProject(state: ProjectState, action: PayloadAction<{ projectToRename: Project, name: string }>) {
            let project = findProjectByFaunaID(takeAllProjectsIn(state.projects), action.payload.projectToRename.name);
            if (project) {
                project.name = action.payload.name
                state.selectedFolder.projectList = state.selectedFolder.projectList.filter(p => p.faunaDocumentId !== project?.faunaDocumentId)
                state.selectedFolder.projectList.push(project)
            }
        },
        setFolderToRename(state: ProjectState, action: PayloadAction<Folder | undefined>) {
            state.folderToRename = action.payload
        },
        renameFolder(state: ProjectState, action: PayloadAction<{ folderToRename: Folder, name: string }>) {
            removeFolderFromStore(state, action.payload.folderToRename)
            addFolderToStore(state, {
                ...action.payload.folderToRename,
                name: action.payload.name
            })
        },
        setProjectToRename(state: ProjectState, action: PayloadAction<Project | undefined>) {
            state.projectToRename = action.payload
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
            recursiveSelectFolder(state, state.projects.subFolders, action.payload)
        },
        importModel(state: ProjectState, action: PayloadAction<ImportActionParamsObject>) {
            let selectedProject = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject)
            if (selectedProject) {
                console.log("load model")
                selectedProject.model = action.payload.canvas
            }
        },
        // createSimulation(state: ProjectState, action: PayloadAction<Simulation>) {
        //     let selectedProject = findProjectByName(takeAllProjectsIn(state.projects), state.selectedProject);
        //     if (selectedProject) selectedProject.simulation = action.payload;
        //     // state.projects.projectList.forEach(project => {
        //     //     if (project.name === selectedProject?.name) {
        //     //         project.simulations.push(action.payload)
        //     //     }
        //     // })
        // },
        updateSimulation(state: ProjectState, action: PayloadAction<Simulation>) {
            let selectedProject = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject)
            if (selectedProject) selectedProject.simulation = action.payload;
            // if (selectedProject?.simulations) {
            //     selectedProject.simulations = selectedProject.simulations.filter(s => s.name !== action.payload.name)
            //     selectedProject.simulations.push(action.payload)
            // }
            // state.projects.projectList.forEach(project => {
            //     if (project.name === selectedProject?.name) {
            //         project.simulations = selectedProject.simulations
            //     }
            // })
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
        setQuantum(state: ProjectState, action: PayloadAction<[number, number, number]>){
            let project = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject);
            if (project) project.meshData.quantum = action.payload
        },
        setMesh(state: ProjectState, action: PayloadAction<string>){
            let project = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject);
            if (project) project.meshData.mesh = action.payload
        },
        setDownloadPercentage(state: ProjectState, action: PayloadAction<number>){
            let project = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject);
            if (project) project.meshData.downloadPercentage = action.payload
        },
        setMeshGenerated(state: ProjectState, action: PayloadAction<"Not Generated" | "Generated" | "Generating">){
            let project = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject);
            if (project) project.meshData.meshGenerated = action.payload
        },
        setMeshApproved(state: ProjectState, action: PayloadAction<boolean>){
            let project = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject);
            if (project) project.meshData.meshApproved = action.payload
        },
    },
    extraReducers:
    {
        //qui inseriamo i metodi : PENDING, FULLFILLED, REJECT utili per la gestione delle richieste asincrone
    }
})


export const {
    //qui vanno inserite tutte le azioni che vogliamo esporatare
    addProject, removeProject, importModel, selectProject, updateSimulation, addPorts,
    selectPort, deletePort, setPortType, updatePortPosition, setRLCParams, setAssociatedSignal, setScreenshot, addFolder, selectFolder,
    setProjectsFolderToUser, moveObject, removeFolder, shareProject, setProjectToShare, renameProject, setProjectToRename,
    renameFolder, setFolderToRename, setFolderToShare, shareFolder, setQuantum, setMesh, setDownloadPercentage, setMeshGenerated, setMeshApproved
} = ProjectSlice.actions


export const projectsSelector = (state: { projects: ProjectState }) => takeAllProjectsIn(state.projects.projects)
export const folderByIDSelector = (state: { projects: ProjectState }, id: string) => {
    return recursiveFindFolders(state.projects.projects, [] as Folder[]).filter(f => f.faunaDocumentId === id)[0]
}
export const mainFolderSelector = (state: { projects: ProjectState }) => state.projects.projects
export const SelectedFolderSelector = (state: { projects: ProjectState }) => state.projects.selectedFolder;
export const selectedProjectSelector = (state: { projects: ProjectState }) => findProjectByFaunaID(takeAllProjectsIn(state.projects.projects), state.projects.selectedProject);
// export const selectedComponentSelector = (state: { projects: ProjectState }) => state.projects.selectedComponent;
export const simulationSelector = (state: { projects: ProjectState }) => findProjectByFaunaID(takeAllProjectsIn(state.projects.projects), state.projects.selectedProject)?.simulation;
export const projectToShareSelector = (state: { projects: ProjectState }) => state.projects.projectToShare
export const folderToShareSelector = (state: { projects: ProjectState }) => state.projects.folderToShare
export const projectToRenameSelector = (state: { projects: ProjectState }) => state.projects.projectToRename
export const folderToRenameSelector = (state: { projects: ProjectState }) => state.projects.folderToRename
export const allProjectFoldersSelector = (state: { projects: ProjectState }) => {
    let allFolders: Folder[] = []
    return recursiveFindFolders(state.projects.projects, allFolders)
}
export const findProjectByFaunaID = (projects: Project[], faunaDocumentId: string | undefined) => {
    return (faunaDocumentId !== undefined) ? projects.filter(project => project.faunaDocumentId === faunaDocumentId)[0] : undefined
}
export const findSelectedPort = (project: Project | undefined) => (project) ? project.ports.filter(port => port.isSelected)[0] : undefined
