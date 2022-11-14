import React, {Fragment, useState} from 'react';
import {Dialog, Transition} from "@headlessui/react";
import {ImSpinner} from "react-icons/im";
import {SearchUser} from "../searchUserAndShare/components/SearchUser";
import {
    folderToRenameSelector,
    projectToRenameSelector,
    renameProject,
    shareProject
} from "../../../store/projectSlice";
import {Project} from "../../../model/Project";
import {
    addIDInFolderProjectsListOfSharedUser,
    getFoldersByOwner,
    updateProjectInFauna
} from "../../../faunadb/api/projectsFolderAPIs";
import {useDispatch, useSelector} from "react-redux";
import {useFaunaQuery} from "cad-library";
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