import React, {useEffect, useState} from 'react';
import { FaReact } from "react-icons/fa6";
import {IoTrashOutline} from "react-icons/io5";
import {useDispatch, useSelector} from "react-redux";
import {
    deletePort,
    portKeySelector,
    selectedProjectSelector,
    selectPort,
    setPortKey, setPortName
} from '../../../../store/projectSlice';
import {BiRename} from "react-icons/bi";

interface PhysicsLeftPanelTabProps {
}

export const PhysicsLeftPanelTab: React.FC<PhysicsLeftPanelTabProps> = () => {

    const dispatch = useDispatch()
    const selectedProject = useSelector(selectedProjectSelector)
    const portKey = useSelector(portKeySelector)

    const [portRename, setPortRename] = useState("")


    return (
        <>
            {(selectedProject && selectedProject.ports.length !== 0)
                ?
                <div>
                    <ul className="list-none pl-3 mb-0">
                        {selectedProject.ports && selectedProject.ports.map((port) => {
                            let portColor = 'orange';
                            if (port.category === 'lumped') {
                                portColor = 'violet'
                            } else if (port.category === 'port') {
                                portColor = 'red'
                            }
                            return (
                                <li key={port.name}
                                    className={port.isSelected ? "mt-[5px] rounded bg-gray-200 hover:bg-gray-200 hover:cursor-pointer hover:rounded px-1" : "mt-[5px] hover:bg-gray-200 hover:cursor-pointer hover:rounded"}
                                    onClick={() => dispatch(selectPort(port.name))}
                                >
                                    <div className="flex items-center">
                                        <div className="w-[10%]">
                                            <FaReact color={portColor}
                                                                  style={{width: "20px", height: "20px"}}/>
                                        </div>
                                        <div className="w-[75%] text-start">
                                            <h5 className="text-[15px] font-normal">{port.name}</h5>
                                        </div>
                                        {port.isSelected &&
                                            <div className="flex">
                                                <div className="w-[15%] tooltip mr-5" data-tip={"Rename"}>
                                                    <label htmlFor="modalRename" onClick={() => setPortRename(port.name)}>
                                                        <BiRename color={'#464847'} style={{width: "20px", height: "20px"}}/>
                                                    </label>
                                                </div>
                                                <input type="checkbox" id="modalRename" className="modal-toggle" />
                                                <div className="modal">
                                                    <div className="modal-box">
                                                        <h3 className="font-bold text-lg">Rename Port</h3>
                                                        <div className="flex justify-center items-center py-5">
                                                            <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs"
                                                                value={portRename} onChange={(e) => setPortRename(e.currentTarget.value)}
                                                            />
                                                        </div>
                                                        <div className="modal-action flex justify-between">
                                                            <label htmlFor="modalRename" className="btn h-[2rem] min-h-[2rem] bg-red-500 border-red-500">Cancel</label>
                                                            <label htmlFor="modalRename" className="btn h-[2rem] min-h-[2rem]"
                                                                   onClick={() => dispatch(setPortName(portRename))}
                                                            >Rename</label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    className="w-[15%] tooltip" data-tip={"Delete"}
                                                    onClick={() => {
                                                        dispatch(deletePort(port.name))
                                                        dispatch(setPortKey((portKey as number) - 1))
                                                    }}
                                                >
                                                    <IoTrashOutline color={'#d80233'} style={{width: "20px", height: "20px"}}/>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
                : <div className="text-center">
                    <img src="/noPhysicsIcon.png" className="mx-auto mt-[50px]" alt='No Physics'/>
                    <h5>No Physics applied</h5>
                    <p className="mt-[50px]">Select a tool from the Physics Toolbar and apply it to
                        geometry in the 3D View.</p>
                </div>
            }
        </>
    )

}