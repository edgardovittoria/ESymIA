import React, {useState} from 'react';
import {Project} from "../../../../../../model/Project";
import {DraggableProjectCard} from "./components/DraggableProjectCard";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DroppableAndDraggableFolder} from "./components/DroppableAndDraggableFolder";
import {useDispatch, useSelector} from 'react-redux';
import {
    mainFolderSelector,
    SelectedFolderSelector, selectFolder,
    selectProject
} from '../../../../../../store/projectSlice';

interface ProjectsProps {
    setShowModal: Function,
    setShowNewFolderModal: Function,
    projectsTab: Project[],
    setProjectsTab: Function,
    selectTab: Function,
}

export const Projects: React.FC<ProjectsProps> = (
    {
        setShowModal, setShowNewFolderModal, projectsTab, setProjectsTab, selectTab
    }
) => {

    const dispatch = useDispatch()
    const mainFolder = useSelector(mainFolderSelector)
    const selectedFolder = useSelector(SelectedFolderSelector)
    const [path, setPath] = useState([mainFolder]);

    const handleCardClick = (project: Project) => {
        if (!(projectsTab.filter(projectTab => projectTab.name === project.name).length > 0)) {
            setProjectsTab(projectsTab.concat(project))
        }
        dispatch(selectProject(project.name))
        selectTab(project.name)
    }

    let projects = selectedFolder.projectList;
    let folders = selectedFolder.subFolders


    return (
        <DndProvider backend={HTML5Backend}>
            <div className="box w-full h-full">
                <div className="flex pt-2">
                    <div className="w-3/5">
                        <h5>Files</h5>
                    </div>
                    <div
                        className={`w-1/5 text-end text-primaryColor hover:text-secondaryColor hover:cursor-pointer hover:underline`}
                        onClick={() => setShowModal(true)}
                    >+ New Project
                    </div>
                    <div
                        className={`w-1/5 text-center text-primaryColor hover:text-secondaryColor hover:cursor-pointer hover:underline`}
                        onClick={() => setShowNewFolderModal(true)}
                    >+ New Folder
                    </div>
                </div>

                <div className="p-[12px] text-[18px]">
                    <hr/>
                    {path.map((p, index) => {
                        return (
                            <div className="inline-block ml-2" key={index}>
                                {index !== path.length - 1 ?
                                    <div>
                                        <span
                                            className="hover:underline hover:cursor-pointer"
                                            onClick={() => {
                                                let newPath = path.filter((p, i) => i <= index);
                                                setPath(newPath);
                                                dispatch(selectFolder(p.faunaDocumentId as string));
                                            }}>
                                                {p.name}
                                        </span>
                                        <span>{' '}&gt;{' '}</span>
                                    </div> :
                                    <span className="font-bold">{p.name}</span>
                                }
                            </div>

                        )
                    })}
                    <hr/>
                </div>

                <div className="w-full text-left overflow-scroll overflow-x-hidden p-[20px] h-[80%]">
                    {projects.length > 0 || folders.length > 0
                        ?
                        <>
                            <div className="flex flex-wrap ">
                                {folders.length > 0 && <h5 className="w-[100%]">Folders</h5>}
                                {folders.map((folder) => {
                                    return (
                                        <DroppableAndDraggableFolder key={folder.faunaDocumentId} folder={folder} path={path} setPath={setPath}/>
                                    )
                                })}
                            </div>
                            <div className={`flex flex-wrap mt-4`}>
                                {projects.length > 0 && <h5 className="w-[100%]">Projects</h5>}
                                {projects.map(project => {
                                    return (
                                        <DraggableProjectCard project={project} projectsTab={projectsTab}
                                                              setProjectsTab={setProjectsTab}
                                                              handleCardClick={handleCardClick}
                                                              key={project.faunaDocumentId}
                                        />
                                    )
                                })}
                            </div>
                        </>

                        :
                        <>
                            <div className="text-center p-[20px]">
                                <img src="/noProjectsIcon2.png" className="my-[50px] mx-auto"
                                     alt="No Projects Icon"/>
                                <p>No projects for now.</p>
                                <button className="button buttonPrimary" data-toggle="modal"
                                        data-target="#createNewProjectModal"
                                        onClick={() => {
                                            setShowModal(true)
                                        }}>CREATE YOUR FIRST PROJECT
                                </button>
                            </div>
                        </>

                    }
                </div>
            </div>
        </DndProvider>

    )

}