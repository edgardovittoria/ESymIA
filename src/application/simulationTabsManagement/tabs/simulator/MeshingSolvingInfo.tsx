import { ComponentEntity, exportToSTL, Material, useFaunaQuery } from "cad-library";
import React, { useEffect, useState } from "react";
import { AiOutlineCheckCircle, AiOutlineThunderbolt } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { setSolverOutput } from "../../../../store/solverSlice";
import {
    deleteSimulation,
    setMesh,
    setMeshApproved,
    setMeshGenerated,
    setQuantum,
    unsetMesh,
    updateSimulation,
} from "../../../../store/projectSlice";
import axios from "axios";
import { MesherOutput } from "./MesherInputOutput";
import { deleteFileS3, uploadFileS3 } from "../../../../aws/mesherAPIs";
import { selectMenuItem } from "../../../../store/tabsAndMenuItemsSlice";
import { ImSpinner } from "react-icons/im";
import { Project, Simulation, SolverOutput } from "../../../../model/esymiaModels";
import { getMaterialListFrom } from "./Simulator";
import useWebSocket from "react-use-websocket";
import { updateProjectInFauna } from "../../../../faunadb/projectsFolderAPIs";
import { convertInFaunaProjectThis } from "../../../../faunadb/apiAuxiliaryFunctions";


interface MeshingSolvingInfoProps {
    selectedProject: Project;
    mesherOutput?: MesherOutput;
    allMaterials?: Material[]
}

