import React, { useEffect, useState } from "react";
import { TransformControls } from "@react-three/drei";
import { Material } from "cad-library";
import { MesherOutput } from "../../../../../model/MesherInputOutput";
import { MyInstancedMesh } from "./components/MyInstancedMesh";
import { Project } from "../../../../../model/Project";

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
    let materialsList = selectedProject.model.components.map(c => c.material as Material)

	const [mesherMatrices, setMesherMatrices] = useState<boolean[][][][]>([]);
	const [modelMaterials, setModelMaterials] = useState<Material[]>([]);


	useEffect(() => {
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
	}, [mesherOutput, meshGenerated, selectedMaterials]);

	if (meshGenerated === "Generated") {
		return (
			<TransformControls>
				<group>
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
			</TransformControls>
		);
	} else {
		return <></>;
	}
};
