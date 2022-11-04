import React from 'react';
import {Port, RLCParams} from "../../../../../../../../../../../model/Port";
import {useDispatch} from "react-redux";
import {setRLCParams} from "../../../../../../../../../../../store/projectSlice";

interface RLCParamsProps {
    selectedPort: Port
}

export const RLCParamsComponent: React.FC<RLCParamsProps> = ({selectedPort}) => {

    const dispatch = useDispatch()

    return(
        <div className={`mt-3 p-[10px] text-left border-[1px] border-secondaryColor rounded bg-[#f6f6f6]`}>
            <h6>RLC Params</h6>
            <div className="mt-2">
                <span>Resistance</span>
                <input className={`w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl`} type="number"

                       value={(selectedPort.rlcParams.resistance) ? selectedPort.rlcParams.resistance.toString() : "0"}
                       onChange={(event) => dispatch(setRLCParams({
                           ...selectedPort.rlcParams,
                           resistance: parseFloat(event.currentTarget.value)
                       }) as RLCParams)}/>
            </div>
            <div className="mt-2">
                <span>Inductance</span>
                <input className={`w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl`} type="number"
                       value={(selectedPort.rlcParams.inductance) ? selectedPort.rlcParams.inductance.toString() : "0"}
                       onChange={(event) => dispatch(setRLCParams({
                           ...selectedPort.rlcParams,
                           inductance: parseFloat(event.currentTarget.value)
                       }) as RLCParams)
                       }/>
            </div>
            <div className="mt-2">
                <span>Capacitance</span>
                <input className={`w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl`} type="number"
                       value={(selectedPort.rlcParams.capacitance) ? selectedPort.rlcParams.capacitance.toString() : "0"}
                       onChange={(event) => dispatch(setRLCParams({
                           ...selectedPort.rlcParams,
                           capacitance: parseFloat(event.currentTarget.value)
                       }) as RLCParams)}/>
            </div>
        </div>
    )

}