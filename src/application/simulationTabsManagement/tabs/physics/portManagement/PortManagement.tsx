import React from 'react';
import {AiOutlineThunderbolt} from "react-icons/ai";
import { Port, Probe } from '../../../../../model/esymiaModels';


interface PortManagementProps {
    selectedPort: Port | Probe | undefined,
    savedPortParameters: boolean,
    setSavedPortParameters: Function
}

export const PortManagement: React.FC<PortManagementProps> = (
    {
        children, selectedPort, savedPortParameters, setSavedPortParameters
    }
) => {
    let portColor = 'yellow';
    if(selectedPort && selectedPort.category === 'lumped'){
        portColor = 'violet'
    }else if(selectedPort && selectedPort.category === 'port'){
        portColor = 'red'
    }
    return (
        <>
            {
                selectedPort ?
                    <>
                        <div className="flex absolute right-[2%] top-[160px] w-[22%] rounded-tl rounded-tr bg-white p-[10px] shadow-2xl">
                            <div className="col-1 pe-0 ps-0">
                                <AiOutlineThunderbolt color={portColor}
                                                      style={{width: "25px", height: "25px"}}/>
                            </div>
                            <div className="col-6 text-start ps-0">
                                <h5 className="mb-0">{selectedPort.name}</h5>
                            </div>
                        </div>
                        < div className="flex-col absolute right-[2%] top-[207px] w-[22%] rounded-tl rounded-tr bg-white p-[20px] shadow-2xl max-h-[350px] overflow-y-scroll overflow-x-hidden">
                            {children}
                        </div>
                        <div className={`flex absolute right-[2%] ${selectedPort.category === "probe" ? 'top-[370px]' : 'top-[540px]'} w-[22%] rounded-tl rounded-tr bg-white p-[10px] shadow-2xl`}>
                            <button
                                type="button"
                                className="button buttonPrimary w-full mt-2 hover:opacity-80 disabled:opacity-60"
                                onClick={() => setSavedPortParameters(true)}
                                disabled={savedPortParameters}
                            >
                                SAVE
                            </button>
                        </div>
                    </>
                    : <div className="flex absolute right-[2%] top-[160px] w-[22%] rounded-tl rounded-tr bg-white p-[10px] shadow-2xl border-b border-secondaryColor">
                        <span>No Port Selected</span>
                    </div>


            }

        </>
    )

}