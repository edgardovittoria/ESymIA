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
    removeIDInFolderProjectsList,
    removeIDInSubFoldersList
} from "../../../../../../faunadb/projectsFolderAPIs";
import {Menu, Item, Separator, useContextMenu, Submenu} from 'react-contexify';
import {BiRename, BiShareAlt, BiTrash} from "react-icons/bi";
import {BsFillFolderSymlinkFill} from "react-icons/bs"
import {useDispatch, useSelector} from "react-redux";
import {
    allProjectFoldersSelector,
    moveObject, removeFolder, SelectedFolderSelector,
    selectFolder
} from "../../../../../../store/projectSlice";
import {useFaunaQuery} from "cad-library";
import { Folder } from '../../../../../../model/Folder';
import { Project } from '../../../../../../model/Project';
import { RenameFolder } from './RenameFolder';
import { SearchUserAndShare } from './searchUserAndShare/searchUserAndShare';

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
                dispatch(moveObject({
                    objectToMove: objectToMove,
                    targetFolder: dropTargetFolder.faunaDocumentId as string
                }))
                if ("model" in objectToMove) {
                    execQuery(removeIDInFolderProjectsList, objectToMove.faunaDocumentId, selectedFolder)
                    execQuery(addIDInFolderProjectsList, objectToMove.faunaDocumentId, dropTargetFolder)
                } else {
                    execQuery(removeIDInSubFoldersList, objectToMove.faunaDocumentId, selectedFolder)
                    execQuery(addIDInSubFoldersList, objectToMove.faunaDocumentId, dropTargetFolder)
                }
            }
        }
        setDragDone(false)
    }, [dragDone]);

    const {show,hideAll} = useContextMenu({
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
                                        dispatch(moveObject({
                                            objectToMove: folder,
                                            targetFolder: f.faunaDocumentId as string
                                        }))
                                        execQuery(removeIDInSubFoldersList, folder.faunaDocumentId, selectedFolder)
                                        execQuery(addIDInSubFoldersList, folder.faunaDocumentId, f)
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
                }} >
                    <BiShareAlt
                        className="mr-4 text-primaryColor w-[20px] h-[20px]"
                    />
                    Share
                </Item>
                <Separator/>
                <Item onClick={(p) => {
                    p.event.stopPropagation()
                    let folderIDsToDelete = [folder.faunaDocumentId, ...getAllSubFoldersOfThisOne(folder)]
                    let projectsIDsToDelete = getAllProjectsWithinThisFolder(folder)
                    folderIDsToDelete.forEach(f => execQuery(deleteFolderFromFauna, f))
                    projectsIDsToDelete.forEach(p => execQuery(deleteSimulationProjectFromFauna, p))
                    execQuery(removeIDInSubFoldersList, folder.faunaDocumentId, selectedFolder)
                    dispatch(removeFolder(folder))
                    hideAll()
                }}>
                    <BiTrash
                        className="mr-4 text-primaryColor w-[20px] h-[20px]"
                    />
                    Delete
                </Item>
            </Menu>
        </div>
        {showRename && <RenameFolder folderToRename={folder} handleClose={() => setShowRename(false)}/>}
        {showSearchUser && <SearchUserAndShare setShowSearchUser={setShowSearchUser} folderToShare={folder}/>}
        </>
    )

}