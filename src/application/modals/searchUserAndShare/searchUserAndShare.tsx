import React, {Fragment, useEffect, useState} from 'react';
import {Dialog, Transition} from "@headlessui/react";
import {ImSpinner} from "react-icons/im";
import {SearchUser} from "./components/SearchUser";
import {useDispatch, useSelector} from "react-redux";
import {folderToShareSelector, projectToShareSelector, setFolderToShare, setProjectToShare, shareFolder, shareProject} from "../../../store/projectSlice";
import {Project} from "../../../model/Project";
import {useFaunaQuery, usersStateSelector} from "cad-library";
import {
    updateFolderInFauna,
    updateFoldersSharingInfo,
    updateProjectInFauna,
    updateProjectSharingInfo
} from "../../../faunadb/api/projectsFolderAPIs";
import axios from "axios";

interface SearchUserAndShareProps {
    setShowSearchUser: (v: boolean) => void
}

export const SearchUserAndShare: React.FC<SearchUserAndShareProps> = (
    {
        setShowSearchUser
    }
) => {

    const [users, setUsers] = useState<string[]>([]);
    let usersList: string[] = []

    useEffect(() => {
        setSpinner(true)
        axios.get(`https://dev-i414-g1x.us.auth0.com/api/v2/roles`, {
            headers: {authorization: `Bearer ${process.env.REACT_APP_AUTH0_MANAGEMENT_API_ACCESS_TOKEN}`}
        }).then(res => {
            //TODO: change role to Premium
            res.data.filter((r: { name: string; }) => r.name === "Base").forEach((role: { id: string; }) => {
                axios.get(`https://dev-i414-g1x.us.auth0.com/api/v2/roles/${role.id}/users`, {
                    headers: {authorization: `Bearer ${process.env.REACT_APP_AUTH0_MANAGEMENT_API_ACCESS_TOKEN}`}
                }).then(res => {
                    //console.log(res.data)
                    res.data.forEach((u: { name: string; }) => {
                        usersList.push(u.name)
                    })
                    setUsers(usersList)
                    setSpinner(false)
                })
            })
        })
    }, []);

    const dispatch = useDispatch()
    const projectToShare = useSelector(projectToShareSelector)
    const folderToShare = useSelector(folderToShareSelector)
    const user = useSelector(usersStateSelector)

    const {execQuery} = useFaunaQuery()

    const handleClose = () => {
        dispatch(setProjectToShare(undefined))
        dispatch(setFolderToShare(undefined))
        setShowSearchUser(false)};

    const [selected, setSelected] = useState("")
    const [query, setQuery] = useState('')
    const [spinner, setSpinner] = useState(true);

    const filteredPeople: string[] =
        query === ''
            ? users.filter(p => p !== user.email)
            : users.filter(p => p !== user.email).filter((person) =>
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
                                    {
                                        spinner ? (
                                            <div className="flex justify-center items-center">
                                                <ImSpinner className={`animate-spin w-8 h-8`} />
                                            </div>
                                        ) : (
                                            <>
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
                                                            if(projectToShare){
                                                                dispatch(shareProject({projectToShare: projectToShare, user: selected}))
                                                                execQuery(updateProjectInFauna, {...projectToShare, sharedWith: [...projectToShare.sharedWith as string[], selected]})
                                                                execQuery(updateProjectSharingInfo, projectToShare?.faunaDocumentId, selected)
                                                            }
                                                            else if(folderToShare){
                                                                dispatch(shareFolder({folderToShare: folderToShare, user: selected}))
                                                                execQuery(updateFolderInFauna, {...folderToShare, sharedWith: [...folderToShare.sharedWith as string[], selected]})
                                                                execQuery(updateFoldersSharingInfo, folderToShare?.faunaDocumentId, selected)
                                                            }
                                                            handleClose()
                                                        }}
                                                    >
                                                        SHARE
                                                    </button>
                                                </div>
                                            </>
                                        )

                                    }
                                </div>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )

}