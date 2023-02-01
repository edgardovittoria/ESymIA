import React, {useState} from 'react';
import {useDrag} from "react-dnd";
import {Item, Menu, Separator, Submenu, useContextMenu} from "react-contexify";
import {
    deleteSimulationProjectFromFauna,
    moveProjectInFauna,
} from "../../../../../../faunadb/projectsFolderAPIs";
import {BiRename, BiShareAlt, BiTrash} from "react-icons/bi";
import {BsFillFolderSymlinkFill} from "react-icons/bs";
import {useDispatch, useSelector} from "react-redux";
import {
    allProjectFoldersSelector,
    moveProject,
    removeProject,
    SelectedFolderSelector
} from "../../../../../../store/projectSlice";
import {useFaunaQuery, usersStateSelector} from "cad-library";
import {RenameProject} from './RenameProject';
import {SearchUserAndShare} from './searchUserAndShare/searchUserAndShare';
import {addProjectTab, closeProjectTab} from '../../../../../../store/tabsAndMenuItemsSlice';
import { Folder, Project } from '../../../../../../model/esymiaModels';

interface DraggableProjectCardProps {
    project: Project,
}

export const DraggableProjectCard: React.FC<DraggableProjectCardProps> = (
    {
        project
    }
) => {
    const dispatch = useDispatch()
    const {execQuery} = useFaunaQuery()
    const selectedFolder = useSelector(SelectedFolderSelector) as Folder
    const allProjectFolders = useSelector(allProjectFoldersSelector)
    const user = useSelector(usersStateSelector)
    const [showRename, setShowRename] = useState(false);
    const [showSearchUser, setShowSearchUser] = useState(false);

    const [{isDragging}, drag, dragPreview] = useDrag(() => ({
        // "type" is required. It is used by the "accept" specification of drop targets.
        type: 'PROJECT',
        item: project,
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    }), [selectedFolder.name, selectedFolder.projectList.length])

    const {show, hideAll} = useContextMenu({
        id: project.name,
    });

    function handleContextMenu(event: any) {
        event.preventDefault();
        show(event)
    }

    return (
        <>
            <div
                className="w-[20%] p-[15px] flex flex-col justify-between h-[250px] border-2 border-green-200 mr-6 mt-4 rounded-lg hover:cursor-pointer hover:border-secondaryColor"
                key={project.name} ref={drag}
                onClick={() => dispatch(addProjectTab(project))}
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
                {project.owner.email === user.email &&
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
                                            dispatch(moveProject({
                                                objectToMove: project,
                                                targetFolder: f.faunaDocumentId as string
                                            }))
                                            execQuery(moveProjectInFauna, {...project, parentFolder: f.faunaDocumentId} as Project, project.parentFolder)
                                            hideAll()
                                        }}>{f.name}</Item>
                                    </div>
                                )
                            })}
                        </Submenu>
                        <Item onClick={(p) => {
                            p.event.stopPropagation()
                            setShowRename(true)
                            hideAll()
                        }}>
                            <BiRename
                                className="mr-4 text-primaryColor w-[20px] h-[20px]"
                            />
                            Rename
                        </Item>
                        <Separator/>
                        <Item onClick={(p) => {
                            p.event.stopPropagation()
                            setShowSearchUser(true)
                            hideAll()
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
                            dispatch(closeProjectTab(project.faunaDocumentId as string))
                            execQuery(deleteSimulationProjectFromFauna, project.faunaDocumentId, project.parentFolder)
                            hideAll()
                        }}>
                            <BiTrash
                                className="mr-4 text-primaryColor w-[20px] h-[20px]"
                            />
                            Delete
                        </Item>
                    </Menu>
                }
            </div>
            {showRename && <RenameProject projectToRename={project} handleClose={() => setShowRename(false)}/>}
            {showSearchUser && <SearchUserAndShare setShowSearchUser={setShowSearchUser} projectToShare={project}/>}
        </>
    )

}
