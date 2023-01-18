import React, {useEffect, useState} from 'react';
import {IoMdFolder} from "react-icons/io";
import {useDrag, useDragDropManager, useDrop} from "react-dnd";
import {
    addIDInFolderProjectsList,
    addIDInSubFoldersList,
    deleteFolderFromFauna,
    deleteSimulationProjectFromFauna,
    getAllProjectsWithinThisFolder,
    getAllSubFoldersOfThisOne,
    moveFolderInFauna,
    removeIDInFolderProjectsList,
    removeIDInSubFoldersList, updateFolderInFauna, updateProjectInFauna
} from "../../../../../../faunadb/projectsFolderAPIs";
import {Menu, Item, Separator, useContextMenu, Submenu} from 'react-contexify';
import {BiRename, BiShareAlt, BiTrash} from "react-icons/bi";
import {BsFillFolderSymlinkFill} from "react-icons/bs"
import {useDispatch, useSelector} from "react-redux";
import {
    allProjectFoldersSelector, moveFolder, moveProject, removeFolder, SelectedFolderSelector,
    selectFolder
} from "../../../../../../store/projectSlice";
import {useFaunaQuery, usersStateSelector} from "cad-library";
import {RenameFolder} from './RenameFolder';
import {SearchUserAndShare} from './searchUserAndShare/searchUserAndShare';
import { Folder, Project } from '../../../../../../model/esymiaModels';

interface DroppableAndDraggableFolderProps {
    folder: Folder,
    path: Folder[],
    setPath: Function
}

export const DroppableAndDraggableFolder: React.FC<DroppableAndDraggableFolderProps> = (
    {
        folder, path, setPath
    }
) => {

    const dispatch = useDispatch()
    const {execQuery} = useFaunaQuery()
    const selectedFolder = useSelector(SelectedFolderSelector) as Folder
    const allProjectFolders = useSelector(allProjectFoldersSelector)
    const user = useSelector(usersStateSelector)
    const [showRename, setShowRename] = useState(false);
    const [showSearchUser, setShowSearchUser] = useState(false);

    const [dragDone, setDragDone] = useState(false);
    const [dropTargetFolder, setDropTargetFolder] = useState({} as Folder);

    const [{isOver}, drop] = useDrop(() => ({
        accept: ['PROJECT', 'FOLDER'],
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
        drop() {
            setDropTargetFolder(folder)
            setDragDone(true)
        }
    }), [selectedFolder.name, selectedFolder.projectList])

    const [{isDragging}, drag] = useDrag(() => ({
        type: 'FOLDER',
        item: folder,
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    }), [selectedFolder.name, selectedFolder.projectList.length])

    let dragAndDropManager = useDragDropManager()

    useEffect(() => {
        if (dragDone) {
            let objectToMove: Project | Folder = dragAndDropManager.getMonitor().getItem()
            if (objectToMove.faunaDocumentId !== dropTargetFolder.faunaDocumentId) {
                if ("model" in objectToMove) {
                    dispatch(moveProject({
                        objectToMove: objectToMove,
                        targetFolder: dropTargetFolder.faunaDocumentId as string
                    }))
                    execQuery(removeIDInFolderProjectsList, objectToMove.faunaDocumentId, selectedFolder)
                    execQuery(updateProjectInFauna, {...objectToMove, parentFolder: dropTargetFolder.faunaDocumentId} as Project)
                    execQuery(addIDInFolderProjectsList, objectToMove.faunaDocumentId, dropTargetFolder)
                } else {
                    dispatch(moveFolder({
                        objectToMove: objectToMove,
                        targetFolder: dropTargetFolder.faunaDocumentId as string
                    }))
                    execQuery(moveFolderInFauna, {...objectToMove, parent: dropTargetFolder.faunaDocumentId} as Folder, objectToMove.parent)
                }
            }
        }
        setDragDone(false)
    }, [dragDone]);

    const {show, hideAll} = useContextMenu({
        id: folder.name,
    });

    function handleContextMenu(event: any) {
        event.preventDefault();
        // dispatch(setProjectToRename(undefined))
        show(event)
    }


    return (
        <>
            <div
                className={`flex items-center py-[5px] px-[10px] border-2 border-gray-300 mt-[10px] ml-[10px] rounded-lg hover:cursor-pointer hover:border-gray-600 w-1/5`}
                ref={ref => {
                    drag(drop(ref))
                }}
                onContextMenu={handleContextMenu}
                key={folder.name}
                role='Dustbin'
                style={{backgroundColor: isOver ? '#e6e6e6' : 'white', opacity: isDragging ? 0.5 : 1}}
                onDoubleClick={() => {
                    setPath([...path, folder])
                    dispatch(selectFolder(folder.faunaDocumentId as string))
                }}>
                <IoMdFolder className="mr-2 w-[35px] h-[35px] text-gray-500"/>
                <span className="font-bold text-base text-gray-500">{folder.name}</span>
                {folder.owner.email === user.email &&
                    <Menu id={folder.name}>
                        <Submenu label={
                            <>
                                <BsFillFolderSymlinkFill
                                    className="mr-4 text-primaryColor w-[20px] h-[20px]"
                                />
                                Move
                            </>
                        }>
                            {allProjectFolders.filter(n => n.faunaDocumentId !== folder.parent && n.faunaDocumentId !== folder.faunaDocumentId).map(f => {
                                return (
                                    <div key={f.faunaDocumentId}>
                                        <Item
                                            onClick={(p) => {
                                                p.event.stopPropagation()                                              
                                                dispatch(moveFolder({
                                                    objectToMove: folder,
                                                    targetFolder: f.faunaDocumentId as string
                                                }))
                                                execQuery(moveFolderInFauna, {...folder, parent: f.faunaDocumentId} as Folder, folder.parent)
                                                hideAll()
                                            }}>{f.name}</Item>
                                    </div>
                                )
                            })}
                        </Submenu>
                        <Item onClick={(p) => {
                            p.event.stopPropagation()
                            // dispatch(setFolderToRename(folder.faunaDocumentId))
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
                        }}>
                            <BiShareAlt
                                className="mr-4 text-primaryColor w-[20px] h-[20px]"
                            />
                            Share
                        </Item>
                        <Separator/>
                        <Item onClick={(p) => {
                            p.event.stopPropagation()
                            execQuery(deleteFolderFromFauna, folder.faunaDocumentId, folder.parent)
                            dispatch(removeFolder(folder))
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
            {showRename && <RenameFolder folderToRename={folder} handleClose={() => setShowRename(false)}/>}
            {showSearchUser && <SearchUserAndShare setShowSearchUser={setShowSearchUser} folderToShare={folder}/>}
        </>
    )

}