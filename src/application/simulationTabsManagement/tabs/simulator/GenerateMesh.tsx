import { ComponentEntity, exportToSTL, Material } from "cad-library";
import React, { useEffect } from "react";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Project } from "../../../../model/Project";
import {
  setSimulationStatus,
  setSolverDownloadPercentage,
  setSolverOutput,
  SimulationStatusSelector,
  SolverDownloadPercentageSelector,
} from "../../../../store/solverSlice";
import {
  updateSimulation,
  setQuantum,
  setMesh,
  setDownloadPercentage,
  setMeshGenerated,
  setMeshApproved,
} from "../../../../store/projectSlice";
import { Simulation } from "../../../../model/Simulation";
import { SolverOutput } from "../../../../model/SolverInputOutput";
import { Port, TempLumped } from "../../../../model/Port";
import axios from "axios";
import { MesherOutput } from "../../../../model/MesherInputOutput";
import { uploadFileS3 } from "../../../../aws/mesherAPIs";
import { useMenuItems } from "../../../../contexts/tabsAndMenuitemsHooks";

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
  const solverDownloadPercentage = useSelector(
    SolverDownloadPercentageSelector
  );
  const simulationStatus = useSelector(SimulationStatusSelector);
  const {selectMenuItem} = useMenuItems()

  const dispatch = useDispatch();
  let quantumDimensions = selectedProject.meshData.quantum;
  let meshApproved = selectedProject.meshData.meshApproved;
  let meshGenerated = selectedProject.meshData.meshGenerated;
  let mesherDownloadPercentage = selectedProject.meshData.downloadPercentage;

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
      // TODO: setSimulationStatus may be removed.
      dispatch(setSimulationStatus("started"));
      let simulation: Simulation = {
        name: selectedProject?.name + " - sim",
        started: Date.now().toString(),
        ended: "",
        results: {} as SolverOutput,
        status: "Queued",
        associatedProject: selectedProject?.faunaDocumentId as string,
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

      let lumped_elements =
        selectedProject &&
        selectedProject.ports.filter((port) => port.category === "lumped");

      let lumped_array: { type: number; value: number }[] = [];
      lumped_elements?.forEach((le) => {
        let lumped: TempLumped = {
          ...(le as Port),
          value: (le as Port).rlcParams.resistance as number,
        };
        lumped_array.push(lumped);
      });

      //TODO: add http request to execute the simulation
      /*
       * axios.post("url", dataToSendToSolver).then((res) => {
       *   save results on the store to visualize relative charts
       * })
       * */
      axios.get("http://localhost:3001/solverOutput").then((res) => {
        dispatch(setSolverOutput(res.data));
        let simulationUpdated: Simulation = {
          ...simulation,
          results: res.data,
          ended: Date.now().toString(),
          status: "Completed",
        };
        dispatch(updateSimulation(simulationUpdated));
      });
      setTimeout(() => {
        dispatch(setSimulationStatus("completed"));
      }, 5000);
    }
  }, [meshApproved]);

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
    if (mesherDownloadPercentage < 10 && meshGenerated !== "Not Generated") {
      setTimeout(() => {
        dispatch(setDownloadPercentage(mesherDownloadPercentage + 1));
      }, 500);
    }
    if (mesherDownloadPercentage === 10)
      dispatch(setMeshGenerated("Generated"));
    if (solverDownloadPercentage < 10 && simulationStatus === "started") {
      setTimeout(() => {
        dispatch(setSolverDownloadPercentage(solverDownloadPercentage + 1));
      }, 500);
    }
  }, [
    meshGenerated,
    mesherDownloadPercentage,
    solverDownloadPercentage,
    simulationStatus,
  ]);

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
      axios
        .post(
          "https://64wwc8684a.execute-api.us-east-1.amazonaws.com/meshing",
          objToSendToMesher,
          {
            /*onDownloadProgress: progressEvent => {
              console.log(progressEvent)
              dispatch(setDownloadPercentage(Math.round((progressEvent.loaded * 100) / progressEvent.total)))
          }*/
          }
        )
        .then((res) => {
          saveMeshToS3(res.data).then(() => {});
        })
        .catch((err) => console.log(err));
    }
  }, [meshGenerated]);

  return (
    <>
      <div className="flex-col absolute right-[2%] top-[160px] w-[22%] rounded-tl rounded-tr bg-white p-[10px] shadow-2xl border-b border-secondaryColor">
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
            {simulationStatus === "started" && (
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-secondaryColor">
                      Task in progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-primaryColor">
                      {solverDownloadPercentage * 10}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${solverDownloadPercentage * 10}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-secondaryColor"
                  ></div>
                </div>
              </div>
            )}
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
            {meshGenerated === "Generating" && (
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-secondaryColor">
                      Task in progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-primaryColor">
                      {mesherDownloadPercentage * 10}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${mesherDownloadPercentage * 10}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-secondaryColor"
                  ></div>
                </div>
              </div>
            )}
            {meshGenerated === "Generated" && !meshApproved && (
              <div className="flex justify-between">
                <button
                  className="button buttonPrimary w-[48%]"
                  disabled={!checkQuantumDimensionsValidity()}
                  onClick={() => {
                    dispatch(setMeshGenerated("Generating"));
                    dispatch(setDownloadPercentage(0));
                  }}
                >
                  Regenerate
                </button>
                <button
                  className="button buttonPrimary w-[48%]"
                  onClick={() => {
                    dispatch(setMeshApproved(true));
                    dispatch(setDownloadPercentage(0));
                  }}
                >
                  Start Simulation
                </button>
              </div>
            )}
            {selectedProject.simulation?.status === "Completed" && (
              <button
                className="button buttonPrimary w-[100%]"
                onClick={() => {
                  dispatch(setSimulationStatus("notStarted"));
                  dispatch(setSolverDownloadPercentage(0));
                  selectMenuItem("Results");
                }}
              >
                Results
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
