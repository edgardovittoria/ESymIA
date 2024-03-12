import React, { ReactNode } from 'react';

interface RightPanelSimulationProps {
    children: ReactNode
}

export const RightPanelSimulation: React.FC<RightPanelSimulationProps> = (
    {children}
) => {
    return (
        <>
            {children}
        </>
    )

}