import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {meshGeneratedSelector, selectedProjectSelector, setMeshGenerated} from "../../../../store/projectSlice";
import {SimulatorLeftPanelTab} from "./SimulatorLeftPanelTab";
import {MeshingSolvingInfo} from "./MeshingSolvingInfo";
import {CanvasBaseWithRedux} from "../../sharedElements/CanvasBaseWithRedux";
import {MeshedElement} from "./MeshedElement/MeshedElement";
import {ComponentEntity, Material} from "cad-library";
import {LeftPanel} from "../../sharedElements/LeftPanel";
import {Models} from "../../sharedElements/Models";
import {ModelOutliner} from "../../sharedElements/ModelOutliner";
import {MesherOutput} from "./MesherInputOutput";
import {s3} from "../../../../aws/s3Config";
import {Project} from "../../../../model/esymiaModels";
import StatusBar from "../../sharedElements/StatusBar";
import {getNumberOfCells} from "./MeshedElement/components/MyInstancedMesh";
import {FocusView} from "../../sharedElements/FocusView";

interface SimulatorProps {
    selectedTabLeftPanel: string;
    setSelectedTabLeftPanel: Function;
}

export const Simulator: React.FC<SimulatorProps> = ({
                                                        selectedTabLeftPanel,
                                                        setSelectedTabLeftPanel,
                                                    }) => {
    const [mesherOutput, setMesherOutput] = useState<MesherOutput | undefined>(
        undefined
    );
    const [voxelsPainted, setVoxelsPainted] = useState(0)
    const [totalVoxels, setTotalVoxels] = useState(0)

    const selectedProject = useSelector(selectedProjectSelector);
    const dispatch = useDispatch()
    const meshGenerated = useSelector(meshGeneratedSelector)

    useEffect(() => {
        if (selectedProject?.meshData.mesh) {
            setMesherOutput(undefined)
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
                    dispatch(setMeshGenerated("Generated"))
                }
            );
        }
    }, [selectedProject?.meshData.mesh]);

    useEffect(() => {
        setVoxelsPainted(0)
        if (mesherOutput) {
            let numberOfCells = Object.values(mesherOutput.externalGrids).reduce((prev, current) => {
                return prev + current.length
            }, 0)
            setVoxelsPainted(numberOfCells)
            setTotalVoxels(mesherOutput.n_cells.n_cells_x * mesherOutput.n_cells.n_cells_y * mesherOutput.n_cells.n_cells_z)
        }
    }, [mesherOutput])

    let materialsNames: string[] = [];
    let allMaterials: Material[] = [];
    if (selectedProject?.model?.components) {
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
            {selectedProject && mesherOutput
                  ? (
                    <CanvasBaseWithRedux section="Simulator">
                        <MeshedElement
                            mesherOutput={mesherOutput}
                            selectedProject={selectedProject}
                            selectedMaterials={selectedMaterials}
                        />
                    </CanvasBaseWithRedux>
                ) : <><CanvasBaseWithRedux section={"Simulator"}/></>
            }

            <StatusBar voxelsPainted={voxelsPainted} totalVoxels={totalVoxels}/>
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
                        <ModelOutliner/>
                    </Models>
                )}
            </LeftPanel>
            {/* <RightPanelSimulation> */}
            <MeshingSolvingInfo
                selectedProject={selectedProject as Project}
                mesherOutput={mesherOutput}
                allMaterials={allMaterials}
            />
            {/* </RightPanelSimulation> */}
        </>
    );
};

export function getMaterialListFrom(components: ComponentEntity[]) {
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