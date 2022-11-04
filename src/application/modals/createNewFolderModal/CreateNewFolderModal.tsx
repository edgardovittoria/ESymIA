import React, {Fragment, useState} from 'react';
import {useFaunaQuery, usersStateSelector} from "cad-library";
import {Folder} from "../../../model/Folder";
import {createFolderInFauna, addIDInSubFoldersList} from "../../../faunadb/api/projectsFolderAPIs";
import {useDispatch, useSelector} from "react-redux";
import {addFolder, SelectedFolderSelector} from "../../../store/projectSlice";
import {Dialog, Transition} from "@headlessui/react";

interface CreateNewFolderModalProps {
    setShowNewFolderModal: Function,
}

export const CreateNewFolderModal: React.FC<CreateNewFolderModalProps> = (
    {
        setShowNewFolderModal
    }
) => {

    const dispatch = useDispatch()

    const user = useSelector(usersStateSelector)
    const selectedFolder = useSelector(SelectedFolderSelector)

    const {execQuery} = useFaunaQuery()

    const [folderName, setFolderName] = useState("");

    const handleClose = () => setShowNewFolderModal(false)


    const handleCreate = () => {
        if(folderName.length > 0){
            let newFolder: Folder = {
                name: folderName,
                owner: user,
                sharedWith: [],
                projectList: [],
                subFolders: [],
                parent: selectedFolder.faunaDocumentId as string,
            }
            execQuery(createFolderInFauna, newFolder).then((ret: any) => {
                newFolder = {...newFolder, faunaDocumentId: ret.ref.value.id}
                dispatch(addFolder(newFolder))
                execQuery(addIDInSubFoldersList, newFolder.faunaDocumentId, selectedFolder)
            })
            setShowNewFolderModal(false)
        }else{
            alert("Folder's name is required!")
        }
    }

    return (
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
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900"
                                >
                                    CREATE NEW PROJECT
                                </Dialog.Title>
                                <hr className="mt-2 mb-3"/>
                                <div className="flex flex-col">
                                    <div className="p-2">
                                        <h6>Insert Folder's Name</h6>
                                        <input
                                            type="text"
                                            className="formControl bg-gray-100 rounded p-2 w-full mt-3"
                                            placeholder="Folder's Name"
                                            value={folderName}
                                            onChange={(e) => setFolderName(e.target.value)}/>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-between">
                                    <button
                                        type="button"
                                        className="button bg-red-500 text-white"
                                        onClick={handleClose}
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="button"
                                        className="button buttonPrimary"
                                        onClick={handleCreate}
                                    >
                                        CREATE
                                    </button>

                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )

}