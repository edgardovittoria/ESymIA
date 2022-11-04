import React, {Fragment, useState} from 'react';
import {Signal, SignalValues} from "../../../../../../../../../../model/Port";
import {saveSignal} from "../../../../../../../../../../faunadb/api/signalsAPIs";
import { useFaunaQuery } from 'cad-library';
import {useGetAvailableSignals} from "../../../../../../../hooks/useGetAvailableSignals";
import {Dialog, Transition} from "@headlessui/react";

interface ModalSignalsProps {
    showModalSignal: boolean,
    setShowModalSignal: Function,
}

export const ModalSignals: React.FC<ModalSignalsProps> = (
    {
        showModalSignal, setShowModalSignal
    }
) => {

    const [signalName, setSignalName] = useState('');
    const [signalType, setSignalType] = useState('current');

    const [frequency, setFrequency] = useState<number | string>('');
    const [signalRe, setSignalRe] = useState<number | string>('');
    const [signalIm, setSignalIm] = useState<number | string>('');
    const [signalValuesArray, setSignalValuesArray] = useState<SignalValues[]>([]);
    const {availableSignals, setAvailableSignals} = useGetAvailableSignals()
    const {execQuery} = useFaunaQuery()

    function onModalClose() {
        setSignalValuesArray([])
        setFrequency('')
        setSignalRe('')
        setSignalIm('')
        setSignalName('')
        setSignalType('current')
        setShowModalSignal(false)
    }


    return (
        <Transition appear show={showModalSignal} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={onModalClose}>
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
                                className="w-full max-w-[1200px] h-[650px] mt-14 bg-white transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900"
                                >
                                    DEFINE NEW SIGNAL
                                </Dialog.Title>
                                <hr className="mt-2 mb-3"/>
                                <div className="flex mb-3">
                                    <h5>Insert signal's name and type</h5>
                                </div>
                                <div className="flex">
                                    <div className="w-1/2">
                                        <label className="mb-2">Name</label>
                                        <input type="text"
                                               className="rounded border-[1px] border-secondaryColor w-[75%] p-[2px] formControl"
                                               value={signalName}
                                               onChange={(event) => {
                                                   setSignalName(event.currentTarget.value)
                                               }}
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <label className="mb-2">Type</label>
                                        <select className="rounded border-[1px] border-secondaryColor w-[75%] p-[2px] block bg-transparent h-[35px] p-[2px]" onChange={(event) => {
                                            setSignalType(event.currentTarget.value)
                                        }}>
                                            <option value="current">Current</option>
                                            <option value="voltage">Voltage</option>
                                        </select>
                                    </div>
                                </div>
                                <hr className="mt-10 mb-5"/>
                                <div className="flex mb-4">
                                    <h5>Insert frequency and signal values</h5>
                                </div>
                                <div className="flex">
                                    <div className="w-1/4">
                                        <label className="mb-2">Frequency(float)</label>
                                        <input type="number"
                                               className="rounded border-[1px] border-secondaryColor w-[75%] p-[2px] formControl"
                                               value={frequency}
                                               onChange={(event) => {
                                                   setFrequency(parseFloat(event.currentTarget.value))
                                               }}
                                        />
                                    </div>
                                    <div className="w-3/4">
                                        <label className="mb-2">Signal(complex)</label>
                                        <div className="flex">
                                            <div className="w-1/3">
                                                <input type="number"
                                                       className="rounded border-[1px] border-secondaryColor w-[75%] p-[2px] formControl"
                                                       placeholder="Re"
                                                       value={signalRe}
                                                       onChange={(event) => {
                                                           setSignalRe(parseFloat(event.currentTarget.value))
                                                       }}
                                                />
                                            </div>
                                            <div className="w-1/3">
                                                <input type="number"
                                                       className="rounded border-[1px] border-secondaryColor w-[75%] p-[2px] formControl"
                                                       placeholder="Im"
                                                       value={signalIm}
                                                       onChange={(event) => {
                                                           setSignalIm(parseFloat(event.currentTarget.value))
                                                       }}
                                                />
                                            </div>
                                            <div className="w-1/3">
                                                <button className="button buttonPrimary w-full h-[35px] text-[12px] font-bold"
                                                        onClick={() => {
                                                            let tableRow: SignalValues = {
                                                                freq: frequency as number,
                                                                signal: {
                                                                    Re: signalRe as number,
                                                                    Im: signalIm as number
                                                                }
                                                            }
                                                            setSignalValuesArray([...signalValuesArray, tableRow]);
                                                            setFrequency('')
                                                            setSignalRe('')
                                                            setSignalIm('')
                                                        }}
                                                >ADD VALUE
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {signalValuesArray.length > 0 &&
                                    <>
                                        <hr className="mt-4"/>
                                        <div className={`flex max-h-[250px] overflow-scroll`}>
                                            <table className="w-1/2 mt-1 ml-3">
                                                <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Frequency</th>
                                                    <th>Signal(Re+Im)</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {signalValuesArray.map((row, index) => {
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
                                        <div className="flex mt-2">
                                            <button className="button buttonPrimary w-full h-[35px] text-[12px] font-bold"
                                                    onClick={async () => {
                                                        let newSignal: Signal = {
                                                            id: signalName,
                                                            name: signalName,
                                                            type: signalType,
                                                            signalValues: signalValuesArray,
                                                            powerPort: undefined
                                                        }
                                                        let confirm = window.confirm('Are you sure to save the signal?');
                                                        if(confirm){
                                                            setAvailableSignals([...availableSignals, newSignal])
                                                            await execQuery(saveSignal, newSignal)
                                                            onModalClose()
                                                        }

                                                    }}
                                            >ADD SIGNAL
                                            </button>
                                        </div>
                                    </>
                                }
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )

}