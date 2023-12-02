import React from 'react';
import { BsGrid3X3Gap } from "react-icons/bs";
import { GiHamburgerMenu } from "react-icons/gi";
import { useSelector } from "react-redux";
import { selectedProjectSelector } from "../../../../store/projectSlice";
import { Port } from "../../../../model/esymiaModels";
import { pairs } from "./ChartsList";

interface ChartVisualizationModeProps {
    chartVisualizationMode: 'grid' | 'full',
    setChartVisualizationMode: Function,
    chartsScaleMode: 'logarithmic' | 'linear',
    setChartsScaleMode: Function,
    setGraphToVisualize: Function,
    selectedLabel: { label: string, id: number }[],
    setSelectedLabel: Function
}

export const ChartVisualizationMode: React.FC<ChartVisualizationModeProps> = (
    {
        chartVisualizationMode, setChartVisualizationMode, chartsScaleMode, setChartsScaleMode,
        setGraphToVisualize, selectedLabel, setSelectedLabel
    }
) => {

    const selectedProject = useSelector(selectedProjectSelector);
    const ports = selectedProject?.ports.filter(p => p.category === 'port') as Port[]
    const labels = pairs(ports.map(p => p.name))

    return (
        <div className="mt-11 flex justify-between">
            <div className="flex">
                <div
                    className={`box p-[5px] mb-3 flex flex-col items-center border-2 hover:cursor-pointer hover:border-[#0fb25b] ${chartVisualizationMode === 'grid' ? 'border-[#0fb25b]' : ''}`}
                    onClick={() => setChartVisualizationMode('grid')}
                >
                    <BsGrid3X3Gap size={20} color="#0fb25b" />
                </div>
                <div
                    className={`box p-[5px] ml-2 mb-3 flex flex-col items-center border-2 hover:cursor-pointer hover:border-[#0fb25b] ${chartVisualizationMode === 'full' ? 'border-[#0fb25b]' : ''}`}
                    onClick={() => setChartVisualizationMode('full')}
                >
                    <GiHamburgerMenu size={20} color="#0fb25b" />
                </div>
            </div>
            <div className="flex justify-center">
                <select className="select select-success w-full max-w-xs h-[35px] min-h-[35px] mr-2"
                    onChange={(e) => setGraphToVisualize(e.currentTarget.value)}
                >
                    <option selected>All Graph</option>
                    <option>Z</option>
                    <option>Y</option>
                    <option>S</option>
                </select>
                <div className="dropdown dropdown-bottom">
                    <label tabIndex={0} className="select select-success h-[35px] w-[300px] min-h-[35px] mr-2 flex items-center">{selectedLabel.length > 2 ? "Open to see and select ports..." :
                        selectedLabel.reduce((label, currentPc) => label + currentPc.label + " ", "")}</label>
                    <ul tabIndex={0} className="dropdown-content p-2 shadow bg-base-100 rounded-box w-52">
                        <li className="flex flex-row items-center justify-between p-2" key={"All Ports"}>
                            <span>All Ports</span>
                            <input type="checkbox" className="checkbox checkbox-xs"
                                checked={selectedLabel.filter(pc => pc.label === "All Ports").length > 0}
                                value={"All Ports"}
                                onChange={(e) => {
                                    if (e.currentTarget.checked) {
                                        setSelectedLabel([{ label: e.currentTarget.value, id: -1 }])
                                    } else {
                                        setSelectedLabel([])
                                    }
                                }}
                            />
                        </li>
                        {labels.map((l, index) => {
                            return (
                                <li className="flex flex-row items-center justify-between p-2" key={`${l[0]} - ${l[1]}`}>
                                    <span>{`${l[0]} - ${l[1]}`}</span>
                                    <input type="checkbox" className="checkbox checkbox-xs"
                                        checked={selectedLabel.filter(pc => pc.label === `${l[0]} - ${l[1]}`).length > 0}
                                        value={`${l[0]} - ${l[1]}`}
                                        onChange={(e) => {
                                            if (e.currentTarget.checked) {
                                                setSelectedLabel([...selectedLabel.filter(sl => sl.label !== "All Ports"), { label: e.currentTarget.value, id: index }])

                                            } else {
                                                setSelectedLabel(selectedLabel.filter(l => l.label !== e.currentTarget.value))
                                            }
                                        }}
                                    />
                                </li>
                            )
                        })}
                    </ul>
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