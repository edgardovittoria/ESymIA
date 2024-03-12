import React, {useState} from 'react';
import {FaPlus, FaTimes, FaUser} from "react-icons/fa";
import { MdOutlineDashboard } from "react-icons/md";
import {useAuth0} from "@auth0/auth0-react";
import {SetUserInfo, UsersState} from 'cad-library';
import {HiOutlineLogout} from "react-icons/hi";
import {useDispatch, useSelector} from 'react-redux';
import {selectProject} from '../store/projectSlice';
import {GiSettingsKnobs} from "react-icons/gi";
import { CreateNewProjectModal } from './sharedModals/CreateNewProjectModal';
import { closeProjectTab, projectsTabsSelector, selectTab, tabSelectedSelector } from '../store/tabsAndMenuItemsSlice';

interface TabsContainerProps {
    user: UsersState
}

export const TabsContainer: React.FC<TabsContainerProps> = (
    {
        user
    }
) => {
    
    const tabSelected = useSelector(tabSelectedSelector)
    const projectsTabs = useSelector(projectsTabsSelector)
    const dispatch = useDispatch()

    const [userDropdownVisibility, setUserDropdownVisibility] = useState(false);


    const {loginWithRedirect, isAuthenticated, logout} = useAuth0();

    const [showCreateNewProjectModal, setShowCreateNewProjectModal] =
    useState(false);

    return (
        <>
            <SetUserInfo/>
            <nav className="flex w-full justify-between px-8 pt-6 h-[6vh]">
                <div className="flex items-center h-max">
                    <a className="text-black no-underline text-2xl bg-clip-text text-transparent font-semibold bg-gradient-to-r from-secondaryColor to-green-400 mr-4 ml-4" href="/">ESimIA</a>
                    <ul className="flex pl-0 mb-0">
                        <li className={(tabSelected === "DASHBOARD") ? `px-3 py-3 bg-white rounded-tl text-black flex justify-between items-center gap-2` : `bg-[#dadada] rounded flex items-center px-3 py-3 hover:cursor-pointer`} onClick={() => {
                            dispatch(selectTab("DASHBOARD"))
                            dispatch(selectProject(undefined))
                        }}>
                            <MdOutlineDashboard size={20} className="text-secondaryColor"/>
                            {tabSelected === "DASHBOARD" && <span className="font-bold text-sm">Dashboard</span>}
                        </li>
                        {projectsTabs.map(projectTab => {
                            return <li key={projectTab.faunaDocumentId} className={`bg-[#dadada] rounded-tr`}>
                                <div
                                    className={(tabSelected === projectTab.faunaDocumentId) ? 'px-3 py-3 bg-white flex items-center' : 'px-3 py-3 flex items-center'}>
                                    <div
                                        className={(tabSelected === projectTab.faunaDocumentId) ? 'text-black font-bold text-sm' : 'text-gray-400 hover:cursor-pointer text-sm'}
                                        aria-current="page" onClick={() => {
                                        dispatch(selectTab(projectTab.faunaDocumentId as string))
                                        dispatch(selectProject(projectTab.faunaDocumentId))
                                    }}>{projectTab.name}
                                    </div>
                                    <div className="ml-8" onClick={() => {
                                        dispatch(closeProjectTab(projectTab.faunaDocumentId as string))
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
                    {/*<FaBell*/}
                    {/*    className="w-[20px] h-[20px] mr-4 text-primaryColor hover:text-secondaryColor hover:cursor-pointer"/>*/}
                    {isAuthenticated ?
                        <div>
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
                                    onClick={() => logout({logoutParams:{returnTo: window.location.origin}})}>
                                    <HiOutlineLogout className="w-[20px] h-[20px] mr-[10px] text-primaryColor"/>
                                    <li>Logout</li>
                                </div>

                            </ul>
                        </div>
                        :
                        <button
                            className="text-primaryColor rounded mr-[20px] border-2 border-secondaryColor font-bold py-[4px] px-[10px] hover:bg-green-200"
                            onClick={() => loginWithRedirect}>
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