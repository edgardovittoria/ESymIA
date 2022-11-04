import React from 'react';
import {Port} from "../../../../../../../../../../../model/Port";


interface PortTypeProps {
    setShow: Function,
    selectedPort: Port
}

export const PortType: React.FC<PortTypeProps> = ({setShow, selectedPort}) => {
    return(
        <div className="p-[10px] text-center border-[1px] border-secondaryColor bg-[#f6f6f6]">
            <div className="w-100 text-start">
                <h6>Port Type</h6>
            </div>
            <button
                className="button buttonPrimary mb-2 w-100"
                onClick={() => setShow(true)}
            >Choose the port type
            </button>
            {selectedPort.type === 1 && <img className="m-auto" src="portType1.png" alt="port type 1"/>}
            {selectedPort.type === 2 && <img className="m-auto" src="portType2.png" alt="port type 2"/>}
            {selectedPort.type === 3 && <img className="m-auto" src="portType3.png" alt="port type 3"/>}
            {selectedPort.type === 4 && <img className="m-auto" src="portType4.png" alt="port type 4"/>}
            {selectedPort.type === 5 && <img className="m-auto" src="portType5.png" alt="port type 5"/>}

        </div>
    )

}