import React, {} from 'react';
import {
    folderToRenameSelector,
    projectToRenameSelector} from "../../../store/projectSlice";
import {useSelector} from "react-redux";
import {RenameProject} from "./components/RenameProject";
import {RenameFolder} from "./components/RenameFolder";

interface RenameModalProps {
    setShowRename: (v: boolean) => void
}

export const RenameModal: React.FC<RenameModalProps> = (
    {
        setShowRename
    }
) => {
    const projectToRename = useSelector(projectToRenameSelector)
    const folderToRename = useSelector(folderToRenameSelector)


    const handleClose = () => setShowRename(false);

    return (
        <>
            {projectToRename && <RenameProject projectToRename={projectToRename} handleClose={handleClose}/>}
            {folderToRename && <RenameFolder folderToRename={folderToRename} handleClose={handleClose}/>}
        </>
    )

}