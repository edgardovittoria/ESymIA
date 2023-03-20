import React, {useEffect, useState} from "react";
import {Tab} from "@headlessui/react";
import {tabTitles} from "./modelerTabTitlesAndIcons";
import {useSelector} from "react-redux";
import {unitsSelector} from "../../../store/unitSlice";
import {selectedProjectSelector} from "../../../store/projectSlice";

interface DashBoardProps {
    tabs: string[],
    selectedTab: string
    setSelectedTab: Function,    
}

export const LeftPanel: React.FC<DashBoardProps> = (
    {
        tabs, children, selectedTab, setSelectedTab
    }
) => {

    function classNames(...classes: string[]) {
        return classes.filter(Boolean).join(' ')
    }

    const [selectedIndex, setSelectedIndex] = useState(0)
    const selectedProject = useSelector(selectedProjectSelector)
    const units = useSelector(unitsSelector).filter(u => u.projectId === selectedProject?.faunaDocumentId)

    useEffect(() => {
        setSelectedIndex(0)
        setSelectedTab("Modeler")
        if (tabs[1] === 'Results') {
            setSelectedTab("Results")
        }
    }, [tabs[1]]);

    return (
        <>
            <div className="absolute left-[2%] top-[160px] w-[16%]">
                <Tab.Group selectedIndex={(tabs[1] === 'Results') ? 1 : selectedIndex}>
                    <Tab.List className="flex rounded bg-gray-300">
                        {tabs.map((tab, index) => {
                            return (
                                <Tab
                                    key={index}
                                    className={({selected}) =>
                                        classNames(
                                            'w-full py-2.5 px-2 text-base font-medium',
                                            selected
                                                ? 'bg-white text-black'
                                                : 'text-gray-500 hover:bg-white/[0.12]'
                                        )
                                    }
                                    onClick={() => {
                                        setSelectedIndex(index)
                                        setSelectedTab(tab)
                                    }}
                                    disabled={selectedTab === 'Results'}
                                >
                                    {(selectedTab === tab) ? tabTitles.filter(tabTitle => tabTitle.key === tab)[0].object
                                        : tabTitles.filter(tabTitle => tabTitle.key === tab)[0].object}
                                </Tab>
                            )
                        })}
                    </Tab.List>
                    <Tab.Panels className="shadow-2xl">
                        {tabs.map((tab, index) => (
                            <Tab.Panel
                                key={index}
                                className='rounded-b-xl bg-white p-3'
                            >
                                {children}
                                {units.length > 0 &&
                                    <div>unit: {units[0].unit}</div>
                                }
                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                </Tab.Group>
            </div>

        </>
    )

}