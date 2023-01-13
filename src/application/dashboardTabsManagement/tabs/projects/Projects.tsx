import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {mainFolderSelector, selectFolder, sharedElementsFolderSelector} from "../../../../store/projectSlice";
import {Tab} from '@headlessui/react'
import MyFiles from "./components/ProjectTabContent/MyFiles";
import MySharedElements from "./components/ProjectTabContent/MySharedElements";


interface ProjectsProps {
    setShowModal: Function;
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export const Projects: React.FC<ProjectsProps> = ({setShowModal}) => {

    const dispatch = useDispatch()

    const myFilesFolder = useSelector(mainFolderSelector)
    const mySharedElementsFolder = useSelector(sharedElementsFolderSelector)

    const [showSearchUser, setShowSearchUser] = useState(false);
    const [showCreateNewFolderModal, setShowCreateNewFolderModal] = useState(false);

    return (
        <div className="w-full px-2 py-2">
            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-md bg-blue-900/20 p-1 mb-2 w-1/3">
                    <Tab key={"My Files"}
                         onClick={() => dispatch(selectFolder(myFilesFolder.faunaDocumentId as string))}
                         className={({selected}) =>
                             classNames(
                                 'w-full rounded-md py-2.5 text-sm font-medium leading-5 text-secondaryColor',
                                 'ring-white ring-opacity-60 ring-offset-2 ring-offset-secondaryColor focus:outline-none focus:ring-2',
                                 selected
                                     ? 'bg-white shadow'
                                     : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                             )
                         }

                    >
                        My Files
                    </Tab>
                    <Tab key={"My Shared Elements"}
                         onClick={() => dispatch(selectFolder(mySharedElementsFolder.faunaDocumentId as string))}
                         className={({selected}) =>
                             classNames(
                                 'w-full rounded-md py-2.5 text-sm font-medium leading-5 text-secondaryColor',
                                 'ring-white ring-opacity-60 ring-offset-2 ring-offset-secondaryColor focus:outline-none focus:ring-2',
                                 selected
                                     ? 'bg-white shadow'
                                     : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                             )
                         }
                    >
                        My Shared Elements
                    </Tab>
                </Tab.List>
                <Tab.Panels>
                    <Tab.Panel>
                        <MyFiles setShowModal={setShowModal} showCreateNewFolderModal={showCreateNewFolderModal}
                                 setShowCreateNewFolderModal={setShowCreateNewFolderModal}
                                 showSearchUser={showSearchUser} setShowSearchUser={setShowSearchUser}/>
                    </Tab.Panel>
                    <Tab.Panel>
                        <MySharedElements setShowModal={setShowModal}
                                          showCreateNewFolderModal={showCreateNewFolderModal}
                                          setShowCreateNewFolderModal={setShowCreateNewFolderModal}
                                          showSearchUser={showSearchUser} setShowSearchUser={setShowSearchUser}/>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>

        </div>
    );
};
