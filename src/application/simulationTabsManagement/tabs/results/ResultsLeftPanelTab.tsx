import React from "react";
import { GiPowerButton } from "react-icons/gi";
import { useSelector } from "react-redux";
import { selectedProjectSelector } from "../../../../store/projectSlice";

interface ResultsLeftPanelTabProps {
  selectedPort: string;
  setSelectedPort: Function;
}

export const ResultsLeftPanelTab: React.FC<ResultsLeftPanelTabProps> = ({
  selectedPort,
  setSelectedPort,
}) => {
  const selectedProject = useSelector(selectedProjectSelector);

  return (
    <>
      {selectedProject && selectedProject.simulation ? (
        <div>
          <>
            <div
              className="flex mb-2 p-[5px] hover:cursor-pointer hover:bg-gray-200 bg-gray-200"
              key={selectedProject.simulation.name}
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
            <>
              {selectedProject.ports.map((port) => {

                return (
                    <>
                      {port.category === "port" &&
                          <div
                              key={port.name}
                              className={
                                selectedPort === port.name
                                    ? "w-[80%] ml-10 hover:cursor-pointer hover:bg-gray-200 bg-gray-200 p-1 rounded"
                                    : "w-[80%] ml-10 hover:cursor-pointer hover:bg-gray-200 p-1 rounded"
                              }
                              onClick={() => setSelectedPort(port.name)}
                          >
                            {port.name}
                          </div>
                      }
                    </>
                );
              })}
            </>
          </>
        </div>
      ) : (
        <div className="text-center">
          <img src="/noResultsIcon.png" className="mx-auto mt-[50px]" alt="No Results"/>
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
