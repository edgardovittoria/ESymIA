import React, {FormEvent, useState} from 'react';
import {Port, Signal, SignalValues} from "../../../../../../../../../../../../model/Port";
import {ModalInputSignal} from "../../../modals/ModalInputSignal";
import {saveSignal} from "../../../../../../../../../../../../faunadb/api/signalsAPIs";
import { useFaunaQuery } from 'cad-library';
import {useGetAvailableSignals} from "../../../../../../../../../hooks/useGetAvailableSignals";
import {useDispatch} from "react-redux";
import {setAssociatedSignal} from "../../../../../../../../../../../../store/projectSlice";
import {Project} from "../../../../../../../../../../../../model/Project";

interface InputSignalProps {
    setShowModalSignal: Function,
    selectedProject: Project
}

export const InputSignal: React.FC<InputSignalProps> = (
    {
        setShowModalSignal, selectedProject
    }
) => {

    const dispatch = useDispatch()
    const {availableSignals, setAvailableSignals} = useGetAvailableSignals()
    const [show, setShow] = useState(false);
    const {execQuery} = useFaunaQuery()
    const [selectedSignal, setSelectedSignal] = useState(selectedProject.signal?.name as string);

    function getSignalByName(name: string) {
        return availableSignals.filter(signal => signal.name === name)[0]
    }

    function getPortByName(name: string){
        return selectedProject.ports.filter(port => port.name === name)[0]
    }


    function loadSignal(e: FormEvent<HTMLInputElement>){
        let file = e.currentTarget.files?.item(0)
        let signalName = file?.name.split(".")[0];
        let signalValues: SignalValues[] = [];
        let fileError = false;
        (file as File).text().then(async value => {
            let rows = value.split(/\r?\n/);
            rows.splice(rows.length - 1, 1)
            rows.forEach(row => {
                if(row.split(" ").length === 3){
                    signalValues.push({
                        freq: parseFloat(row.split(/\s+/)[0]),
                        signal: {
                            Re: parseFloat(row.split(/\s+/)[1]),
                            Im: parseFloat(row.split(/\s+/)[2])
                        }
                    })
                }else{
                    fileError = true;
                    rows.length = 0; //break the forEach loop
                }
            })
            if(!fileError) {
                let signal: Signal = {
                    id: signalName ?? "",
                    name: signalName ?? "",
                    type: "current",
                    signalValues: signalValues,
                    powerPort: undefined
                }
                await execQuery(saveSignal, signal)
                setAvailableSignals([...availableSignals, signal])
            }else {
                alert("The imported file is not in the correct format. Please upload a correct file!")
                fileError = false
            }
        })
    }

    return (
        <>
            <div className=" p-[10px] border-[1px] border-secondaryColor rounded bg-[#f6f6f6] text-left">
                <div className="flex flex-wrap">
                    <h6 className="w-[100%]">Input Signal</h6>
                    <div className="w-[28%]">
                        <select className=" bg-transparent pt-[3px] pb-[3px] border-[1px] border-[#a3a3a3] rounded-xl text-[12px] font-[500]"
                                value={selectedSignal}
                                onChange={event => {
                                    setSelectedSignal(event.currentTarget.value)
                                    dispatch(setAssociatedSignal(getSignalByName(event.currentTarget.value)))
                                }}>
                            <option value="undefined">UNDEFINED</option>
                            {(availableSignals) && availableSignals.map((signal, index) => {
                                return <option key={index} value={signal.name}>{signal.name}</option>
                            })}
                        </select>
                    </div>
                    <div className="w-[35%]">
                        <button
                            onClick={() => setShowModalSignal(true)}
                            className="w-[100%] border-none bg-transparent underline text-[#a3a3a3] p-0 text-[15px] hover:cursor-pointer hover:text-black"
                        >+New Signal
                        </button>
                    </div>
                    <div className="w-[35%]">
                        <label className="w-[100%] border-none bg-transparent underline text-[#a3a3a3] p-0 text-[15px] hover:cursor-pointer hover:text-black">
                            <input type="file" accept="text/plain" className="hidden"
                                   onInput={event => loadSignal(event)}
                            />
                            Load Signal
                        </label>
                    </div>
                    {selectedProject.signal &&
                        <div className="w-[100%] mt-2 flex">
                            <select className=" bg-transparent pt-[3px] pb-[3px] border-[1px] border-[#a3a3a3] rounded-xl text-[12px] font-[500]"
                                    value={(selectedProject.signal) ? selectedProject.signal.powerPort : 'UNDEFINED'}
                                    onChange={event => {
                                        let port = getPortByName(event.currentTarget.value) as Port
                                        let signal: Signal = {
                                            ...getSignalByName(selectedSignal),
                                            powerPort: port.name
                                        }
                                        dispatch(setAssociatedSignal(signal))
                                    }}>
                                <option value="undefined">UNDEFINED</option>
                                {(selectedProject.ports) && selectedProject.ports.filter(p => p.category === "port" || p.category === "lumped").map((port, index) => {
                                    return <option key={index} value={port.name}>{port.name}</option>
                                })}
                            </select>
                            <span className="ml-6 text-[15px] font-[500]">Select target port of signal</span>
                        </div>
                    }
                    {selectedProject.signal &&
                    <div className="mt-3">
                        <h6>Selected Signal:</h6>
                        <span className="hover:cursor-pointer hover:underline"
                              onClick={() => setShow(true)}>{selectedSignal}</span>
                    </div>
                    }

                </div>
                {selectedProject.signal &&
                    <ModalInputSignal show={show} setShow={setShow} selectedProject={selectedProject}/>
                }
            </div>
        </>
    )
}


