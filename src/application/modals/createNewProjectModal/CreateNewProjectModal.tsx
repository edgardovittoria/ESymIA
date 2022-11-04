import React, {Fragment, useState} from 'react';
import {Project} from "../../../model/Project";
import { Dialog, Transition } from '@headlessui/react'
import {CanvasState, useFaunaQuery, UsersState, usersStateSelector} from 'cad-library';
import {addIDInFolderProjectsList, createSimulationProjectInFauna} from "../../../faunadb/api/projectsFolderAPIs";
import {addProject, SelectedFolderSelector, selectProject} from '../../../store/projectSlice';
import {useDispatch, useSelector} from 'react-redux';

interface CreateNewProjectModalProps {
    setShow: Function,
    projectsTab: Project[],
    setProjectsTab: Function,
    selectTab: Function,
}

export const CreateNewProjectModal: React.FC<CreateNewProjectModalProps> = (
    {
        setShow, projectsTab, setProjectsTab, selectTab,
    }
) => {

    const dispatch = useDispatch()

    const user = useSelector(usersStateSelector)
    const selectedFolder = useSelector(SelectedFolderSelector)

    const {execQuery} = useFaunaQuery()

    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");


    const handleClose = () => setShow(false);
    const handleCreate = () => {
        if(projectName.length > 0){
            let newProject: Project = {
                name: projectName,
                description: projectDescription,
                model: {} as CanvasState,
                ports: [],
                signal: undefined,
                simulations: [],
                screenshot: undefined,
                owner: user,
                sharedWidth: [] as UsersState[]
            }
            execQuery(createSimulationProjectInFauna, newProject).then((res: any) => {
                newProject = {
                    ...newProject,
                    faunaDocumentId: res.ref.value.id
                } as Project
                execQuery(addIDInFolderProjectsList, newProject.faunaDocumentId, selectedFolder)
                dispatch(addProject(newProject))
            })
            dispatch(selectProject(newProject.name))
            setProjectsTab(projectsTab.concat(newProject))
            selectTab(newProject.name)
            setShow(false)
        }else{
            alert("Project's name is required!")
        }
    }

    return(
        <>
            {/* eslint-disable-next-line react/jsx-no-undef */}
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
                                            <h6>Insert Project's Name</h6>
                                            <input
                                                type="text"
                                                className="formControl bg-gray-100 rounded p-2 w-full mt-3"
                                                placeholder="Project's Name"
                                                value={projectName}
                                                onChange={(e) => setProjectName(e.target.value)}/>
                                        </div>
                                        <div className="p-2">
                                            <h6>Insert Project's Description</h6>
                                            <textarea
                                                className="formControl h-[100px] bg-gray-100 rounded p-2 w-full mt-3"
                                                placeholder="Project's Description"
                                                value={projectDescription}
                                                onChange={(e) => setProjectDescription(e.target.value)}/>
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
        </>

        /* <Modal show={true} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>CREATE NEW PROJECT</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-grid">
                    <div className="p-2">
                        <h6>Insert Project's Name</h6>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Project's Name"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}/>
                    </div>
                    <div className="p-2">
                        <h6>Insert Project's Description</h6>
                        <textarea
                            className="form-control"
                            placeholder="Project's Description"
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}/>
                    </div>
                </div>

            </Modal.Body>
            <Modal.Footer>
                <button className="button btn-secondary" onClick={handleClose}>
                    CLOSE
                </button>
                <button className="button buttonPrimary" onClick={handleCreate}>
                    CREATE
                </button>
            </Modal.Footer>
        </Modal>*/
    )

}