import React, { useEffect, useState } from "react";
import { Material } from "cad-library";
import { MesherOutput } from "../MesherInputOutput";
import { MyInstancedMesh } from "./components/MyInstancedMesh";
import { Project } from "../../../../../model/esymiaModels";

interface PanelContentProps {
	selectedMaterials: string[];
	selectedProject: Project;
	mesherOutput?: MesherOutput;
}

export const MeshedElement: React.FC<PanelContentProps> = ({
	selectedMaterials,
	selectedProject,
	mesherOutput,
}) => {
	let meshGenerated = selectedProject.meshData.meshGenerated;
    let materialsList = selectedProject.model?.components.map(c => c.material as Material) as Material[]

	const [mesherMatrices, setMesherMatrices] = useState<boolean[][][][]>([]);
	const [modelMaterials, setModelMaterials] = useState<Material[]>([]);


	useEffect(() => {
		if(meshGenerated === "Generated"){
			let matrices: boolean[][][][] = []
			let entries = (mesherOutput) && Object.entries(mesherOutput.mesher_matrices)
			let selectedEntries: [string, any][] = []
			let materials: Material[] = []
			let finalMaterialList: Material[] = []
			if (mesherOutput) {

				selectedMaterials.forEach(sm => {
					if (entries) selectedEntries = [...selectedEntries, ...entries.filter(e => e[0] === sm)]
					materials = [...materials, ...materialsList.filter(m => m.name === sm)]
				})


				selectedEntries.forEach(e => matrices.push(e[1]))
				materials.forEach(m => finalMaterialList.push(m))

				setModelMaterials(finalMaterialList)
				setMesherMatrices(matrices)

			}
		}
	}, [mesherOutput, meshGenerated, selectedMaterials]);

	const xPos = (mesherOutput) && (mesherOutput.cell_size.cell_size_x*1000*mesherOutput.n_cells.n_cells_x)/2
	const yPos = (mesherOutput) && (mesherOutput.cell_size.cell_size_y*1000*mesherOutput.n_cells.n_cells_y)/2
	const zPos = (mesherOutput) && (mesherOutput.cell_size.cell_size_z*1000*mesherOutput.n_cells.n_cells_z)/2


	if (meshGenerated === "Generated") {
		return (
				<group position={[-(xPos as number), -(yPos as number), -(zPos as number)]} >
					{mesherOutput &&
						mesherMatrices.map((matrix, index) => {
							return (
								<MyInstancedMesh
									key={index}
									selectedProject={selectedProject}
									mesherMatrices={mesherMatrices}
									index={index}
									materialsList={modelMaterials}
									mesherOutput={mesherOutput}
								/>
							);
						})}
				</group>
		);
	} else {
		return <></>;
	}
};
