import React, {useEffect, useState} from "react";
import {Material} from "cad-library";
import {MesherOutput} from "../MesherInputOutput";
import {MyInstancedMesh} from "./components/MyInstancedMesh";
import {ExternalGridsObject, Project} from "../../../../../model/esymiaModels";
import {Bounds, useBounds} from "@react-three/drei";
import {Brick} from "../MeshingSolvingInfo";
import {useSelector} from "react-redux";
import {meshGeneratedSelector} from "../../../../../store/projectSlice";

interface PanelContentProps {
    selectedProject: Project;
    externalGrids?: ExternalGridsObject
    selectedMaterials: string[]
}

export const MeshedElement: React.FC<PanelContentProps> = ({
                                                               selectedProject,
                                                               externalGrids,
                                                               selectedMaterials
                                                           }) => {
    let meshGenerated = useSelector(meshGeneratedSelector)
    let allMaterialsList = selectedProject.model?.components.map(c => c.material as Material) as Material[]
    let materialsList: Material[] = []
    selectedMaterials.forEach(sm => {
        materialsList.push(...allMaterialsList.filter(m => m.name === sm))
    })

    const [mesherMatrices, setMesherMatrices] = useState<(Brick[])[]>([]);
    const [modelMaterials, setModelMaterials] = useState<Material[]>([]);
    const [positions, setPositions] = useState<number[]>([0, 0, 0])

    useEffect(() => {
        if (meshGenerated === "Generated" && externalGrids) {
            let matrices: (Brick[])[] = []
            //let defaultSelectedEntries: [string, any][] = Object.entries(externalGrids.mesher_matrices)
            let selectedEntries: [string, Brick[]][] = Object.entries(externalGrids.externalGrids)
            let finalMaterialList: Material[] = []
            if (externalGrids) {
                console.log(externalGrids)
                /*if(selectedMaterials.length === 0){
                    selectedEntries = []
                }else{
                    selectedMaterials.forEach(sm => {
                        selectedEntries.push(...defaultSelectedEntries.filter(se => se[0] === sm))
                        console.log(selectedEntries)
                    })
                }*/
                selectedEntries.forEach(e => {
                    matrices.push(e[1])
                    finalMaterialList.push(...materialsList.filter(m => m.name === e[0]))
                })

                setModelMaterials(finalMaterialList)
                setMesherMatrices(matrices)
                setPositions([
                    (externalGrids.cell_size.cell_size_x * 1000 * externalGrids.n_cells.n_cells_x) / 2,
                    (externalGrids.cell_size.cell_size_y * 1000 * externalGrids.n_cells.n_cells_y) / 2,
                    (externalGrids.cell_size.cell_size_z * 1000 * externalGrids.n_cells.n_cells_z) / 2
                ])
            }
        }
    }, [externalGrids, meshGenerated]);

    if (meshGenerated === "Generated" && externalGrids) {
        return (
            <Bounds fit margin={externalGrids.cell_size.cell_size_x * 9000}>
                <group position={[-positions[0], -positions[1], -positions[2]]}> */
                    {externalGrids &&
                        mesherMatrices.map((matrix, index) => {
                            return (
                                <MyInstancedMesh
                                    key={index}
                                    index={index}
                                    materialsList={modelMaterials}
                                    externalGrids={externalGrids}
                                />
                            );
                        })}
                </group>
            </Bounds>
        );
    } else {
        return <></>;
    }
};
