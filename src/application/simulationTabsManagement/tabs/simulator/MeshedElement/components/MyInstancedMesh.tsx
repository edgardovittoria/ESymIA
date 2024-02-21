import React, {useEffect, useRef} from "react";
import {FrontSide, InstancedMesh, Object3D} from "three";
import {Material} from "cad-library";
import {MesherOutput} from "../../MesherInputOutput";
import {ExternalGridsObject, Project} from "../../../../../../model/esymiaModels";
import {useSelector} from "react-redux";
import {meshGeneratedSelector} from "../../../../../../store/projectSlice";
import {Brick} from "../../MeshingSolvingInfo";


interface InstancedMeshProps {
    index: number;
    materialsList: Material[];
    externalGrids: ExternalGridsObject

}

export const MyInstancedMesh: React.FC<InstancedMeshProps> = ({
                                                                  index,
                                                                  materialsList,
                                                                  externalGrids,
                                                              }) => {
    let meshGenerated = useSelector(meshGeneratedSelector)

    const meshRef = useRef<InstancedMesh[]>([]);
    const edgeRef = useRef<InstancedMesh[]>([])


    useEffect(() => {
        console.log("matrix")
        if (meshGenerated === "Generated") {
            let tempObject = new Object3D();
            Object.values(externalGrids.externalGrids).forEach((matrix:Brick[], index) => {
                if (externalGrids && meshRef.current[index]) {
                    let y = 0;
                    matrix.forEach(m => {
                        const id = y++;
                        tempObject.position.set(
                            m.x !== 0
                                ? ((m.x - 1) * externalGrids.cell_size.cell_size_x +
                                    externalGrids.cell_size.cell_size_x) *
                                1020
                                : externalGrids.origin.origin_x,
                            m.y !== 0
                                ? ((m.y - 1) * externalGrids.cell_size.cell_size_y +
                                    externalGrids.cell_size.cell_size_y) *
                                1020
                                : externalGrids.origin.origin_y,
                            m.z !== 0
                                ? ((m.z - 1) * externalGrids.cell_size.cell_size_z +
                                    externalGrids.cell_size.cell_size_z) *
                                1020
                                : externalGrids.origin.origin_z
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
    }, [meshGenerated, materialsList, externalGrids]);


    return (
        <>
            <instancedMesh
                ref={(el) => {
                    if (el) {
                        meshRef.current[index] = el;
                    }
                }}
                key={index}
                args={[null as any, null as any, Object.values(externalGrids.externalGrids)[index].length]}>
                <boxGeometry
                    args={
                        [

                            (externalGrids?.cell_size.cell_size_x as number) * 1000,
                            (externalGrids?.cell_size.cell_size_y as number) * 1000,
                            (externalGrids?.cell_size.cell_size_z as number) * 1000,

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
                args={[null as any, null as any, Object.values(externalGrids.externalGrids)[index].length]}>
                <boxBufferGeometry
                    args={
                        [

                            (externalGrids?.cell_size.cell_size_x as number) * 1000,
                            (externalGrids?.cell_size.cell_size_y as number) * 1000,
                            (externalGrids?.cell_size.cell_size_z as number) * 1000,

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
