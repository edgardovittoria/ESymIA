import React from 'react';
import {BsGrid3X3Gap} from "react-icons/bs";
import {GiHamburgerMenu} from "react-icons/gi";

interface ChartVisualizationModeProps {
    chartVisualizationMode: 'grid' | 'full',
    setChartVisualizationMode: Function,
    chartsScaleMode: 'logarithmic' | 'linear',
    setChartsScaleMode: Function
}

export const ChartVisualizationMode: React.FC<ChartVisualizationModeProps> = (
    {
        chartVisualizationMode, setChartVisualizationMode, chartsScaleMode, setChartsScaleMode
    }
) => {

    return (
        <div className="mt-11 flex justify-between">
            <div className="flex">
                <div
                    className={`box p-[5px] mb-3 flex flex-col items-center border-2 hover:cursor-pointer hover:border-[#0fb25b] ${chartVisualizationMode === 'grid' ? 'border-[#0fb25b]' : ''}`}
                    onClick={() => setChartVisualizationMode('grid')}
                >
                    <BsGrid3X3Gap size={20} color="#0fb25b"/>
                </div>
                <div
                    className={`box p-[5px] ml-2 mb-3 flex flex-col items-center border-2 hover:cursor-pointer hover:border-[#0fb25b] ${chartVisualizationMode === 'full' ? 'border-[#0fb25b]' : ''}`}
                    onClick={() => setChartVisualizationMode('full')}
                >
                    <GiHamburgerMenu size={20} color="#0fb25b"/>
                </div>

            </div>
            <div className="flex">
                <div
                    className={`box p-[5px] mb-3 flex flex-col items-center border-2 hover:cursor-pointer hover:border-[#0fb25b] ${chartsScaleMode === 'logarithmic' ? 'border-[#0fb25b]' : ''}`}
                    onClick={() => setChartsScaleMode('logarithmic')}
                >
                    <span className="text-[12px]">logarithmic</span>
                </div>
                <div
                    className={`box p-[5px] ml-2 mb-3 flex flex-col items-center border-2 hover:cursor-pointer hover:border-[#0fb25b] ${chartsScaleMode === 'linear' ? 'border-[#0fb25b]' : ''}`}
                    onClick={() => setChartsScaleMode('linear')}
                >
                    <span className="text-[12px]">linear</span>
                </div>

            </div>
        </div>
    )

}