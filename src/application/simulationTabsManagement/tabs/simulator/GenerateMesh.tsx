import { ComponentEntity, exportToSTL, Material } from "cad-library";
import React, {useEffect, useState} from "react";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { useDispatch } from "react-redux";
import {setSolverOutput} from "../../../../store/solverSlice";
import {
  updateSimulation,
  setQuantum,
  setMesh,
  setMeshGenerated,
  setMeshApproved, unsetMesh, deleteSimulation,
} from "../../../../store/projectSlice";
import axios from "axios";
import { MesherOutput } from "./MesherInputOutput";
import {deleteFileS3, uploadFileS3} from "../../../../aws/mesherAPIs";
import { selectMenuItem } from "../../../../store/tabsAndMenuItemsSlice";
import {ImSpinner} from "react-icons/im";
import { Project, Simulation, SolverOutput } from "../../../../model/esymiaModels";
import {getMaterialListFrom} from "./Simulator";


interface GenerateMeshProps {
  selectedProject: Project;
  mesherOutput?: MesherOutput;
  allMaterials?: Material[]
}

export const GenerateMesh: React.FC<GenerateMeshProps> = ({
  selectedProject,
  mesherOutput,
  allMaterials
}) => {

  const dispatch = useDispatch();
  let quantumDimensions = selectedProject.meshData.quantum;
  let meshApproved = selectedProject.meshData.meshApproved;
  let meshGenerated = selectedProject.meshData.meshGenerated;

  const [solverIterations, setSolverIterations] = useState<[number, number]>([100, 1])
  const [convergenceThreshold, setConvergenceThreshold] = useState(0.0001)

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

      let frequencyArray: number[] = [];
      if (selectedProject)
        selectedProject.signal?.signalValues.forEach((sv) =>
          frequencyArray.push(sv.freq)
        );

      let signalsValuesArray: { Re: number; Im: number }[] = [];
      if (selectedProject)
        selectedProject.signal?.signalValues.forEach((sv) =>
          signalsValuesArray.push(sv.signal)
        );

      let dataToSendToSolver = {
        mesherOutput: mesherOutput,
        solverInput: {
          ports: selectedProject.ports.filter(p => p.category === 'port'),
          lumped_elements: selectedProject.ports.filter(p => p.category === 'lumped'),
          materials: getMaterialListFrom(selectedProject?.model.components as ComponentEntity[]),
          frequencies: frequencyArray,
          signals: signalsValuesArray,
          powerPort: (selectedProject) && selectedProject.signal?.powerPort
        },
        solverAlgoParams: {
          innerIteration: solverIterations[0],
          outerIteration: solverIterations[1],
          convergenceThreshold: convergenceThreshold
        }
      }
      // lambdaClient.invoke({
      //   FunctionName: "meshing-solving-dev-solving",
      //   Payload: JSON.stringify(dataToSendToSolver),
      // } as InvocationRequest, (err, data) => {
      //   if(err){
      //     window.alert("Error while solving, please try again")
      //     dispatch(deleteSimulation());
      //     dispatch(setMeshApproved(false));
      //   }else{
      //     if(data.Payload){
      //       dispatch(setSolverOutput(JSON.parse(data.Payload.toString())));
      //       let simulationUpdated: Simulation = {
      //         ...simulation,
      //         results: JSON.parse(data.Payload.toString()),
      //         ended: Date.now().toString(),
      //         status: "Completed",
      //       };
      //       dispatch(updateSimulation(simulationUpdated));
      //     }
      //   }
      // })
      //https://teema-flask-api-4rys7fymga-uc.a.run.app
      axios.post("https://hvsbvljha3bz6bqajqizgax5qe0qjwph.lambda-url.eu-west-2.on.aws/", dataToSendToSolver).then((res) => {
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

  useEffect(() => {
    if (mesherOutput) {
      dispatch(
          setQuantum([
            mesherOutput.cell_size.cell_size_x,
            mesherOutput.cell_size.cell_size_y,
            mesherOutput.cell_size.cell_size_z,
          ])
      );
    }
  }, [mesherOutput])

  useEffect(() => {
    if (meshGenerated === "Generating") {
      let components = selectedProject?.model.components as ComponentEntity[];
      let objToSendToMesher = {
        STLList:
          components && allMaterials &&
          generateSTLListFromComponents(
            allMaterials,
            components
          ),
        quantum: quantumDimensions,
      };
      axios.post('http://ec2-13-40-215-115.eu-west-2.compute.amazonaws.com/meshing', objToSendToMesher).then((res) => {
        saveMeshToS3((res.data)).then(() => {
          dispatch(setMeshGenerated("Generated"))
        });
      }).catch((err) =>{
        if(err){
          window.alert("Error while generating mesh, please try again")
          dispatch(setMeshGenerated("Not Generated"))
          dispatch(unsetMesh())
          console.log(err)
        }
      })
      // lambdaClient.invoke({
      //   FunctionName: "meshing-solving-dev-meshing",
      //   Payload: JSON.stringify(objToSendToMesher),
      // } as InvocationRequest, (err, data) => {
      //   if(err){
      //     window.alert("Error while generating mesh, please try again")
      //     dispatch(setMeshGenerated("Not Generated"))
      //     dispatch(unsetMesh())
      //     console.log(err)
      //   }else{
      //     if(data.Payload){
      //       saveMeshToS3(JSON.parse(data.Payload.toString())).then(() => {
      //         dispatch(setMeshGenerated("Generated"))
      //       });
      //     }
      //   }
      // })
    }
  }, [meshGenerated]);

  return (
    <>
      {(meshGenerated === "Generating" || selectedProject.simulation?.status === "Queued") && (
          <ImSpinner className={`animate-spin w-12 h-12 absolute left-1/2 top-1/2`}/>
      )}
      <div className={`${(meshGenerated === "Generating" || selectedProject.simulation?.status === "Queued") && 'opacity-40'} flex-col absolute right-[2%] top-[160px] w-[22%] rounded-tl rounded-tr bg-white p-[10px] shadow-2xl border-b border-secondaryColor`}>
        <div className="flex">
          <AiOutlineThunderbolt style={{ width: "25px", height: "25px" }} />
          <h5 className="ml-2">Mesh Generation</h5>
        </div>
        <hr className="mt-1" />
        <div
          className={`mt-3 p-[10px] text-left border-[1px] border-secondaryColor rounded bg-[#f6f6f6]`}
        >
          <h6>Set quantum's dimensions</h6>
          <div className="mt-2">
            <span>X,Y,Z</span>
            <div className="flex justify-between mt-2">
              <div className="w-[30%]">
                <input
                  disabled={
                    selectedProject.simulation?.status === "Completed" ||
                    selectedProject.model.components === undefined
                  }
                  min={0}
                  className={`w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl`}
                  type="number"
                  step={0.000001}
                  value={quantumDimensions[0]}
                  onChange={(event) =>
                    dispatch(
                      setQuantum([
                        parseFloat(event.target.value),
                        quantumDimensions[1],
                        quantumDimensions[2],
                      ])
                    )
                  }
                />
              </div>
              <div className="w-[30%]">
                <input
                  disabled={
                    selectedProject.simulation?.status === "Completed" ||
                    selectedProject.model.components === undefined
                  }
                  min={0.0}
                  className={`w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl`}
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
              </div>
              <div className="w-[30%]">
                <input
                  disabled={
                    selectedProject.simulation?.status === "Completed" ||
                    selectedProject.model.components === undefined
                  }
                  min={0}
                  className={`w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl`}
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
              </div>
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
                    onChange={(event) => {setSolverIterations([parseInt(event.target.value), solverIterations[1]])} }
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
                    onChange={(event) =>{setSolverIterations([solverIterations[0], parseInt(event.target.value)])}}
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
                    onChange={(event) => {setConvergenceThreshold(parseFloat(event.target.value))} }
                />
              </div>
            </div>
          </div>
        </div>
        {selectedProject.simulation?.status === "Completed" ? (
            <button
                className="button buttonPrimary w-[100%] mt-3"
                onClick={() => {
                  //dispatch(setSimulationStatus("notStarted"));
                  dispatch(selectMenuItem("Results"));
                }}
            >
              Results
            </button>
        ) :
            <button
                className={`w-full mt-3 button
              ${(meshGenerated !== "Generated") ? 'bg-gray-300 text-gray-600 opacity-70': 'buttonPrimary'}`}
                disabled={meshGenerated !== "Generated"}
                onClick={() => {
                  dispatch(setMeshApproved(true));
                }}
            >
              Start Simulation
            </button>
        }
      </div>
    </>
  );
};
