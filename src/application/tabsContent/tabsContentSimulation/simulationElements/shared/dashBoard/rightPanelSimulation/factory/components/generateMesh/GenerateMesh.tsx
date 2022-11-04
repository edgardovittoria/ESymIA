import React, {useEffect} from 'react';
import {AiOutlineThunderbolt} from "react-icons/ai";
import {useDispatch, useSelector} from "react-redux";
import {
    DownloadPercentageSelector,
    MeshApprovedSelector, MesherOutputSelector,
    MeshGeneratedSelector, setDownloadPercentage, setMeshApproved,
    setMeshGenerated
} from "../../../../../../../../../../store/mesherSlice";
import {
    setSimulationStatus,
    setSolverDownloadPercentage,
    SimulationStatusSelector,
    SolverDownloadPercentageSelector
} from "../../../../../../../../../../store/solverSlice";

interface GenerateMeshProps {
    quantumDimensions: [number, number, number],
    setQuantumDimensions: Function,
    setMenuItem: Function
}

export const GenerateMesh: React.FC<GenerateMeshProps> = (
    {
        quantumDimensions, setQuantumDimensions, setMenuItem
    }
) => {

    const meshApproved = useSelector(MeshApprovedSelector)
    const meshGenerated = useSelector(MeshGeneratedSelector)
    const mesherOutput = useSelector(MesherOutputSelector)
    const mesherDownloadPercentage = useSelector(DownloadPercentageSelector)
    const solverDownloadPercentage = useSelector(SolverDownloadPercentageSelector)
    const simulationStatus = useSelector(SimulationStatusSelector)

    const dispatch = useDispatch()

    function checkQuantumDimensionsValidity() {
        let validity = true
        quantumDimensions.forEach(v => {
            if (v === 0) {
                validity = false
            }
        })
        return validity
    }

    useEffect(() => {
        if (mesherOutput) {
            setQuantumDimensions([
                mesherOutput.cell_size.cell_size_x,
                mesherOutput.cell_size.cell_size_y,
                mesherOutput.cell_size.cell_size_z
            ])
        }
        if(mesherDownloadPercentage < 10 && meshGenerated !== "Not Generated"){
            setTimeout(() => {
                dispatch(setDownloadPercentage(mesherDownloadPercentage+1))
            }, 500)
        }
        if(mesherDownloadPercentage === 10) dispatch(setMeshGenerated('Generated'))
        if(solverDownloadPercentage < 10 && simulationStatus === "started"){
            setTimeout(() => {
                dispatch(setSolverDownloadPercentage(solverDownloadPercentage+1))
            }, 500)
        }
    }, [meshGenerated, mesherDownloadPercentage, solverDownloadPercentage, simulationStatus]);




    return (
        <>
            <div
                className="flex-col absolute right-[2%] top-[160px] w-[22%] rounded-tl rounded-tr bg-white p-[10px] shadow-2xl border-b border-secondaryColor">
                <div className="flex">
                    <AiOutlineThunderbolt style={{width: "25px", height: "25px"}}/>
                    <h5 className="ml-2">Mesh Generation</h5>
                </div>
                <hr className="mt-1"/>
                <div className={`mt-3 p-[10px] text-left border-[1px] border-secondaryColor rounded bg-[#f6f6f6]`}>
                    <h6>Set quantum's dimensions</h6>
                    <div className="mt-2">
                        <span>X,Y,Z</span>
                        <div className="flex justify-between mt-2">
                            <div className="w-[30%]">
                                <input
                                    min={0}
                                    className={`w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl`}
                                    type="number"
                                    step={.000001}
                                    value={quantumDimensions[0]}
                                    onChange={(event) => setQuantumDimensions([parseFloat(event.target.value), quantumDimensions[1], quantumDimensions[2]])}
                                />
                            </div>
                            <div className="w-[30%]">
                                <input
                                    min={0.000000}
                                    className={`w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl`}
                                    type="number"
                                    step={.000001}
                                    value={quantumDimensions[1]}
                                    onChange={(event) => setQuantumDimensions([quantumDimensions[0], parseFloat(event.target.value), quantumDimensions[2]])}
                                />
                            </div>
                            <div className="w-[30%]">
                                <input
                                    min={0}
                                    className={`w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl`}
                                    type="number"
                                    step={.000001}
                                    value={quantumDimensions[2]}
                                    onChange={(event) => setQuantumDimensions([quantumDimensions[0], quantumDimensions[1], parseFloat(event.target.value)])}
                                />
                            </div>

                        </div>
                    </div>
                </div>
                <div className="w-[100%] pt-4">
                    <div className="flex-column">
                        {simulationStatus === 'started' &&
                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-secondaryColor">
                                        Task in progress
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-xs font-semibold inline-block text-primaryColor">
                                        {solverDownloadPercentage*10}%
                                      </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                                    <div style={{width: `${solverDownloadPercentage*10}%`}}
                                         className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-secondaryColor"></div>
                                </div>
                            </div>
                        }
                        {(meshGenerated === "Not Generated") &&
                            <div>
                                <button
                                    className={checkQuantumDimensionsValidity() ? "button buttonPrimary w-[100%]" : "button bg-gray-300 text-gray-600 opacity-70 w-[100%]"}
                                    disabled={!checkQuantumDimensionsValidity()}
                                    onClick={() => dispatch(setMeshGenerated("Generating"))}
                                >Generate Mesh
                                </button>
                            </div>}
                        {(meshGenerated === "Generating") &&
                            <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                    <div>
                                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-secondaryColor">
                                        Task in progress
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-xs font-semibold inline-block text-primaryColor">
                                        {mesherDownloadPercentage*10}%
                                      </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                                    <div style={{width: `${mesherDownloadPercentage*10}%`}}
                                         className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-secondaryColor"></div>
                                </div>
                            </div>
                        }
                        {(meshGenerated === "Generated" && !meshApproved) &&
                            <div className="flex justify-between">
                                <button
                                    className="button buttonPrimary w-[48%]"
                                    disabled={!checkQuantumDimensionsValidity()}
                                    onClick={() => {
                                        dispatch(setMeshGenerated("Generating"))
                                        dispatch(setDownloadPercentage(0))
                                    }}
                                >Regenerate
                                </button>
                                <button
                                    className="button buttonPrimary w-[48%]"
                                    onClick={() => {
                                        dispatch(setMeshApproved(true))
                                        dispatch(setDownloadPercentage(0))
                                    }}
                                >Start Simulation
                                </button>
                            </div>
                        }
                        {simulationStatus === 'completed' && meshApproved &&
                            <button
                                className="button buttonPrimary w-[100%]"
                                onClick={() => {
                                    dispatch(setMeshApproved(false))
                                    dispatch(setSimulationStatus("notStarted"))
                                    dispatch(setSolverDownloadPercentage(0))
                                    setMenuItem('Results')
                                }}
                            >Results</button>
                        }
                    </div>
                </div>
            </div>
        </>
    )

}