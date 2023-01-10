import React, {} from 'react';
import {useSelector} from "react-redux";
import {selectedProjectSelector} from "../../../../store/projectSlice";
import {FaCircle} from "react-icons/fa";
import {Switch} from '@headlessui/react'
import { Material } from 'cad-library';

interface SimulatorLeftPanelTabProps {
    selectedMaterials: string[],
    setSelectedMaterials: Function,
    allMaterials: Material[]
}

export const SimulatorLeftPanelTab: React.FC<SimulatorLeftPanelTabProps> = (
    {
        selectedMaterials, setSelectedMaterials, allMaterials
    }
) => {

    const selectedProject = useSelector(selectedProjectSelector)
    
    return (
        <>
            {(selectedProject && selectedProject.model.components !== undefined) ?
                <div>
                    <ul className="ml-0 pl-3">
                        {allMaterials.map((material, index) => {
                            return (
                                <li key={index} className='p-[3px] rounded mt-1'>
                                    <div className="flex">
                                        <div className="flex w-[10%] items-center">
                                            <FaCircle
                                                color={(material !== undefined) ? material.color : "gray"}/>
                                        </div>
                                        <div className="w-[60%] text-left flex items-center">
                                            <h6 className="mb-0 text-[18px] font-normal">{(material !== undefined) ? material.name : "No material"}</h6>
                                        </div>
                                        <div className="w-[30%] text-left flex items-center">
                                            <Switch
                                                checked={selectedMaterials.filter(m => m === material?.name).length > 0}
                                                onChange={(e) => {
                                                    if (selectedMaterials.filter(sm => sm === material?.name)[0]) {
                                                        setSelectedMaterials(selectedMaterials.filter(sm => sm !== material?.name))
                                                    } else {
                                                        setSelectedMaterials([...selectedMaterials, material?.name])
                                                    }
                                                }}
                                                className={`${
                                                    selectedMaterials.filter(m => m === material?.name).length > 0 ? 'bg-green-400' : 'bg-gray-300'
                                                } relative inline-flex h-4 w-9 items-center rounded-full`}
                                            >
                                            <span
                                                className={`${
                                                    selectedMaterials.filter(m => m === material?.name).length > 0 ? 'translate-x-5' : 'translate-x-1'
                                                } inline-block h-3 w-3 transform rounded-full bg-white transition`}
                                            />
                                            </Switch>
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div> :
                <div className="text-center">
                    <img src="/noMaterialsIcon.png" className="mx-auto mt-[50px]"/>
                    <h5>No Materials</h5>
                    <p className="mt-[50px]">apply the materials on the model directly in the CAD</p>
                </div>
            }
        </>
    )

}