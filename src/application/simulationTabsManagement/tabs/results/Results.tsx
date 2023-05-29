import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteSimulation,
  findSelectedPort,
  selectedProjectSelector,
  selectPort, setMeshApproved,
} from "../../../../store/projectSlice";
import { ChartVisualizationMode } from "./ChartVisualizationMode";
import {ChartsList, pairs} from "./ChartsList";
import { ResultsLeftPanelTab } from "./ResultsLeftPanelTab";
import { Models } from "../../sharedElements/Models";
import { ModelOutliner } from "../../sharedElements/ModelOutliner";
import { LeftPanel } from "../../sharedElements/LeftPanel";
import { useFaunaQuery } from "cad-library";
import { updateProjectInFauna } from "../../../../faunadb/projectsFolderAPIs";
import { convertInFaunaProjectThis } from "../../../../faunadb/apiAuxiliaryFunctions";
import {Project} from "../../../../model/esymiaModels";

interface ResultsProps {
  selectedTabLeftPanel: string;
  setSelectedTabLeftPanel: Function;
}

export const Results: React.FC<ResultsProps> = ({
  selectedTabLeftPanel,
  setSelectedTabLeftPanel
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  let selectedPort = findSelectedPort(selectedProject);
  const dispatch = useDispatch();
  const [selectedLabel, setSelectedLabel] = useState<{ label: string, id: number }[]>([{label: "All Ports", id: 0}])
  const [chartsScaleMode, setChartsScaleMode] = useState<
    "logarithmic" | "linear"
  >("logarithmic");
  const [chartVisualizationMode, setChartVisualizationMode] = useState<
    "grid" | "full"
  >("grid");
  const [graphToVisualize, setGraphToVisualize] = useState<"All Graph" | "Z" | "S" | "Y">("All Graph")
  const { execQuery } = useFaunaQuery();

  return (
    <div className="flex h-[100vh]">
      <div className="w-[20%]">
        <LeftPanel
          tabs={["Modeler", "Results"]}
          selectedTab={selectedTabLeftPanel}
          setSelectedTab={setSelectedTabLeftPanel}
        >
          {selectedTabLeftPanel === "Results" ? (
            <ResultsLeftPanelTab
              selectedPort={selectedPort ? selectedPort.name : "undefined"}
              setSelectedPort={(portName: string) =>
                dispatch(selectPort(portName))
              }
            />
          ) : (
            <Models>
              <ModelOutliner />
            </Models>
          )}
          {(selectedProject?.simulation) &&
            <button
              type="button"
              className="button buttonPrimary w-full mt-2 hover:opacity-80 disabled:opacity-60"
              onClick={() => {
                dispatch(deleteSimulation())
                dispatch(setMeshApproved(false));
                execQuery(updateProjectInFauna,
                  convertInFaunaProjectThis(
                    { ...selectedProject, simulation: undefined, meshData: { ...selectedProject?.meshData, meshApproved: false } } as Project
                  )
                )
              }
              }
            >
              REMOVE RESULTS
            </button>}
        </LeftPanel>
      </div>
      <div className="w-[78%]">
        {selectedProject && selectedProject.simulation ? (
          chartVisualizationMode === "full" ? (
            <>
              {selectedTabLeftPanel === "Results" && (
                <ChartVisualizationMode
                  chartVisualizationMode={chartVisualizationMode}
                  setChartVisualizationMode={setChartVisualizationMode}
                  chartsScaleMode={chartsScaleMode}
                  setChartsScaleMode={setChartsScaleMode}
                  setGraphToVisualize={setGraphToVisualize}
                  selectedLabel={selectedLabel}
                  setSelectedLabel={setSelectedLabel}
                />
              )}
              <div className="overflow-scroll grid grid-cols-1 gap-4 max-h-[800px]">
                <ChartsList
                  scaleMode={chartsScaleMode}
                  graphToVisualize={graphToVisualize}
                  selectedLabel={selectedLabel}
                />
              </div>
            </>
          ) : (
            <>
              {selectedTabLeftPanel === "Results" && (
                <ChartVisualizationMode
                  chartVisualizationMode={chartVisualizationMode}
                  setChartVisualizationMode={setChartVisualizationMode}
                  chartsScaleMode={chartsScaleMode}
                  setChartsScaleMode={setChartsScaleMode}
                  setGraphToVisualize={setGraphToVisualize}
                  selectedLabel={selectedLabel}
                  setSelectedLabel={setSelectedLabel}
                />
              )}
              <div className="grid grid-cols-2 gap-4 overflow-scroll max-h-[800px]">
                <ChartsList
                  scaleMode={chartsScaleMode}
                  graphToVisualize={graphToVisualize}
                  selectedLabel={selectedLabel}
                />
              </div>
            </>
          )
        ) : (
          <div className="w-full text-center mt-80">
            Launch a simulation and come back here to visulize the results.
          </div>
        )}
      </div>
    </div>
  );
};
