import React, {Fragment} from 'react';
import {SignalChart} from "../inputSignalManagement/components/inputSignal/components/SignalChart";
import {Signal} from "../../../../../../../../../../model/Port";
import {Project} from "../../../../../../../../../../model/Project";
import {Dialog, Transition} from "@headlessui/react";

interface ModalInputSignalProps {
    show: boolean,
    setShow: Function,
    selectedProject: Project
}

export const ModalInputSignal: React.FC<ModalInputSignalProps> = (
    {
        show, setShow, selectedProject
    }
) => {

    return (
        <Transition appear show={show} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => setShow(false)}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25"/>
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel
                                className="w-full max-w-[1200px] h-[650px] mt-14 transform overflow-hidden rounded-2xl bg-violet-50 p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900"
                                >
                                    {(selectedProject.signal) && selectedProject.signal.name}
                                </Dialog.Title>
                                <hr className="mt-2 mb-3 border-violet-700"/>
                                <div className="flex justify-center text-center py-3 h-50">
                                    <div className="w-1/2 border-[1px] border-secondaryColor rounded-xl h-[200px] overflow-scroll p-[10px] bg-[#f6f6f6] shadow-xl">
                                        <table className="w-full">
                                            <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Frequency</th>
                                                <th>Signal(Re+Im)</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {(selectedProject.signal) &&
                                                selectedProject.signal.signalValues.map((row, index) => {
                                                    return (
                                                        <tr key={index}>
                                                            <td>{index}</td>
                                                            <td>{row.freq}</td>
                                                            <td>{row.signal.Re} + {row.signal.Im}i</td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                </div>
                                <div className="flex mt-10 justify-between">
                                    <div className="w-[45%]">
                                        <SignalChart signal={selectedProject.signal ?? {} as Signal} type="module"/>
                                    </div>
                                    <div className="w-[45%]">
                                        <SignalChart signal={selectedProject.signal ?? {} as Signal} type="phase"/>
                                    </div>

                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>

    )

}