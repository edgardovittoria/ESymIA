import React, {useEffect, useRef, useState} from 'react';
import * as THREE from "three";
import {BufferGeometryAttributes, meshFrom} from "cad-library";
import {InstancedMesh, Material, Mesh, Object3D} from "three";
import {useDispatch, useSelector} from "react-redux";
import {findSelectedPort, selectedProjectSelector, updatePortPosition} from "../../../store/projectSlice";

export interface EdgesGeneratorProps{
    section: string,
    mesh:  React.MutableRefObject<THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>[]>
}

const EdgesGenerator: React.FC<EdgesGeneratorProps> = ({section, mesh}) => {

    const selectedProject = useSelector(selectedProjectSelector);
    const dispatch = useDispatch()
    let selectedPort = findSelectedPort(selectedProject)

    let group = new THREE.Group()
    if (selectedProject && selectedProject.model.components) {
        selectedProject.model.components.forEach(c => {
            group.add(meshFrom(c))
        })
    }
    let boundingbox = new THREE.Box3().setFromObject(group)
    let size = boundingbox.getSize(boundingbox.max)
    const [inputPortPositioned, setInputPortPositioned] = useState(false);
    const [instanceId, setInstanceId] = useState<number | undefined>(undefined)
    const meshRef = useRef<InstancedMesh[]>([]);
    useEffect(() => {
        if (selectedProject && selectedProject.model.components && section === "Physics") {
            let tempObject = new Object3D();
            selectedProject.model.components.forEach((c, index) => {
                if (mesh.current && selectedPort && mesh.current.length !== 0) {
                    ((mesh.current[index] as Mesh).material as Material).opacity = 0.5
                } else if (mesh.current && !selectedPort && mesh.current.length !== 0) {
                    ((mesh.current[index] as Mesh).material as Material).opacity = 1
                }
                let j = 0;
                let positionVertices = Object.values((c.geometryAttributes as BufferGeometryAttributes).positionVertices)

                if (meshRef.current[index]) {
                    for (let i = 0; i < positionVertices.length; i++) {
                        if (i % 3 === 0) {
                            tempObject.position.set(
                                positionVertices[i],
                                positionVertices[i + 1],
                                positionVertices[i + 2]
                            )
                            j++
                            tempObject.updateMatrix();
                            meshRef.current[index].setMatrixAt(j, tempObject.matrix);
                        }
                    }

                    meshRef.current[index].instanceMatrix.needsUpdate = true;
                }
            })
        }
    }, [selectedPort, selectedProject, section, instanceId])

    return(
        <>
            {
                selectedProject && selectedProject.model.components.map((c, index) => {
                    return (
                        <>

                            <instancedMesh
                                ref={(el) => {
                                    if (el) {
                                        meshRef.current[index] = el;
                                    }
                                }}
                                key={index}
                                args={[null as any, null as any, (Object.values((c.geometryAttributes as BufferGeometryAttributes).positionVertices).length / 3)]}
                                onDoubleClick={(e) => {
                                    e.stopPropagation()
                                    if (!inputPortPositioned) {
                                        dispatch(
                                            updatePortPosition({
                                                type: "first",
                                                position: [e.point.x, e.point.y, e.point.z],
                                            })
                                        );
                                        setInputPortPositioned(true)
                                    } else {
                                        dispatch(
                                            updatePortPosition({
                                                type: "last",
                                                position: [e.point.x, e.point.y, e.point.z],
                                            })
                                        );
                                        setInputPortPositioned(false)
                                    }
                                }
                                }
                                onPointerEnter={(e) => {
                                    //e.stopPropagation();
                                    setInstanceId(e.instanceId)
                                    //((e.eventObject as Mesh).material as MeshPhongMaterial).color.set(new THREE.Color("white"))
                                }}
                                onPointerLeave={(e) => {
                                    e.stopPropagation();
                                    //((e.eventObject as Mesh).material as MeshPhongMaterial).color.set(new THREE.Color("black"))
                                }}
                            >
                                <sphereGeometry args={[size.x / 100, 20, 20]}/>
                                <meshPhongMaterial color={"black"}/>
                            </instancedMesh>

                        </>
                    )
                })
            }
        </>
    )
}

export default EdgesGenerator