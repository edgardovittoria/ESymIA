import React, {useState} from 'react';
import {FaBell, FaPlus, FaTimes, FaUser} from "react-icons/fa";
import {useAuth0} from "@auth0/auth0-react";
import {SetUserInfo, UsersState} from 'cad-library';
import {HiOutlineLogout} from "react-icons/hi";
import {useDispatch} from 'react-redux';
import {selectProject} from '../store/projectSlice';
import {GiSettingsKnobs} from "react-icons/gi";
import { CreateNewProjectModal } from './sharedModals/CreateNewProjectModal';
import { useTabs } from '../contexts/tabsAndMenuitemsHooks';

interface TabsContainerProps {
    user: UsersState
}

export const TabsContainer: React.FC<TabsContainerProps> = (
    {
        user
    }
) => {
    
    const {tabSelected, selectTab, projectsTabs, closeProjectTab} = useTabs()
    const dispatch = useDispatch()

    const [userDropdownVisibility, setUserDropdownVisibility] = useState(false);


    const {loginWithRedirect, isAuthenticated, logout} = useAuth0();

    const [showCreateNewProjectModal, setShowCreateNewProjectModal] =
    useState(false);

    return (
        <>
            <SetUserInfo/>
            <nav className="flex w-full justify-between px-8 pt-3">
                <div className="flex items-end h-max">
                    <a className="text-black no-underline text-2xl mr-4 ml-4" href="/">ESimIA</a>
                    <ul className="flex pl-0 mb-0">
                        <li className={`bg-[#dadada] rounded`} onClick={() => {
                            selectTab("DASHBOARD")
                            dispatch(selectProject(undefined))
                        }}>
                            <div
                                className={(tabSelected === 'DASHBOARD') ? `px-3 py-2 bg-white rounded-tl text-black` : `px-3 py-2 hover:cursor-pointer`}
                                aria-current="page"
                            >Dashboard
                            </div>
                        </li>
                        {projectsTabs.map(projectTab => {
                            return <li key={projectTab.faunaDocumentId} className={`bg-[#dadada] rounded-tr`}>
                                <div
                                    className={(tabSelected === projectTab.faunaDocumentId) ? 'px-3 py-2 bg-white flex' : 'px-3 py-2 flex'}>
                                    <div
                                        className={(tabSelected === projectTab.faunaDocumentId) ? 'text-black' : 'text-gray-400 hover:cursor-pointer'}
                                        aria-current="page" onClick={() => {
                                        selectTab(projectTab.faunaDocumentId)
                                        dispatch(selectProject(projectTab.faunaDocumentId))
                                    }}>{projectTab.name}
                                    </div>
                                    <div className="ml-8" onClick={() => {
                                        closeProjectTab(projectTab.faunaDocumentId as string)
                                        dispatch(selectProject(undefined))
                                    }}>
                                        <FaTimes className="w-[12px] h-[12px] text-gray-400"/>
                                    </div>
                                </div>

                            </li>
                        })}
                        <li className={`nav-item m-auto mx-4`}>
                            <FaPlus onClick={() => setShowCreateNewProjectModal(true)} className="w-[12px] h-[12px] text-gray-400"/>
                        </li>
                    </ul>
                </div>
                <div className="flex items-center">
                    <FaBell
                        className="w-[20px] h-[20px] mr-4 text-primaryColor hover:text-secondaryColor hover:cursor-pointer"/>
                    {isAuthenticated ?
                        <div className="">
                            <FaUser
                                className="w-[20px] h-[20px] mr-4 text-primaryColor hover:text-secondaryColor hover:cursor-pointer"
                                onClick={() => setUserDropdownVisibility(!userDropdownVisibility)}/>
                            <ul style={{display: !userDropdownVisibility ? "none" : "block"}}
                                className="px-4 py-2 bg-white rounded list-none absolute right-[10px] mt-[8px] w-max shadow z-[10000]">
                                <li className="font-bold text-lg text-secondaryColor">{user.userName}</li>
                                <hr className="mb-3"/>
                                <div
                                    className={`flex items-center p-[5px] hover:bg-opacity-40 hover:bg-green-200 hover:font-semibold hover:cursor-pointer`}>
                                    <GiSettingsKnobs className="w-[20px] h-[20px] mr-[10px] text-primaryColor"/>
                                    <li>Settings</li>
                                </div>
                                <div
                                    className={`flex items-center p-[5px] hover:bg-opacity-40 hover:bg-green-200 hover:font-semibold hover:cursor-pointer`}
                                    onClick={() => logout({returnTo: window.location.origin})}>
                                    <HiOutlineLogout className="w-[20px] h-[20px] mr-[10px] text-primaryColor"/>
                                    <li>Logout</li>
                                </div>

                            </ul>
                        </div>
                        :
                        <button
                            className="text-primaryColor rounded mr-[20px] border-2 border-secondaryColor font-bold py-[4px] px-[10px] hover:bg-green-200"
                            onClick={loginWithRedirect}>
                            Login
                        </button>}
                </div>

            </nav>
            {showCreateNewProjectModal && (
            <CreateNewProjectModal
              setShow={setShowCreateNewProjectModal}
            />
          )}
        </>

    )

}