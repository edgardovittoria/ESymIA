import React, {Fragment, useState} from 'react';
import {Dialog, Transition} from "@headlessui/react";
import {useDispatch} from "react-redux";
import {useFaunaQuery} from "cad-library";
import { renameProject } from '../../../../../../store/projectSlice';
import { Project } from '../../../../../../model/Project';
import { updateProjectInFauna } from '../../../../../../faunadb/projectsFolderAPIs';


interface RenameProjectProps {
    projectToRename: Project,
    handleClose: () => void
}

export const RenameProject: React.FC<RenameProjectProps> = (
    {
        projectToRename, handleClose
    }
) => {

    const dispatch = useDispatch()

    const [name, setName] = useState("");

    const {execQuery} = useFaunaQuery()


    return(
        <Transition appear show={true} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25"/>
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <div className="w-1/5 bg-white rounded-lg p-5 shadow-2xl">
                                <h5>Rename Project</h5>
                                <hr className="mb-10"/>
                                <>
                                    <div className="flex items-center">
                                        <span className="w-1/3">Name:</span>
                                        <input type="text"
                                               className="w-full rounded shadow text-black p-1 border-2 border-teal-900"
                                               defaultValue={(projectToRename) && projectToRename.name}
                                               onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="mt-10 flex justify-between">
                                        <button
                                            type="button"
                                            className="button bg-red-500 py-1 px-2 text-white text-sm"
                                            onClick={handleClose}
                                        >
                                            CANCEL
                                        </button>
                                        <button
                                            type="button"
                                            className="button buttonPrimary py-1 px-2 text-sm"
                                            onClick={() => {
                                                dispatch(renameProject({
                                                    projectToRename: projectToRename.faunaDocumentId as string,
                                                    name: name
                                                }))
                                                execQuery(updateProjectInFauna, {
                                                    ...projectToRename,
                                                    name: name
                                                } as Project)
                                                handleClose()
                                            }}
                                        >
                                            RENAME
                                        </button>
                                    </div>
                                </>
                            </div>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )

}