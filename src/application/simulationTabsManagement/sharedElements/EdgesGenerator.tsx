import React, {useEffect, useRef} from 'react';
import * as THREE from "three";
import {meshFrom} from "cad-library";
import {BufferGeometry, InstancedMesh, Material, Mesh, Object3D} from "three";
import {useDispatch, useSelector} from "react-redux";
import {findSelectedPort, selectedProjectSelector, updatePortPosition} from "../../../store/projectSlice";

export interface EdgesGeneratorProps {
    section: string,
    meshRef: React.MutableRefObject<THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>[]>,
    surfaceAdvices: boolean,
    inputPortPositioned: boolean,
    setInputPortPositioned: Function
}

const EdgesGenerator: React.FC<EdgesGeneratorProps> = ({section, meshRef, surfaceAdvices, inputPortPositioned, setInputPortPositioned}) => {

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
    const instancedMeshRef = useRef<InstancedMesh[]>([]);
    useEffect(() => {
        if (section === "Physics") {
            let tempObject = new Object3D();
            group.children.forEach((c, index) => {
                if (meshRef.current && selectedPort && meshRef.current.length !== 0 && surfaceAdvices) {
                    ((meshRef.current[index] as Mesh).material as Material).opacity = 0.5
                } else if ((meshRef.current && meshRef.current.length !== 0) && (!surfaceAdvices || !selectedPort )) {
                    ((meshRef.current[index] as Mesh).material as Material).opacity = 1
                }
                let j = 0;
                let positionVertices = ((c as Mesh).geometry as BufferGeometry).attributes.position.array

                if (instancedMeshRef.current[index]) {
                    for (let i = 0; i < positionVertices.length; i++) {
                        if (i % 3 === 0) {
                            tempObject.position.set(
                                positionVertices[i],
                                positionVertices[i + 1],
                                positionVertices[i + 2]
                            )
                            j++
                            tempObject.updateMatrix();
                            instancedMeshRef.current[index].setMatrixAt(j, tempObject.matrix);
                        }
                    }

                    instancedMeshRef.current[index].instanceMatrix.needsUpdate = true;
                }
            })
        }
    }, [selectedPort, selectedProject, section, surfaceAdvices])

    return (
        <>
            {
                group.children.map((c, index) => {
                    return (
                        <>
                            {surfaceAdvices &&
                                <instancedMesh
                                    ref={(el) => {
                                        if (el) {
                                            instancedMeshRef.current[index] = el;
                                        }
                                    }}
                                    position={c.position}
                                    key={c.name}
                                    //TODO: sistemare problemi derivanti dai tipi risultanti dalle operazioni binarie
                                    args={[null as any, null as any, ((c as Mesh).geometry as BufferGeometry).attributes.position.array.length / 3]}
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
                                    }}
                                >
                                    <sphereGeometry args={[size.x / 100, 20, 20]}/>
                                    <meshPhongMaterial color={"black"}/>
                                </instancedMesh>
                            }

                        </>
                    )
                })
            }
        </>
    )
}

export default EdgesGenerator