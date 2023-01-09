import { useState } from "react";
import { useSelector } from "react-redux";
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
import { Project } from "../../../../model/Project";

interface SimulatorProps {
  selectedTabLeftPanel: string;
  setSelectedTabLeftPanel: Function;
  setMenuItem: Function;
}

export const Simulator: React.FC<SimulatorProps> = ({
  selectedTabLeftPanel,
  setSelectedTabLeftPanel,
  setMenuItem
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  console.log("render simulator tab")
  let allMaterials = getMaterialListFrom(selectedProject?.model.components as ComponentEntity[])
  let materialsNames: string[] = [allMaterials[0].name];
  allMaterials.forEach(m => {
      if(materialsNames.filter(mat => mat !== m.name).length > 0) materialsNames.push(m.name)
  })
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(materialsNames);
  console.log(materialsNames)
  return (
    <>
      <CanvasBaseWithRedux section="Simulator">
        {selectedProject && (
          <MeshedElement
            selectedProject={selectedProject}
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
          setMenuItem={setMenuItem}
          selectedProject={selectedProject as Project}
        />
      {/* </RightPanelSimulation> */}
    </>
  );
};
