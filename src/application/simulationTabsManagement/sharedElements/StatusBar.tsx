import React from 'react';
import {useSelector} from "react-redux";
import {selectedMenuItemSelector} from "../../../store/tabsAndMenuItemsSlice";
import {selectedProjectSelector} from "../../../store/projectSlice";

export interface StatusBarProps {
    voxelsNumber?: number
}

const StatusBar: React.FC<StatusBarProps> = ({voxelsNumber}) => {

    const menuItemSelected = useSelector(selectedMenuItemSelector)
    const selectedProject = useSelector(selectedProjectSelector);
    return (
        <>
            {selectedProject?.model.components &&
                <div className="w-full bg-gray-300 flex justify-end">
                    {menuItemSelected === "Simulator" &&
                        <div className="pr-5">Voxels Number: <span className="font-bold">{voxelsNumber}</span></div>
                    }
                    <div className="pr-5">unit: <span className="font-bold">{selectedProject?.modelUnit}</span></div>
                </div>
            }
        </>
    )
}

export default StatusBar