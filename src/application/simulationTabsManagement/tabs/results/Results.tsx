import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  findSelectedPort,
  selectedProjectSelector,
  selectPort,
} from "../../../../store/projectSlice";
import { ChartVisualizationMode } from "./ChartVisualizationMode";
import { ChartsList } from "./ChartsList";
import { ResultsLeftPanelTab } from "./ResultsLeftPanelTab";
import { Models } from "../../sharedElements/Models";
import { ModelOutliner } from "../../sharedElements/ModelOutliner";
import { LeftPanel } from "../../sharedElements/LeftPanel";

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
  const [chartsScaleMode, setChartsScaleMode] = useState<
    "logarithmic" | "linear"
  >("logarithmic");
  const [chartVisualizationMode, setChartVisualizationMode] = useState<
    "grid" | "full"
  >("grid");
  let simulation = selectedProject?.simulation
  return (
    <div className="flex">
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
        </LeftPanel>
      </div>
      <div className="w-[78%] ">
        {selectedProject && simulation ? (
          chartVisualizationMode === "full" ? (
            <>
              {selectedTabLeftPanel === "Results" && (
                <ChartVisualizationMode
                  chartVisualizationMode={chartVisualizationMode}
                  setChartVisualizationMode={setChartVisualizationMode}
                  chartsScaleMode={chartsScaleMode}
                  setChartsScaleMode={setChartsScaleMode}
                />
              )}
              <div className="overflow-scroll grid grid-cols-1 gap-4 max-h-[800px]">
                <ChartsList
                  simulation={simulation}
                  project={selectedProject}
                  scaleMode={chartsScaleMode}
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
                />
              )}
              <div className="grid grid-cols-2 gap-4 overflow-scroll max-h-[800px]">
                <ChartsList
                  simulation={simulation}
                  project={selectedProject}
                  scaleMode={chartsScaleMode}
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
