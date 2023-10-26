import React, {useEffect, useRef} from "react";
import {FrontSide, InstancedMesh, Object3D} from "three";
import {Material} from "cad-library";
import {MesherOutput} from "../../MesherInputOutput";
import {Project} from "../../../../../../model/esymiaModels";
import {useSelector} from "react-redux";
import {meshGeneratedSelector} from "../../../../../../store/projectSlice";
import {Brick} from "../../MeshingSolvingInfo";


interface InstancedMeshProps {
    index: number;
    materialsList: Material[];
    mesherOutput: MesherOutput;
}

export const MyInstancedMesh: React.FC<InstancedMeshProps> = ({
                                                                  index,
                                                                  materialsList,
                                                                  mesherOutput,
                                                              }) => {
    let meshGenerated = useSelector(meshGeneratedSelector)

    const meshRef = useRef<InstancedMesh[]>([]);
    const edgeRef = useRef<InstancedMesh[]>([])


    let numberOfCells = getNumberOfCells(mesherOutput);

    useEffect(() => {
        if (meshGenerated === "Generated") {
            let tempObject = new Object3D();
            Object.values(mesherOutput?.externalGrids).forEach((matrix:Brick[], index) => {
                if (mesherOutput && meshRef.current[index]) {
                    let y = 0;
                    matrix.forEach(m => {

                        const id = y++;
                        tempObject.position.set(
                            m.x !== 0
                                ? ((m.x - 1) * mesherOutput.cell_size.cell_size_x +
                                    mesherOutput.cell_size.cell_size_x) *
                                1020
                                : mesherOutput.origin.origin_x,
                            m.y !== 0
                                ? ((m.y - 1) * mesherOutput.cell_size.cell_size_y +
                                    mesherOutput.cell_size.cell_size_y) *
                                1020
                                : mesherOutput.origin.origin_y,
                            m.z !== 0
                                ? ((m.z - 1) * mesherOutput.cell_size.cell_size_z +
                                    mesherOutput.cell_size.cell_size_z) *
                                1020
                                : mesherOutput.origin.origin_z
                        );
                        tempObject.updateMatrix();
                        meshRef.current[index].setMatrixAt(id, tempObject.matrix);
                        edgeRef.current[index].setMatrixAt(id, tempObject.matrix);


                    })

                    meshRef.current[index].instanceMatrix.needsUpdate = true;
                    edgeRef.current[index].instanceMatrix.needsUpdate = true;
                }
            });
        }
    }, [meshGenerated, materialsList, mesherOutput]);


    return (
        <>
            <instancedMesh
                ref={(el) => {
                    if (el) {
                        meshRef.current[index] = el;
                    }
                }}
                key={index}
                args={[null as any, null as any, Object.values(mesherOutput.externalGrids)[index].length]}>
                <boxGeometry
                    args={
                        [

                            (mesherOutput?.cell_size.cell_size_x as number) * 1000,
                            (mesherOutput?.cell_size.cell_size_y as number) * 1000,
                            (mesherOutput?.cell_size.cell_size_z as number) * 1000,

                        ]
                    }
                />
                <meshPhongMaterial
                    color={materialsList[index] && materialsList[index].color}
                    side={FrontSide}
                />
            </instancedMesh>
            <instancedMesh
                ref={(el) => {
                    if (el) {
                        edgeRef.current[index] = el;
                    }
                }}
                key={index + 1}
                args={[null as any, null as any, Object.values(mesherOutput.externalGrids)[index].length]}>
                <boxBufferGeometry
                    args={
                        [

                            (mesherOutput?.cell_size.cell_size_x as number) * 1000,
                            (mesherOutput?.cell_size.cell_size_y as number) * 1000,
                            (mesherOutput?.cell_size.cell_size_z as number) * 1000,

                        ]
                    }
                ></boxBufferGeometry>
                <meshPhongMaterial
                    color={"black"} wireframe={true}
                />
            </instancedMesh>
        </>
    );
};

export function getNumberOfCells(output: MesherOutput | undefined) {
    let numberOfCells
    /*let matrices: (Brick[])[] = [];
    if (output) {
        Object.values(output.mesher_matrices).forEach((matrix) => {
            matrices.push(matrix);
        });
        matrices.forEach((matrix) => {
            let cells = 0;
            matrix.forEach((m) => {
                m.forEach((m) => {
                    m.forEach((m) => {
                        if (m) {
                            cells += 1;
                        }
                    });
                });
            });
            numberOfCells.push(cells);
        });
    }*/
    //return numberOfCells;
}
