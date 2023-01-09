import { useState } from "react";
import { useSelector } from "react-redux";
import { MesherOutputSelector } from "../../../../store/mesherSlice";
import {
  selectedProjectSelector,
} from "../../../../store/projectSlice";
import { SimulatorLeftPanelTab } from "./SimulatorLeftPanelTab";
import { GenerateMesh } from "./GenerateMesh";
import { CanvasBaseWithRedux } from "../../sharedElements/CanvasBaseWithRedux";
import { MeshedElement } from "./MeshedElement/MeshedElement";
import { getMaterialListFrom } from "./auxiliaryFunctions/auxiliaryFunctions";
import { ComponentEntity } from "cad-library";
import { LeftPanel } from "../../sharedElements/LeftPanel";
import { Models } from "../../sharedElements/Models";
import { ModelOutliner } from "../../sharedElements/ModelOutliner";

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
  let allMaterials = getMaterialListFrom(selectedProject?.model.components as ComponentEntity[])
  let materialsNames: string[] = [];
  allMaterials.forEach(m => materialsNames.push(m.name))
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
