import React, { useEffect } from "react";
import { GiPowerButton } from "react-icons/gi";
import { useSelector } from "react-redux";
import { Simulation } from "../../../../model/Simulation";
import { selectedProjectSelector } from "../../../../store/projectSlice";

interface ResultsLeftPanelTabProps {
  setSelectedSimulation: Function;
  selectedSimulation: Simulation | undefined;
  selectedPort: string;
  setSelectedPort: Function;
}

export const ResultsLeftPanelTab: React.FC<ResultsLeftPanelTabProps> = ({
  setSelectedSimulation,
  selectedSimulation,
  selectedPort,
  setSelectedPort,
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  useEffect(() => {
    selectedProject &&
      !selectedSimulation &&
      setSelectedSimulation(selectedProject.simulation);
  }, []);

  return (
    <>
      {selectedProject && selectedProject.simulation ? (
        <div>
          <>
            <div
              className={
                selectedSimulation &&
                selectedProject.simulation.name === selectedSimulation.name
                  ? `flex mb-2 p-[5px] hover:cursor-pointer hover:bg-gray-200 bg-gray-200`
                  : `flex mb-2 p-[5px]  hover:cursor-pointer hover:bg-gray-200`
              }
              key={selectedProject.simulation.name}
              onClick={() => {
                setSelectedSimulation(selectedProject.simulation);
              }}
            >
              <div className="w-[12%] flex items-center">
                <GiPowerButton
                  color={"#00ae52"}
                  style={{ width: "20px", height: "20px" }}
                />
              </div>
              <div className="w-[90%] text-left">
                {selectedProject.simulation.name}
              </div>
            </div>
            {selectedSimulation &&
              selectedSimulation.name === selectedProject.simulation.name && (
                <>
                  {selectedProject.ports.map((port) => {
                    return (
                      <div
                        className={
                          selectedPort === port.name
                            ? "w-[80%] ml-10 hover:cursor-pointer hover:bg-gray-200 bg-gray-200 p-1 rounded"
                            : "w-[80%] ml-10 hover:cursor-pointer hover:bg-gray-200 p-1 rounded"
                        }
                        onClick={() => setSelectedPort(port.name)}
                      >
                        {port.name}
                      </div>
                    );
                  })}
                </>
              )}
          </>
        </div>
      ) : (
        <div className="text-center">
          <img src="/noResultsIcon.png" className="mx-auto mt-[50px]" />
          <h5>No results to view</h5>
          <p className="mt-[50px]">
            Complete a study setup with CAD, materials, and physics, then
            Estimate and Run to generate results.
          </p>
        </div>
      )}
    </>
  );
};
