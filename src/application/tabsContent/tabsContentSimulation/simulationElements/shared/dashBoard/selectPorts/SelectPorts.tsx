import React, {Fragment, useState} from 'react';
import {Project} from "../../../../../../../model/Project";
import {Port, Probe, RLCParams} from "../../../../../../../model/Port";
import {CircleGeometryAttributes, ComponentEntity, TransformationParams} from 'cad-library';
import {useDispatch} from "react-redux";
import {addPorts} from "../../../../../../../store/projectSlice";
import {Menu, Transition} from "@headlessui/react";
import {FiChevronDown} from "react-icons/fi";
import {AiOutlineThunderbolt} from "react-icons/ai";
import {getDefaultLumped, getDefaultPort, getDefaultProbe} from "./portLumpedProbeGenerator";

interface SelectPortsProps {
    selectedProject: Project,
}

export const SelectPorts: React.FC<SelectPortsProps> = ({selectedProject}) => {

    const dispatch = useDispatch()

    const [keyPort, setKeyPort] = useState(selectedProject.ports.length)
    const generateNewKeyPort = (key: number) => {
        setKeyPort(key + 1)
        return key + 1
    }
    return (
        <>
            < div className="absolute left-[20%] top-[160px]">
                <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button
                        className="inline-flex w-full justify-center rounded-md bg-white px-2 py-2 text-sm font-medium text-black hover:bg-opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                        <AiOutlineThunderbolt
                            className="ml-0 mr-2 h-5 w-5 text-green-300"
                            aria-hidden="true"
                        />
                        Add Port
                        <FiChevronDown
                            className="ml-2 -mr-1 h-5 w-5 text-green-300 hover:text-green-800"
                            aria-hidden="true"
                        />
                    </Menu.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <Menu.Item>
                                {({active}) => (
                                    <span
                                        className={`${
                                            active ? 'bg-green-200' : 'text-gray-900'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-base no-underline`}
                                        onClick={() => {
                                            let port = getDefaultPort(generateNewKeyPort(keyPort))
                                            dispatch(addPorts(port))
                                        }}
                                    >
                                        Port
                                    </span>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({active}) => (
                                    <span
                                        className={`${
                                            active ? 'bg-green-200' : 'text-gray-900'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-base no-underline`}
                                        onClick={() => {
                                            let lumped = getDefaultLumped(generateNewKeyPort(keyPort))
                                            dispatch(addPorts(lumped))
                                        }}
                                    >
                                        Lumped
                                    </span>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({active}) => (
                                    <span
                                        className={`${
                                            active ? 'bg-green-200' : 'text-gray-900'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-base no-underline`}
                                        onClick={() => {
                                            let probe = getDefaultProbe(generateNewKeyPort(keyPort))
                                            dispatch(addPorts(probe))
                                        }}
                                    >
                                        Probe
                                    </span>
                                )}
                            </Menu.Item>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </>
    )

}