import React from 'react';
import {useDrag} from "react-dnd";
import {Item, Menu, Separator, Submenu, useContextMenu} from "react-contexify";
import {
    addIDInFolderProjectsList,
    deleteSimulationProjectFromFauna,
    removeIDInFolderProjectsList
} from "../../../../../faunadb/projectsFolderAPIs";
import {BiExport, BiRename, BiShareAlt, BiTrash} from "react-icons/bi";
import {BsFillFolderSymlinkFill} from "react-icons/bs";
import {useDispatch, useSelector} from "react-redux";
import {
    allProjectFoldersSelector,
    moveObject,
    removeProject,
    SelectedFolderSelector, setFolderToRename, setProjectToRename, setProjectToShare} from "../../../../../store/projectSlice";
import {useFaunaQuery, usersStateSelector} from "cad-library";
import { Project } from '../../../../../model/Project';

interface DraggableProjectCardProps {
    project: Project,
    projectsTab: Project[],
    setProjectsTab: Function,
    handleCardClick: Function,
    setShowSearchUser: (v:boolean) => void
    setShowRename: (v:boolean) => void
}

export const DraggableProjectCard: React.FC<DraggableProjectCardProps> = (
    {
        project, setProjectsTab, projectsTab, handleCardClick, setShowSearchUser, setShowRename
    }
) => {

    const dispatch = useDispatch()
    const {execQuery} = useFaunaQuery()
    const selectedFolder = useSelector(SelectedFolderSelector)
    const allProjectFolders = useSelector(allProjectFoldersSelector)
    const user = useSelector(usersStateSelector)

    const [{isDragging}, drag, dragPreview] = useDrag(() => ({
        // "type" is required. It is used by the "accept" specification of drop targets.
        type: 'PROJECT',
        item: project,
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    }), [selectedFolder.name, selectedFolder.projectList.length])

    const {show} = useContextMenu({
        id: project.name,
    });

    function handleContextMenu(event: any) {
        event.preventDefault();
        dispatch(setFolderToRename(undefined))
        show(event)
    }

    return (
        <>
            <div
                className="w-[20%] p-[15px] flex flex-col justify-between h-[250px] border-2 border-green-200 mr-6 mt-4 rounded-lg hover:cursor-pointer hover:border-secondaryColor"
                key={project.name} ref={drag}
                onClick={() => handleCardClick(project)}
                style={{opacity: isDragging ? 0.5 : 1}} onContextMenu={handleContextMenu}>
                <h5 className="text-center" role="Handle" ref={dragPreview}>
                    {(project.name.length > 11) ? project.name.substr(0, 11) + '...' : project.name}
                </h5>
                <div>
                    <img className="w-[100%] scale-[2]" alt="project_screenshot"
                         src={(project.screenshot) ? project.screenshot : "/noResultsIconForProject.png"}
                    />
                </div>

                <div>
                    <hr className="mb-3"/>
                    {(project.description.length > 20) ? project.description.substr(0, 20) + '...' : project.description}
                </div>
                <Menu id={project.name}>
                    <Submenu label={
                        <>
                            <BsFillFolderSymlinkFill
                                className="mr-4 text-primaryColor w-[20px] h-[20px]"
                            />
                            Move
                        </>
                    }>
                        {allProjectFolders.filter(n => n.faunaDocumentId !== selectedFolder.faunaDocumentId).map(f => {
                            return (
                                <div key={f.faunaDocumentId}>
                                    <Item onClick={(p) => {
                                        p.event.stopPropagation()
                                        dispatch(moveObject({
                                            objectToMove: project,
                                            targetFolder: f.faunaDocumentId as string
                                        }))
                                        execQuery(removeIDInFolderProjectsList, project.faunaDocumentId, selectedFolder)
                                        execQuery(addIDInFolderProjectsList, project.faunaDocumentId, f)
                                    }}>{f.name}</Item>
                                </div>
                            )
                        })}
                    </Submenu>
                    <Item onClick={(p) => {
                        p.event.stopPropagation()
                        dispatch(setProjectToRename(project))
                        setShowRename(true)
                    }}>
                        <BiRename
                            className="mr-4 text-primaryColor w-[20px] h-[20px]"
                        />
                        Rename
                    </Item>
                    <Separator/>
                    <Item onClick={(p) => {
                        p.event.stopPropagation()
                        exportSimulationProject(project)
                    }}>
                        <BiExport
                            className="mr-4 text-primaryColor w-[20px] h-[20px]"
                        />
                        Export
                    </Item>
                    <Item onClick={(p) => {
                        p.event.stopPropagation()
                        dispatch(setProjectToShare(project))
                        setShowSearchUser(true)
                    }} disabled={user.userRole !== 'Premium'}>
                        <BiShareAlt
                            className="mr-4 text-primaryColor w-[20px] h-[20px]"
                        />
                        Share
                    </Item>
                    <Separator/>
                    <Item onClick={(p) => {
                        p.event.stopPropagation()
                        dispatch(removeProject(project.faunaDocumentId as string))
                        setProjectsTab(projectsTab.filter(p => p.name !== project.name))
                        execQuery(deleteSimulationProjectFromFauna, project.faunaDocumentId)
                        execQuery(removeIDInFolderProjectsList, project.faunaDocumentId, selectedFolder)
                    }}>
                        <BiTrash
                            className="mr-4 text-primaryColor w-[20px] h-[20px]"
                        />
                        Delete
                    </Item>
                </Menu>
            </div>
        </>
    )

}

export const exportSimulationProject = (project: Project) => {
    const link = document.createElement('a');
    link.href = `data:application/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(project)
    )}`
    link.download = project.name + ".json"
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}