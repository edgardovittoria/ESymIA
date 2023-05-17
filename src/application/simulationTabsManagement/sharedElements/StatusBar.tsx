import React from 'react';
import {useSelector} from "react-redux";
import {selectedMenuItemSelector} from "../../../store/tabsAndMenuItemsSlice";
import {selectedProjectSelector} from "../../../store/projectSlice";

export interface StatusBarProps {
    voxelsPainted?: number,
    totalVoxels?: number,
}

const StatusBar: React.FC<StatusBarProps> = ({voxelsPainted, totalVoxels}) => {

    const menuItemSelected = useSelector(selectedMenuItemSelector)
    const selectedProject = useSelector(selectedProjectSelector);
    return (
        <>
            {selectedProject?.model.components &&
                <div className="w-full bg-gray-300 flex justify-end">
                    {menuItemSelected === "Simulator" &&
                        <>
                            <div className="pr-5">Voxels Painted: <span className="font-bold">{voxelsPainted}</span></div>
                            <div className="pr-5">Total Voxels: <span className="font-bold">{totalVoxels}</span></div>
                        </>
                    }
                    <div className="pr-5">Distance Unit: <span className="font-bold">{selectedProject?.modelUnit}</span>
                    </div>
                </div>
            }
        </>
    )
}

export default StatusBar