import React, {useEffect, useRef} from 'react';
import {InstancedMesh, Object3D} from "three";
import {MesherOutput} from "../../../../../../../../../model/MesherInputOutput";
import {Material} from "cad-library";
import {useSelector} from "react-redux";
import {MeshGeneratedSelector, NumberOfCellsSelector} from "../../../../../../../../../store/mesherSlice";


interface InstancedMeshProps {
    mesherOutput: MesherOutput,
    mesherMatrices: boolean[][][][],
    index: number,
    materialsList: Material[],
}

export const MyInstancedMesh: React.FC<InstancedMeshProps> = (
    {
        mesherOutput, mesherMatrices, index, materialsList
    }
) => {

    const meshGenerated = useSelector(MeshGeneratedSelector)
    const numberOfCells = useSelector(NumberOfCellsSelector)

    const meshRef = useRef<InstancedMesh[]>([]);
    const tempObject = new Object3D();



    useEffect(() => {
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
    }, [meshGenerated, materialsList]);


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