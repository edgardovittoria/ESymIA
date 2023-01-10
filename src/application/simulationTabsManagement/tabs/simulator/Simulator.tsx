import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectedProjectSelector } from "../../../../store/projectSlice";
import { SimulatorLeftPanelTab } from "./SimulatorLeftPanelTab";
import { GenerateMesh } from "./GenerateMesh";
import { CanvasBaseWithRedux } from "../../sharedElements/CanvasBaseWithRedux";
import { MeshedElement } from "./MeshedElement/MeshedElement";
import { ComponentEntity, Material } from "cad-library";
import { LeftPanel } from "../../sharedElements/LeftPanel";
import { Models } from "../../sharedElements/Models";
import { ModelOutliner } from "../../sharedElements/ModelOutliner";
import { Project } from "../../../../model/Project";
import { MesherOutput } from "../../../../model/MesherInputOutput";
import { s3 } from "../../../../aws/s3Config";

interface SimulatorProps {
  selectedTabLeftPanel: string;
  setSelectedTabLeftPanel: Function;
}

export const Simulator: React.FC<SimulatorProps> = ({
  selectedTabLeftPanel,
  setSelectedTabLeftPanel
}) => {
  const [mesherOutput, setMesherOutput] = useState<MesherOutput | undefined>(
    undefined
  );

  const selectedProject = useSelector(selectedProjectSelector);

  function getMaterialListFrom(components: ComponentEntity[]) {
    let materialList: Material[] = [];
    components?.forEach((c) => {
      if (
        c.material?.name &&
        materialList.filter((m) => m.name === c.material?.name).length === 0
      ) {
        materialList.push(c.material);
      }
    });
    return materialList;
  }

  useEffect(() => {
    if (selectedProject?.meshData.mesh) {
      s3.getObject(
        {
          Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
          Key: selectedProject.meshData.mesh,
        },
        (err, data) => {
          if (err) {
            console.log(err);
          }
          setMesherOutput(
            JSON.parse(data.Body?.toString() as string) as MesherOutput
          );
        }
      );
    }
  }, [selectedProject?.meshData.mesh]);

  let materialsNames: string[] = [];
  let allMaterials: Material[] = [];
  if (selectedProject?.model.components) {
    allMaterials = getMaterialListFrom(
      selectedProject?.model.components as ComponentEntity[]
    );
    materialsNames = [allMaterials[0].name];
    allMaterials.forEach((m) => {
      if (materialsNames.filter((mat) => mat !== m.name).length > 0)
        materialsNames.push(m.name);
    });
  }

  const [selectedMaterials, setSelectedMaterials] =
    useState<string[]>(materialsNames);
  return (
    <>
      <CanvasBaseWithRedux section="Simulator">
        {selectedProject && (
          <MeshedElement
            mesherOutput={mesherOutput}
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
            allMaterials={allMaterials}
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
        selectedProject={selectedProject as Project}
        mesherOutput={mesherOutput}
        allMaterials={allMaterials}
      />
      {/* </RightPanelSimulation> */}
    </>
  );
};
