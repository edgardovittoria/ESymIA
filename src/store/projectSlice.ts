import {ComponentEntity, ImportActionParamsObject, UsersState} from 'cad-library';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Project} from "../model/Project";
import {Port, Probe, RLCParams} from "../model/Port";
import {Simulation} from "../model/Simulation";
import {Signal} from "../model/Port";
import {Folder} from "../model/Folder";
import {
    addFolderToStore,
    addProjectToStore,
    moveFolder,
    moveProject,

    recursiveFindFolders, recursiveSelectFolder, removeFolderFromStore, removeProjectFromStore,
    takeAllProjectsIn
} from "./auxiliaryFunctions/managementProjectsAndFoldersFunction";


export type ProjectState = {
    projects: Folder,
    selectedProject: string | undefined,
    selectedFolder: Folder,
    selectedComponent: ComponentEntity[]
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
        selectedComponent: []
    } as ProjectState,
    reducers: {
        addProject(state: ProjectState, action: PayloadAction<Project>) {
            addProjectToStore(state, action.payload)
        },
        setFaunaDocumentId(state: ProjectState, action: PayloadAction<string>) {
            state.projects.faunaDocumentId = action.payload
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
            let selectedProject = findProjectByName(takeAllProjectsIn(state.projects), state.selectedProject)
            if (selectedProject) {
                selectedProject.model = action.payload.canvas
            }
        },
        createSimulation(state: ProjectState, action: PayloadAction<Simulation>) {
            let selectedProject = findProjectByName(takeAllProjectsIn(state.projects), state.selectedProject)
            selectedProject?.simulations.push(action.payload);
            state.projects.projectList.forEach(project => {
                if (project.name === selectedProject?.name) {
                    project.simulations.push(action.payload)
                }
            })
        },
        updateSimulation(state: ProjectState, action: PayloadAction<Simulation>) {
            let selectedProject = findProjectByName(takeAllProjectsIn(state.projects), state.selectedProject)
            if (selectedProject?.simulations) {
                selectedProject.simulations = selectedProject.simulations.filter(s => s.name !== action.payload.name)
                selectedProject.simulations.push(action.payload)
            }
            state.projects.projectList.forEach(project => {
                if (project.name === selectedProject?.name) {
                    project.simulations = selectedProject.simulations
                }
            })
        },
        addPorts(state: ProjectState, action: PayloadAction<Port | Probe>) {
            let selectedProject = findProjectByName(takeAllProjectsIn(state.projects), state.selectedProject)
            selectedProject?.ports.push(action.payload)
        },
        selectPort(state: ProjectState, action: PayloadAction<string>) {
            let selectedProject = findProjectByName(takeAllProjectsIn(state.projects), state.selectedProject)
            selectedProject?.ports.forEach(port => {
                port.isSelected = port.name === action.payload;
            })
        },
        deletePort(state: ProjectState, action: PayloadAction<string>) {
            let selectedProject = findProjectByName(takeAllProjectsIn(state.projects), state.selectedProject)
            let updatedPortsArray = selectedProject?.ports.filter(port => port.name !== action.payload)
            if (selectedProject && updatedPortsArray) {
                selectedProject.ports = updatedPortsArray
            }
        },
        setPortType(state: ProjectState, action: PayloadAction<{ name: string, type: number }>) {
            let selectedProject = findProjectByName(takeAllProjectsIn(state.projects), state.selectedProject)
            selectedProject?.ports.forEach(port => {
                if (port.category === 'port' || port.category === 'lumped') {
                    if (port.name === action.payload.name) {
                        port.type = action.payload.type
                    }
                }
            })
        },
        updatePortPosition(state: ProjectState, action: PayloadAction<{ type: 'first' | 'last' | 'probe', position: [number, number, number] }>) {
            let selectedPort = findSelectedPort(findProjectByName(takeAllProjectsIn(state.projects), state.selectedProject))
            if (selectedPort) {
                if (selectedPort.category === 'port' || selectedPort.category === 'lumped') {
                    (action.payload.type === 'first') ? selectedPort.inputElement.transformationParams.position = action.payload.position : selectedPort.outputElement.transformationParams.position = action.payload.position
                } else if (action.payload.type === 'probe') {
                    (selectedPort as Probe).groupPosition = action.payload.position
                }
            }
        },
        setRLCParams(state: ProjectState, action: PayloadAction<RLCParams>) {
            let selectedPort = findSelectedPort(findProjectByName(takeAllProjectsIn(state.projects), state.selectedProject));
            if (selectedPort) {
                if (selectedPort.category === 'port' || selectedPort.category === 'lumped') {
                    selectedPort.rlcParams = action.payload
                }
            }
        },
        setAssociatedSignal(state: ProjectState, action: PayloadAction<Signal>) {
            /*let selectedPort = findSelectedPort(findProjectByName(takeAllProjectsIn(state.projects), state.selectedProject));
            if (selectedPort) {
                if (selectedPort.category === 'port' || selectedPort.category === 'lumped') {
                    selectedPort.associatedSignal = action.payload
                }
            }*/
            let project = findProjectByName(takeAllProjectsIn(state.projects), state.selectedProject);
            if(project) project.signal = action.payload
        },
        setScreenshot(state: ProjectState, action: PayloadAction<string>) {
            let selectedProject = findProjectByName(takeAllProjectsIn(state.projects), state.selectedProject)
            if (selectedProject) {
                selectedProject.screenshot = action.payload
            }
        }
    },
    extraReducers:
        {
            //qui inseriamo i metodi : PENDING, FULLFILLED, REJECT utili per la gestione delle richieste asincrone
        }
})


export const {
    //qui vanno inserite tutte le azioni che vogliamo esporatare
    addProject, removeProject, importModel, selectProject, createSimulation, updateSimulation, addPorts,
    selectPort, deletePort, setPortType, updatePortPosition, setRLCParams, setAssociatedSignal, setScreenshot, addFolder, selectFolder,
    setProjectsFolderToUser, moveObject, removeFolder
} = ProjectSlice.actions


export const projectsSelector = (state: { projects: ProjectState }) => takeAllProjectsIn(state.projects.projects)
export const folderByIDSelector = (state: {projects: ProjectState}, id: string) => {
    return recursiveFindFolders(state.projects.projects, [] as Folder[]).filter(f => f.faunaDocumentId === id)[0]
}
export const mainFolderSelector = (state: {projects: ProjectState}) => state.projects.projects
export const SelectedFolderSelector = (state: { projects: ProjectState }) => state.projects.selectedFolder;
export const selectedProjectSelector = (state: { projects: ProjectState }) => findProjectByName(takeAllProjectsIn(state.projects.projects), state.projects.selectedProject);
export const selectedComponentSelector = (state: { projects: ProjectState }) => state.projects.selectedComponent;
export const simulationSelector = (state: { projects: ProjectState }) => findProjectByName(takeAllProjectsIn(state.projects.projects), state.projects.selectedProject)?.simulations;
export const findProjectByName = (projects: Project[], name: string | undefined) => {
    return (name !== undefined) ? projects.filter(project => project.name === name)[0] : undefined
}
export const allProjectFoldersSelector = (state: { projects: ProjectState }) => {
    let allFolders: Folder[] = []
    return recursiveFindFolders(state.projects.projects, allFolders) 
}

export const findSelectedPort = (project: Project | undefined) => (project) ? project.ports.filter(port => port.isSelected)[0] : undefined

