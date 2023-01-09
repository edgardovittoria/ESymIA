import { useState } from "react";
import { useSelector } from "react-redux";
import { MesherOutputSelector } from "../../../../store/mesherSlice";
import {
  selectedProjectSelector,
} from "../../../../store/projectSlice";
import { ModelOutliner } from "../ModelOutliner";
import { Models } from "../Models";
import { SimulatorLeftPanelTab } from "./SimulatorLeftPanelTab";
import { LeftPanel } from "../LeftPanel";
import { GenerateMesh } from "./GenerateMesh";
import { CanvasBaseWithRedux } from "../CanvasBaseWithRedux";
import { MeshedElement } from "./MeshedElement/MeshedElement";

interface SimulatorProps {
  selectedTabLeftPanel: string;
  setSelectedTabLeftPanel: Function;
  setMenuItem: Function;
  setSelectedSimulation: Function
}

export const Simulator: React.FC<SimulatorProps> = ({
  selectedTabLeftPanel,
  setSelectedTabLeftPanel,
  setMenuItem,
  setSelectedSimulation
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const mesherOutput = useSelector(MesherOutputSelector);
  let materialsNames: string[] = [];
  const [selectedMaterials, setSelectedMaterials] =
    useState<string[]>(materialsNames);
  return (
    <>
      <CanvasBaseWithRedux section="Simulator">
        {mesherOutput && (
          <MeshedElement
            mesherOutput={mesherOutput}
            selectedMaterials={selectedMaterials}
          />
        )}
      </CanvasBaseWithRedux>
      <LeftPanel
        tabs={["Modeler", "Simulator"]}
        selectedTab={selectedTabLeftPanel}
        setSelectedTab={setSelectedTabLeftPanel}
      >
        {selectedTabLeftPanel === "Simulator" ? (
          <SimulatorLeftPanelTab
            selectedMaterials={selectedMaterials}
            setSelectedMaterials={setSelectedMaterials}
          />
        ) : (
          <Models>
            <ModelOutliner />
          </Models>
        )}
      </LeftPanel>
      {/* <RightPanelSimulation> */}
        <GenerateMesh
        setSelectedSimulation={setSelectedSimulation}
          setMenuItem={setMenuItem}
          selectedProject={selectedProject}
        />
      {/* </RightPanelSimulation> */}
    </>
  );
};
