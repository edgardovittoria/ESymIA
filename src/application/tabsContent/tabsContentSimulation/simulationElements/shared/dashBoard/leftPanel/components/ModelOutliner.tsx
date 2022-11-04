import React from "react";
import {FaCube, FaCubes} from "react-icons/fa";

import {useSelector} from "react-redux";
import {selectedProjectSelector} from "../../../../../../../../store/projectSlice";

interface ModelOutlinerProps {

}

export const ModelOutliner: React.FC<ModelOutlinerProps> = ({}) => {

    //TODO: remove selection of componenst

    const selectedProject = useSelector(selectedProjectSelector)

    return (
        <>
            <div className='mt-2'>
                <div className="flex pl-2">
                    <div className="w-[13%]">
                        <FaCubes className="w-[33px] h-[33px]"/>
                    </div>
                    <div className="w-[80%] text-left">
                        <h5 className="ml-[5px] text-[20px] font-normal">Components</h5>
                    </div>
                </div>
                <div className="flex-col ml-10 mt-1">
                    {selectedProject && selectedProject.model.components.map(component => {
                        return (
                            <div
                                className="flex items-center"
                                key={component.keyComponent}
                            >
                                <div className="w-[10%]">
                                    <FaCube className="w-[22px] h-[22px]" color={(component.material !== undefined) ? component.material.color : "gray"}/>
                                </div>
                                <div className="w-[90%] text-start">
                                    <h6 className="lowercase text-[18px] pl-2 font-[400]">{component.name}</h6>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    )

}