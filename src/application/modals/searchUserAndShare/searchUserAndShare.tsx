import React, {Fragment, useState} from 'react';
import {Combobox, Dialog, Transition} from "@headlessui/react";
import {BiCheck} from "react-icons/bi";
import {HiArrowsUpDown} from "react-icons/hi2";
import {SearchUser} from "./components/SearchUser";
import {useDispatch, useSelector} from "react-redux";
import {projectToShareSelector, shareProject} from "../../../store/projectSlice";
import {Project} from "../../../model/Project";
import {useFaunaQuery, usersStateSelector} from "cad-library";
import {
    addIDInFolderProjectsList, addIDInFolderProjectsListOfSharedUser,
    getFoldersByOwner,
    updateProjectInFauna
} from "../../../faunadb/api/projectsFolderAPIs";

interface SearchUserAndShareProps {
    setShowSearchUser: (v: boolean) => void
}

const people: string[] = [
    'Gianni Frittella',
    'edgardo.vittoria@student.univaq.it',
]

export const SearchUserAndShare: React.FC<SearchUserAndShareProps> = (
    {
        setShowSearchUser
    }
) => {


    const dispatch = useDispatch()
    const projectToShare = useSelector(projectToShareSelector)
    const user = useSelector(usersStateSelector)

    const {execQuery} = useFaunaQuery()

    const handleClose = () => setShowSearchUser(false);

    const [selected, setSelected] = useState(people[0])
    const [query, setQuery] = useState('')

    const filteredPeople: string[] =
        query === ''
            ? people.filter(p => p !== user.userName)
            : people.filter(p => p !== user.userName).filter((person) =>
                person.toLowerCase()
                    .replace(/\s+/g, '')
                    .includes(query.toLowerCase().replace(/\s+/g, ''))
            )

    return (
        <>
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
                                    <h5 >Share Project</h5>
                                    <hr className="mb-10"/>
                                    <div className="flex items-center">
                                        <span className="w-1/3">Share with:</span>
                                        <SearchUser selected={selected} setSelected={setSelected}
                                                    filteredPeople={filteredPeople} query={query} setQuery={setQuery}/>
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
                                                dispatch(shareProject({projectToShare: projectToShare as Project, user: selected}))
                                                execQuery(updateProjectInFauna, {...projectToShare, sharedWith: [...(projectToShare as Project).sharedWith as string[], selected]} as Project)
                                                execQuery(getFoldersByOwner, selected).then(res => {
                                                    console.log(res)
                                                   execQuery(addIDInFolderProjectsListOfSharedUser, projectToShare?.faunaDocumentId, res[0])
                                                })
                                                handleClose()
                                            }}
                                        >
                                            SHARE
                                        </button>
                                    </div>
                                </div>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )

}