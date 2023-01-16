import React, {useEffect, useRef} from 'react';
import {InstancedMesh, Object3D} from "three";
import {Material} from "cad-library";
import { MesherOutput } from '../../MesherInputOutput';
import { Project } from '../../../../../../model/esymiaModels';


interface InstancedMeshProps {
    selectedProject: Project
    mesherMatrices: boolean[][][][],
    index: number,
    materialsList: Material[],
    mesherOutput?: MesherOutput
}

export const MyInstancedMesh: React.FC<InstancedMeshProps> = (
    {
        selectedProject, mesherMatrices, index, materialsList, mesherOutput
    }
) => {

    let meshGenerated = selectedProject.meshData.meshGenerated

    const meshRef = useRef<InstancedMesh[]>([]);

    function getNumberOfCells(output: MesherOutput|undefined){
        let numberOfCells: number[] = []
        let matrices: boolean[][][][] = []
        if(output){
            Object.values(output.mesher_matrices).forEach(matrix => {
                matrices.push(matrix)
            })
            matrices.forEach(matrix => {
                let cells = 0
                matrix.forEach(m => {
                    m.forEach(m => {
                        m.forEach(m => {
                            if (m) {
                                cells += 1
                            }
                        })
                    })
                })
                numberOfCells.push(cells)
            })
        }
        return numberOfCells
    }

    let numberOfCells = getNumberOfCells(mesherOutput)



    useEffect(() => {
        let tempObject = new Object3D();
        mesherMatrices.forEach((matrix, index) => {
            if (mesherOutput && meshRef.current[index]) {
                let y = 0
                for (let i = 0; i < mesherOutput.n_cells.n_cells_x; i++) {
                    for (let j = 0; j < mesherOutput.n_cells.n_cells_y; j++) {
                        for (let k = 0; k < mesherOutput.n_cells.n_cells_z; k++) {
                            if (matrix[i][j][k]) {
                                const id = y++
                                tempObject.position.set(
                                    (i!==0) ? ((i-1) * mesherOutput.cell_size.cell_size_x + mesherOutput.cell_size.cell_size_x)*1000 : mesherOutput.origin.origin_x,
                                    (j!==0) ? ((j-1) * mesherOutput.cell_size.cell_size_y + mesherOutput.cell_size.cell_size_y)*1000: mesherOutput.origin.origin_y,
                                    (k!==0) ? ((k-1) * mesherOutput.cell_size.cell_size_z + mesherOutput.cell_size.cell_size_z)*1000: mesherOutput.origin.origin_z
                                )
                                tempObject.updateMatrix();
                                meshRef.current[index].setMatrixAt(id, tempObject.matrix)
                            }
                        }
                    }
                }
                meshRef.current[index].instanceMatrix.needsUpdate = true;
            }

        })
    }, [meshGenerated, materialsList, mesherMatrices, mesherOutput]);


    return(
        <instancedMesh
            ref={el => {
                if (el) {
                    meshRef.current[index] = el
                }
            }}
            key={index}
            args={[null as any, null as any, numberOfCells[index]]}>
            <boxGeometry args={[.08,.08,.08]}/>
            <meshPhongMaterial color={(materialsList[index]) && materialsList[index].color}/>
        </instancedMesh>
    )

}