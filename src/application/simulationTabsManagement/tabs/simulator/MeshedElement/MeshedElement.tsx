import React, { useEffect, useState } from "react";
import { Material } from "cad-library";
import { MesherOutput } from "../MesherInputOutput";
import { MyInstancedMesh } from "./components/MyInstancedMesh";
import { Project } from "../../../../../model/esymiaModels";
import {Bounds, useBounds} from "@react-three/drei";
import {Brick} from "../MeshingSolvingInfo";

interface PanelContentProps {
	selectedProject: Project;
	mesherOutput?: MesherOutput;
	selectedMaterials: string[]
}

export const MeshedElement: React.FC<PanelContentProps> = ({
	selectedProject,
	mesherOutput,
	selectedMaterials
}) => {
	let meshGenerated = selectedProject.meshData.meshGenerated;
	let allMaterialsList = selectedProject.model?.components.map(c => c.material as Material) as Material[]
	let materialsList:Material[] = []
	selectedMaterials.forEach(sm => {
		materialsList.push(...allMaterialsList.filter(m => m.name === sm))
	})

	const [mesherMatrices, setMesherMatrices] = useState<(Brick[])[]>([]);
	const [modelMaterials, setModelMaterials] = useState<Material[]>([]);
	const [positions, setPositions] = useState<number[]>([0,0,0])

	useEffect(() => {
		if (meshGenerated === "Generated" && mesherOutput) {
			let matrices: (Brick[])[] = []
			//let defaultSelectedEntries: [string, any][] = Object.entries(mesherOutput.mesher_matrices)
			let selectedEntries: [string, Brick[]][] = Object.entries(mesherOutput.externalGrids)
			let finalMaterialList: Material[] = []
			if (mesherOutput) {
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
					(mesherOutput.cell_size.cell_size_x * 1000 * mesherOutput.n_cells.n_cells_x) / 2,
					(mesherOutput.cell_size.cell_size_y * 1000 * mesherOutput.n_cells.n_cells_y) / 2,
					(mesherOutput.cell_size.cell_size_z * 1000 * mesherOutput.n_cells.n_cells_z) / 2
				])
			}
		}
	}, [mesherOutput, meshGenerated]);

	if (meshGenerated === "Generated" && mesherOutput) {
		return (
			<Bounds fit clip observe margin={mesherOutput.cell_size.cell_size_x*9000}>
				<group position={[-positions[0], -positions[1], -positions[2]]} > */
					{mesherOutput &&
						mesherMatrices.map((matrix, index) => {
							return (
								<MyInstancedMesh
									key={index}
									index={index}
									materialsList={modelMaterials}
									mesherOutput={mesherOutput}
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
