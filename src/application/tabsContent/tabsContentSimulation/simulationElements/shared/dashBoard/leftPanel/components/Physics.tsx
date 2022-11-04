import React from 'react';
import {AiOutlineThunderbolt} from "react-icons/ai";
import {IoTrashOutline} from "react-icons/io5";
import {useDispatch, useSelector} from "react-redux";
import {deletePort, selectedProjectSelector, selectPort} from "../../../../../../../../store/projectSlice";

interface PhysicsProps {
}

export const Physics: React.FC<PhysicsProps> = ({}) => {

    const dispatch = useDispatch()
    const selectedProject = useSelector(selectedProjectSelector)

    return (
        <>
            {(selectedProject && selectedProject.ports.length !== 0)
                ?
                <div>
                    <ul className="list-none pl-3 mb-0">
                        {selectedProject.ports && selectedProject.ports.map((port) => {
                            let portColor = 'orange';
                            if(port.category === 'lumped'){
                                portColor = 'violet'
                            }else if(port.category === 'port'){
                                portColor = 'red'
                            }
                            return (
                                <li key={port.name}
                                    className={port.isSelected ? "mt-[5px] pt-[5px] rounded bg-gray-200 hover:bg-gray-200 hover:cursor-pointer hover:rounded" : "mt-[5px] pt-[5px] hover:bg-gray-200 hover:cursor-pointer hover:rounded"}
                                    onClick={() => dispatch(selectPort(port.name))}
                                >
                                    <div className="flex">
                                        <div className="w-[15%]">
                                            <AiOutlineThunderbolt color={portColor}
                                                                  style={{width: "25px", height: "25px"}}/>
                                        </div>
                                        <div className="w-[75%] text-start">
                                            <h5 className="text-[18px] font-normal">{port.name}</h5>
                                        </div>
                                        {port.isSelected &&
                                            <div
                                                className="w-[15%]"
                                                onClick={() => dispatch(deletePort(port.name))}
                                            >
                                                <IoTrashOutline color={'#d80233'} style={{width: "20px", height: "20px"}}/>
                                            </div>
                                        }
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
                : <div className="text-center">
                    <img src="/noPhysicsIcon.png" className="mx-auto mt-[50px]"/>
                    <h5>No Physics applied</h5>
                    <p className="mt-[50px]">Select a tool from the Physics Toolbar and apply it to
                        geometry in the 3D View.</p>
                </div>
            }
        </>
    )

}