export const MeshingSolvingInfo: React.FC<MeshingSolvingInfoProps> = ({
    selectedProject,
    mesherOutput,
    allMaterials
}) => {

    const dispatch = useDispatch();
    const { execQuery } = useFaunaQuery()
    let quantumDimensions = selectedProject.meshData.quantum;
    let meshApproved = selectedProject.meshData.meshApproved;
    let meshGenerated = selectedProject.meshData.meshGenerated;

    const [solverIterations, setSolverIterations] = useState<[number, number]>([100, 1])
    const [convergenceThreshold, setConvergenceThreshold] = useState(0.0001)
    const [frequenciesNumber, setFrequenciesNumber] = useState(0)

    useEffect(() => {
        if (typeof selectedProject.meshData.mesh === 'string') {
            execQuery(updateProjectInFauna, convertInFaunaProjectThis(selectedProject)).then(() => {
            })
        }
    }, [selectedProject.meshData.mesh]);

    const solverInputFrom = (project: Project, solverIterations: [number, number], convergenceThreshold: number) => {
        let frequencyArray: number[] = [];
        if (project)
            project.signal?.signalValues.forEach((sv) =>
                frequencyArray.push(sv.freq)
            );
        setFrequenciesNumber(frequencyArray.length)
        let signalsValuesArray: { Re: number; Im: number }[] = [];
        if (project)
            project.signal?.signalValues.forEach((sv) =>
                signalsValuesArray.push(sv.signal)
            );

        return {
            mesherOutput: mesherOutput,
            solverInput: {
                ports: project.ports.filter(p => p.category === 'port'),
                lumped_elements: project.ports.filter(p => p.category === 'lumped'),
                materials: getMaterialListFrom(project?.model?.components as ComponentEntity[]),
                frequencies: frequencyArray,
                signals: signalsValuesArray,
                powerPort: (project) && project.signal?.powerPort,
                unit: selectedProject.modelUnit
            },
            solverAlgoParams: {
                innerIteration: solverIterations[0],
                outerIteration: solverIterations[1],
                convergenceThreshold: convergenceThreshold
            },
        }
    }

    function generateSTLListFromComponents(
        materialList: Material[],
        components: ComponentEntity[]
    ) {
        let filteredComponents: ComponentEntity[][] = [];

        materialList.forEach((m) => {
            components &&
                filteredComponents.push(
                    components.filter((c) => c.material?.name === m.name)
                );
        });

        let STLList: { material: string; STL: string }[] = [];

        filteredComponents.forEach((fc) => {
            let STLToPush = exportToSTL(fc);
            STLList.push({
                material: fc[0].material?.name as string,
                STL: STLToPush,
            });
        });
        return STLList;
    }

    function checkQuantumDimensionsValidity() {
        let validity = true;
        quantumDimensions.forEach((v) => {
            if (v === 0) {
                validity = false;
            }
        });
        return validity;
    }

    const WS_URL = 'ws://127.0.0.1:8080';
    const [computingP, setComputingP] = useState(false)
    const [computingLpx, setComputingLpx] = useState(false)
    const [computingLpy, setComputingLpy] = useState(false)
    const [computingLpz, setComputingLpz] = useState(false)
    const [doingIterations, setDoingIterations] = useState(false)
    const [iterations, setIterations] = useState(0)

    /*useWebSocket(WS_URL, {
        onOpen: () => {
            console.log('WebSocket connection established.');
        },
        shouldReconnect: (event) => true,
        onMessage: (event) => {
            if (event.data === "P Computing Completed") {
                setComputingP(true)
            }
            if (event.data === "LPx Computing Completed") {
                setComputingLpx(true)
            }
            if (event.data === "LPy Computing Completed") {
                setComputingLpy(true)
            }
            if (event.data === "LPz Computing Completed") {
                setComputingLpz(true)
                setDoingIterations(true)
            }
            setIterations(event.data)
        },
        onClose: () => {
            console.log('WebSocket connection closed.')
        }
    });*/

    // Solver launch and get results
    useEffect(() => {
        if (meshApproved && !selectedProject.simulation) {
            let simulation: Simulation = {
                name: selectedProject?.name + " - sim",
                started: Date.now().toString(),
                ended: "",
                results: {} as SolverOutput,
                status: "Queued",
                associatedProject: selectedProject?.faunaDocumentId as string,
                solverAlgoParams: {
                    innerIteration: solverIterations[0],
                    outerIteration: solverIterations[1],
                    convergenceThreshold: convergenceThreshold
                }
            };
            dispatch(updateSimulation(simulation));

            //https://teemaserver.cloud/solving
            axios.post("http://127.0.0.1:8002/solving", solverInputFrom(selectedProject, solverIterations, convergenceThreshold)).then((res) => {
                dispatch(setSolverOutput(res.data));
                let simulationUpdated: Simulation = {
                    ...simulation,
                    results: res.data,
                    ended: Date.now().toString(),
                    status: "Completed",
                };
                dispatch(updateSimulation(simulationUpdated));
            }).catch(err => {
                console.log(err)
                window.alert("Error while solving, please try again")
                dispatch(deleteSimulation());
                dispatch(setMeshApproved(false));
            })
            setComputingP(false)
            setComputingLpx(false)
            setComputingLpy(false)
            setComputingLpz(false)
            setDoingIterations(false)
        }
    }, [meshApproved]);


    const saveMeshToS3 = async (mesherOutput: any) => {
        let blobFile = new Blob([JSON.stringify(mesherOutput)]);
        let meshFile = new File([blobFile], `mesh.json`, {
            type: "application/json",
        });

        uploadFileS3(meshFile).then((res) => {
            if (res) {
                dispatch(setMesh(res.key));
            }
        });
    };

    // Show updated quantum values whenever the mesh gets updated.
    useEffect(() => {
        if (mesherOutput) {
            dispatch(
                setQuantum([
                    mesherOutput.cell_size.cell_size_x * 1000,
                    mesherOutput.cell_size.cell_size_y * 1000,
                    mesherOutput.cell_size.cell_size_z * 1000,
                ])
            );
        }
    }, [mesherOutput])

    // Mesh generation and storage on S3.
    useEffect(() => {
        if (meshGenerated === "Generating") {
            let components = selectedProject?.model?.components as ComponentEntity[];
            let objToSendToMesher = {
                STLList:
                    components && allMaterials &&
                    generateSTLListFromComponents(
                        allMaterials,
                        components
                    ),
                quantum: quantumDimensions,
            };
            //local meshing: http://127.0.0.1:8003/meshing
            //lambda aws meshing: https://wqil5wnkowc7eyvzkwczrmhlge0rmobd.lambda-url.eu-west-2.on.aws/
            axios.post('http://127.0.0.1:8003/meshing', objToSendToMesher).then((res) => {
                if(res.data.x){
                    dispatch(setMeshGenerated("Not Generated"))
                    alert(`the size of the quantum on x is too large compared to the size of the model on x. Please reduce the size of the quantum on x! x must be less than ${res.data.max_x}`)
                }else if(res.data.y){
                    dispatch(setMeshGenerated("Not Generated"))
                    alert(`the size of the quantum on y is too large compared to the size of the model on y. Please reduce the size of the quantum on y! y must be less than ${res.data.max_y}`)
                } else if(res.data.z){
                    dispatch(setMeshGenerated("Not Generated"))
                    alert(`the size of the quantum on z is too large compared to the size of the model on z. Please reduce the size of the quantum on z! z must be less than ${res.data.max_x}`)
                }
                else{
                    let grids: any[] = []
                    for (let value of Object.values(res.data.mesher_matrices)) {
                        grids.push(value);
                    }
                    let grids_external = create_Grids_externals(grids)
                    let data = { ...res.data.mesher_matrices }
                    Object.keys(res.data.mesher_matrices).forEach((k, index) => {
                        data[k] = grids_external[index]
                    })
                    res.data.externalGrids = data
                    if (selectedProject.meshData.mesh) {
                        deleteFileS3(selectedProject.meshData.mesh).then(() => {
                        })
                    }
                    saveMeshToS3((res.data)).then((res) => {
                        dispatch(setMeshGenerated("Generated"))
                    });
                }

            }).catch((err) => {
                if (err) {
                    window.alert("Error while generating mesh, please try again")
                    dispatch(setMeshGenerated("Not Generated"))
                    dispatch(unsetMesh())
                    console.log(err)
                }
            })
        }
    }, [meshGenerated]);

    return (
        <>
            {selectedProject.simulation?.status === "Queued" && (
                <>
                    <div
                        className="absolute right-[42%] top-1/2 flex flex-col justify-center items-center bg-white p-8 rounded-xl">
                        <h5 className="mb-2">Computing P</h5>
                        <div className="flex flex-row justify-between items-center">
                            {computingP ?
                                <div className="flex flex-row justify-between items-center">
                                    <progress className="progress w-56 mr-4" value={1} max={1} />
                                    <AiOutlineCheckCircle size="20px" className="text-green-500" />
                                </div> : <progress className="progress w-56" />
                            }
                        </div>
                        <h5 className="mb-2">Computing Lpx</h5>
                        {computingLpx ?
                            <div className="flex flex-row justify-between items-center">
                                <progress className="progress w-56 mr-4" value={1} max={1} />
                                <AiOutlineCheckCircle size="20px" className="text-green-500" />
                            </div> : <progress className="progress w-56" />
                        }
                        <h5 className="mb-2">Computing Lpy</h5>
                        {computingLpy ?
                            <div className="flex flex-row justify-between items-center">
                                <progress className="progress w-56 mr-4" value={1} max={1} />
                                <AiOutlineCheckCircle size="20px" className="text-green-500" />
                            </div> : <progress className="progress w-56" />
                        }
                        <h5 className="mb-2">Computing Lpz</h5>
                        {computingLpz ?
                            <div className="flex flex-row justify-between items-center">
                                <progress className="progress w-56 mr-4" value={1} max={1} />
                                <AiOutlineCheckCircle size="20px" className="text-green-500" />
                            </div> : <progress className="progress w-56" />
                        }
                        <h5 className="mb-2">Doing Iterations</h5>
                        <progress className="progress w-56" value={iterations} max={frequenciesNumber} />
                    </div>

                </>

            )}
            {meshGenerated === "Generating" &&
                <ImSpinner className={`animate-spin w-12 h-12 absolute left-1/2 top-1/2`} />}
            <div
                className={`${(meshGenerated === "Generating" || selectedProject.simulation?.status === "Queued") && 'opacity-40'} flex-col absolute right-[2%] top-[160px] w-[22%] rounded-tl rounded-tr bg-white p-[10px] shadow-2xl border-b border-secondaryColor`}>
                <div className="flex">
                    <AiOutlineThunderbolt style={{ width: "25px", height: "25px" }} />
                    <h5 className="ml-2">Meshing and Solving Info</h5>
                </div>
                <hr className="mt-1" />
                <div
                    className={`mt-3 p-[10px] text-left border-[1px] border-secondaryColor rounded bg-[#f6f6f6]`}
                >
                    <h6>Set quantum's dimensions</h6>
                    <div className="mt-2">
                        <span>X,Y,Z</span>
                        <div className="flex justify-between mt-2">
                            {quantumDimensions.map((quantumComponent, indexQuantumComponent) =>
                                <div className="w-[30%]">
                                    <input
                                        disabled={
                                            selectedProject.simulation?.status === "Completed" ||
                                            selectedProject.model?.components === undefined
                                        }
                                        min={0.0}
                                        className={`w-full p-[4px] border-[1px] border-[#a3a3a3] text-[12px] font-bold rounded formControl`}
                                        type="number"
                                        step={0.000001}
                                        value={quantumComponent}
                                        onChange={(event) => {
                                            if (indexQuantumComponent === 0) {
                                                dispatch(
                                                    setQuantum([
                                                        parseFloat(event.target.value),
                                                        quantumDimensions[1],
                                                        quantumDimensions[2],
                                                    ])
                                                )
                                            }
                                            else if (indexQuantumComponent === 1){
                                                dispatch(
                                                    setQuantum([
                                                        quantumDimensions[0],
                                                        parseFloat(event.target.value),
                                                        quantumDimensions[2],
                                                    ])
                                                )
                                            }
                                            else if (indexQuantumComponent === 2){
                                                dispatch(
                                                    setQuantum([
                                                        quantumDimensions[0],
                                                        quantumDimensions[1],
                                                        parseFloat(event.target.value),
                                                    ])
                                                )
                                            }
                                        }

                                        }

                                    />
                                </div>
                            )}
                            {/* <div className="w-[30%]">
                                <input
                                    disabled={
                                        selectedProject.simulation?.status === "Completed" ||
                                        selectedProject.model?.components === undefined
                                    }
                                    min={0.0}
                                    className={`w-full p-[4px] border-[1px] border-[#a3a3a3] text-[12px] font-bold rounded formControl`}
                                    type="number"
                                    step={0.000001}
                                    value={quantumDimensions[1]}
                                    onChange={(event) =>
                                        dispatch(
                                            setQuantum([
                                                quantumDimensions[0],
                                                parseFloat(event.target.value),
                                                quantumDimensions[2],
                                            ])
                                        )
                                    }
                                />
                            </div> */}
                            {/* <div className="w-[30%]">
                                <input
                                    disabled={
                                        selectedProject.simulation?.status === "Completed" ||
                                        selectedProject.model?.components === undefined
                                    }
                                    min={0.0}
                                    className={`w-full p-[4px] border-[1px] border-[#a3a3a3] text-[12px] font-bold rounded formControl`}
                                    type="number"
                                    step={0.000001}
                                    value={quantumDimensions[2]}
                                    onChange={(event) =>
                                        dispatch(
                                            setQuantum([
                                                quantumDimensions[0],
                                                quantumDimensions[1],
                                                parseFloat(event.target.value),
                                            ])
                                        )
                                    }
                                />
                            </div> */}
                        </div>
                    </div>
                </div>
                <div className="w-[100%] pt-4">
                    <div className="flex-column">
                        {meshGenerated === "Not Generated" && (
                            <div>
                                <button
                                    className={
                                        checkQuantumDimensionsValidity()
                                            ? "button buttonPrimary w-[100%]"
                                            : "button bg-gray-300 text-gray-600 opacity-70 w-[100%]"
                                    }
                                    disabled={!checkQuantumDimensionsValidity()}
                                    onClick={() => dispatch(setMeshGenerated("Generating"))}
                                >
                                    Generate Mesh
                                </button>
                            </div>
                        )}
                        {((meshGenerated === "Generated" && !meshApproved) || selectedProject.simulation?.status === "Failed") && (
                            <div className={`flex justify-between`}>
                                <button
                                    className="button buttonPrimary w-full"
                                    disabled={!checkQuantumDimensionsValidity()}
                                    onClick={() => {
                                        dispatch(setMeshGenerated("Generating"));
                                        deleteFileS3(selectedProject.meshData.mesh as string).then(() => {
                                            dispatch(unsetMesh())
                                        })
                                    }}
                                >
                                    Regenerate
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div
                    className={`mt-3 p-[10px] text-left border-[1px] border-secondaryColor rounded bg-[#f6f6f6]`}
                >
                    <h6>Solver Iterations</h6>
                    <div className="mt-2">
                        <span>Inner, Outer</span>
                        <div className="flex justify-between mt-2">
                            <div className="w-[45%]">
                                <input
                                    disabled={
                                        selectedProject.simulation?.status === "Completed" ||
                                        meshGenerated !== "Generated"
                                    }
                                    min={1}
                                    className={`w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl`}
                                    type="number"
                                    step={1}
                                    value={selectedProject.simulation ? selectedProject.simulation.solverAlgoParams.innerIteration : solverIterations[0]}
                                    onChange={(event) => {
                                        setSolverIterations([parseInt(event.target.value), solverIterations[1]])
                                    }}
                                />
                            </div>
                            <div className="w-[45%]">
                                <input
                                    disabled={
                                        selectedProject.simulation?.status === "Completed" ||
                                        meshGenerated !== "Generated"
                                    }
                                    min={1}
                                    className={`w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl`}
                                    type="number"
                                    step={1}
                                    value={selectedProject.simulation ? selectedProject.simulation.solverAlgoParams.outerIteration : solverIterations[1]}
                                    onChange={(event) => {
                                        setSolverIterations([solverIterations[0], parseInt(event.target.value)])
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className={`mt-3 p-[10px] text-left border-[1px] border-secondaryColor rounded bg-[#f6f6f6]`}
                >
                    <h6>Convergence Threshold</h6>
                    <div className="mt-2">
                        <div className="flex justify-between mt-2">
                            <div className="w-full">
                                <input
                                    disabled={
                                        selectedProject.simulation?.status === "Completed" ||
                                        meshGenerated !== "Generated"
                                    }
                                    min={0.0000000001}
                                    max={0.1}
                                    className={`w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl`}
                                    type="number"
                                    step={0.0000000001}
                                    value={selectedProject.simulation ? selectedProject.simulation.solverAlgoParams.convergenceThreshold : convergenceThreshold}
                                    onChange={(event) => {
                                        setConvergenceThreshold(parseFloat(event.target.value))
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/*<button
                    className={`w-full mt-3 button
              ${(meshGenerated !== "Generated") ? 'bg-gray-300 text-gray-600 opacity-70' : 'buttonPrimary'}`}
                    disabled={meshGenerated !== "Generated"}
                    onClick={() => {
                        exportToJsonFileThis(solverInputFrom(selectedProject, solverIterations, convergenceThreshold), selectedProject?.name + "_solverInput.json")
                    }}
                >
                    Export Solver Input
                </button>*/}
                {selectedProject.simulation?.status === "Completed" ? (
                    <button
                        className="button buttonPrimary w-[100%] mt-3"
                        onClick={() => {
                            dispatch(selectMenuItem("Results"));
                        }}
                    >
                        Results
                    </button>
                ) :
                    <>
                        <button
                            className={`w-full mt-3 button
              ${(meshGenerated !== "Generated") ? 'bg-gray-300 text-gray-600 opacity-70' : 'buttonPrimary'}`}
                            disabled={meshGenerated !== "Generated"}
                            onClick={() => {
                                dispatch(setMeshApproved(true));
                            }}
                        >
                            Start Simulation
                        </button>
                    </>
                }
            </div>
        </>
    );
};

export interface Brick {
    x: number,
    y: number,
    z: number
}

function create_Grids_externals(grids: any[]) {
    let OUTPUTgrids: (Brick[])[] = []

    const isOnASurfaceTheBrickInThisPosition = (brickPosition: { x: number, y: number, z: number }, totalMatrix: boolean[][][][]): boolean => {

        const brickTouchesTheMainBoundingBox = (): boolean => {
            let Nx = totalMatrix[0].length
            let Ny = totalMatrix[0][0].length
            let Nz = totalMatrix[0][0][0].length
            if (brickPosition.x === 0 || brickPosition.x === Nx - 1 || brickPosition.y === 0 || brickPosition.y === Ny - 1 || brickPosition.z === 0 || brickPosition.z === Nz - 1) {
                return true
            }
            return false
        }
        const brickHasAdjacentBricksInThisPosition = (position: { x: number, y: number, z: number }): boolean => {
            for (let material = 0; material < totalMatrix.length; material++) {
                if (totalMatrix[material][position.x][position.y][position.z]) { return true }
            }
            return false
        }

        //condizione in cui il brick si trova già su una delle superfici estreme del modello, nel qual caso non servono altri controlli.
        if (brickTouchesTheMainBoundingBox()) return true

        //condizioni che verificano se le singole facce del brick sono libere. Ne basta almeno una libera.
        if (!brickHasAdjacentBricksInThisPosition({ x: brickPosition.x - 1, y: brickPosition.y, z: brickPosition.z })) return true
        if (!brickHasAdjacentBricksInThisPosition({ x: brickPosition.x + 1, y: brickPosition.y, z: brickPosition.z })) return true
        if (!brickHasAdjacentBricksInThisPosition({ x: brickPosition.x, y: brickPosition.y - 1, z: brickPosition.z })) return true
        if (!brickHasAdjacentBricksInThisPosition({ x: brickPosition.x, y: brickPosition.y + 1, z: brickPosition.z })) return true
        if (!brickHasAdjacentBricksInThisPosition({ x: brickPosition.x, y: brickPosition.y, z: brickPosition.z - 1 })) return true
        if (!brickHasAdjacentBricksInThisPosition({ x: brickPosition.x, y: brickPosition.y, z: brickPosition.z + 1 })) return true

        // Se non ci sono facce libere il brick è intermente coperto da altri.
        return false
    }

    for (let material = 0; material < grids.length; material++) {
        OUTPUTgrids.push([])
        for (let cont1 = 0; cont1 < grids[0].length; cont1++) {
            for (let cont2 = 0; cont2 < grids[0][0].length; cont2++) {
                for (let cont3 = 0; cont3 < grids[0][0][0].length; cont3++) {
                    // se il brick esiste e si affaccia su una superficie, lo aggiungiamo alla griglia
                    if (grids[material][cont1][cont2][cont3] && isOnASurfaceTheBrickInThisPosition({ x: cont1, y: cont2, z: cont3 }, grids)) {
                        OUTPUTgrids[material].push({ x: cont1, y: cont2, z: cont3 } as Brick)
                    }
                }
            }
        }
    }

    return OUTPUTgrids;
}
