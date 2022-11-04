import React, {Fragment} from 'react';
import {Port, Probe} from "../../../../../../../../../../model/Port";

import {useDispatch} from "react-redux";
import {setPortType} from "../../../../../../../../../../store/projectSlice";
import {Dialog, Transition} from "@headlessui/react";

interface ModalSelectPortTypeProps {
    show: boolean,
    setShow: Function,
    selectedPort: Port | Probe,
}

export const ModalSelectPortType: React.FC<ModalSelectPortTypeProps> = (
    {
        show, setShow, selectedPort
    }
) => {

    const dispatch = useDispatch()

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
                                className="w-full max-w-[800px] h-[450px] mt-14 transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900"
                                >
                                    SELECT PORT TYPE
                                </Dialog.Title>
                                <hr className="mt-2 mb-3"/>
                                <div className="flex">
                                    <div
                                        className="w-1/3 text-center hover:bg-green-100"
                                        onClick={() => {
                                            dispatch(setPortType({name: selectedPort.name, type: 1}))
                                            setShow(false)
                                        }}
                                    >
                                        <img src="portType1.png" className="mx-auto" alt="img"/>
                                        <div>Type 1</div>
                                    </div>
                                    <div
                                        className="w-1/3 text-center hover:bg-green-100"
                                        onClick={() => {
                                            dispatch(setPortType({name: selectedPort.name, type: 2}))
                                            setShow(false)
                                        }}
                                    >
                                        <img src="portType2.png" className="mx-auto" alt="img"/>
                                        <div>Type 2</div>
                                    </div>
                                    <div
                                        className="w-1/3 text-center hover:bg-green-100"
                                        onClick={() => {
                                            dispatch(setPortType({name: selectedPort.name, type: 3}))
                                            setShow(false)
                                        }}
                                    >
                                        <img src="portType3.png" className="mx-auto" alt="img"/>
                                        <div>Type 3</div>
                                    </div>
                                </div>
                                <div className="flex items-baseline">
                                    <div
                                        className="w-1/2 text-center hover:bg-green-100"
                                        onClick={() => {
                                            dispatch(setPortType({name: selectedPort.name, type: 4}))
                                            setShow(false)
                                        }}
                                    >
                                        <img src="portType4.png" className="mx-auto" alt="img"/>
                                        <div>Type 4</div>
                                    </div>
                                    <div
                                        className="w-1/2 text-center hover:bg-green-100"
                                        onClick={() => {
                                            dispatch(setPortType({name: selectedPort.name, type: 5}))
                                            setShow(false)
                                        }}
                                    >
                                        <img src="portType5.png" className="mx-auto" alt="img"/>
                                        <div>Type 5</div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
        /*<Modal show={show} onHide={() => setShow(false)} size="lg" >
            <Modal.Header closeButton>
                <Modal.Title>SELECT PORT TYPE</Modal.Title>
            </Modal.Header>
            <Modal.Body>

            </Modal.Body>
        </Modal>*/
    )

}