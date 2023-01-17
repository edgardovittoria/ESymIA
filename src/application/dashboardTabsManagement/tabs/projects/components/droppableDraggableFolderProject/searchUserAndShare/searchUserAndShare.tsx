import React, {Fragment, useEffect, useState} from 'react';
import {Dialog, Transition} from "@headlessui/react";
import {ImSpinner} from "react-icons/im";
import {SearchUser} from "./components/SearchUser";
import {useDispatch, useSelector} from "react-redux";
import {shareFolder, shareProject} from "../../../../../../../store/projectSlice";
import {useFaunaQuery, usersStateSelector} from "cad-library";
import {
    recursiveUpdateSharingInfoFolderInFauna,
    updateProjectInFauna,
} from "../../../../../../../faunadb/projectsFolderAPIs";
import axios from "axios";
import { Folder, Project, sharingInfoUser } from '../../../../../../../model/esymiaModels';

interface SearchUserAndShareProps {
    setShowSearchUser: (v: boolean) => void,
    projectToShare?: Project,
    folderToShare?: Folder
}

export const SearchUserAndShare: React.FC<SearchUserAndShareProps> = (
    {
        setShowSearchUser, folderToShare, projectToShare
    }
) => {

    const [users, setUsers] = useState<string[]>([]);
    const [shareDone, setShareDone] = useState<boolean>(false);

    useEffect(() => {
        let usersList: string[] = []
        setSpinner(true)
        axios.get(`https://dev-i414-g1x.us.auth0.com/api/v2/roles`, {
            headers: {authorization: `Bearer ${process.env.REACT_APP_AUTH0_MANAGEMENT_API_ACCESS_TOKEN}`}
        }).then(res => {
            res.data.filter((r: { name: string; }) => r.name === "Premium").forEach((role: { id: string; }) => {
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
    const user = useSelector(usersStateSelector)

    useEffect(() => {
        if(shareDone){
            execQuery(recursiveUpdateSharingInfoFolderInFauna, folderToShare)
            setShowSearchUser(false)
        }
    }, [folderToShare?.sharedWith])

    const {execQuery} = useFaunaQuery()

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
                <Dialog as="div" className="relative z-10" onClose={() => setShowSearchUser(false)}>
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
                                                        onClick={() => setShowSearchUser(false)}
                                                    >
                                                        CANCEL
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="button buttonPrimary py-1 px-2 text-sm"
                                                        onClick={() => {
                                                            setShareDone(true)
                                                            if(projectToShare){
                                                                dispatch(shareProject({projectToShare: projectToShare, user: {userEmail: selected, read: true, write:true}}))
                                                                execQuery(updateProjectInFauna, {...projectToShare, sharedWith: [...projectToShare.sharedWith as sharingInfoUser[], {userEmail: selected, read: true, write:true} as sharingInfoUser]})
                                                                setShowSearchUser(false)
                                                                window.alert("Sharing Successful!!")
                                                            }
                                                            else if(folderToShare){
                                                                dispatch(shareFolder({folderToShare: folderToShare.faunaDocumentId as string, user: {userEmail: selected, read: true, write:true}}))
                                                            }
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