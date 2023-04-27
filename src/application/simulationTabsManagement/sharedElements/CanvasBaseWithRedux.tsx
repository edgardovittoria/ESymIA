import React, {MutableRefObject, useEffect, useRef, useState} from "react";
import {Canvas} from "@react-three/fiber";
import * as THREE from "three";
import {
    BufferGeometry,
    Color,
    InstancedBufferAttribute,
    InstancedMesh,
    Material,
    Mesh,
    MeshPhongMaterial,
    Object3D,
    Vector3
} from "three";
import {OrbitControls, GizmoHelper, GizmoViewport} from "@react-three/drei";
import {GiCubeforce} from "react-icons/gi";
import {
    CanvasState,
    FactoryShapes,
    ImportActionParamsObject,
    ImportCadProjectButton,
    ImportModelFromDBModal, meshFrom,
    useFaunaQuery,
} from "cad-library";
import {
    findSelectedPort,
    importModel,
    OrbitTarget,
    orbitTargetSelector,
    selectedProjectSelector,
    setModelS3,
    setModelUnit,
    setOrbitTarget, updatePortPosition,
} from "../../../store/projectSlice";
import {updateProjectInFauna} from "../../../faunadb/projectsFolderAPIs";
import {Provider, ReactReduxContext, useDispatch, useSelector} from "react-redux";
import {s3} from "../../../aws/s3Config";
import {Screenshot} from "./Screenshot";
import {convertInFaunaProjectThis} from "../../../faunadb/apiAuxiliaryFunctions";
import {MeshSurfaceSampler} from "three/examples/jsm/math/MeshSurfaceSampler";
import SampledSurface from "./SampledSurface";

interface CanvasBaseWithReduxProps {
    section: string;
    portClickAction?: Function;
    savedPortParameters?: boolean;
    addPort: boolean
}

export const CanvasBaseWithRedux: React.FC<CanvasBaseWithReduxProps> = ({
                                                                            section,
                                                                            savedPortParameters,
                                                                            children,
                                                                            addPort
                                                                        }) => {
    const selectedProject = useSelector(selectedProjectSelector);
    let mesherOutput = selectedProject?.meshData.mesh;
    const [showModalLoadFromDB, setShowModalLoadFromDB] = useState(false);
    const orbitTarget = useSelector(orbitTargetSelector)

    const {execQuery} = useFaunaQuery();
    const mesh = useRef(null);
    const dispatch = useDispatch()
    const instance = useRef<InstancedMesh<BufferGeometry, Material | Material[]>[]>([]);
    const [instanceId, setInstanceId] = useState<number | undefined>(undefined)
    const [color, setColor] = useState<THREE.Color>(new THREE.Color("black"))
    const [inputPortPositioned, setInputPortPositioned] = useState(false);
    let selectedPort = findSelectedPort(selectedProject)


    useEffect(() => {
        if (selectedProject && savedPortParameters === true) {
            execQuery(updateProjectInFauna, convertInFaunaProjectThis(selectedProject));
        }
    }, [
        savedPortParameters,
        selectedProject?.signal,
        selectedProject?.simulation,
        selectedProject?.meshData,
        selectedProject?.modelS3
    ]);

    useEffect(() => {
        if (mesh.current) {
            dispatch(
                setOrbitTarget({
                    position: [
                        (mesh.current as unknown as THREE.Mesh).geometry.boundingSphere?.center.x,
                        (mesh.current as unknown as THREE.Mesh).geometry.boundingSphere?.center.y,
                        (mesh.current as unknown as THREE.Mesh).geometry.boundingSphere?.center.z,
                    ]
                } as OrbitTarget)
            );
        }
    }, [selectedProject, selectedProject?.model, mesh])

    let group = new THREE.Group()
    if(selectedProject && selectedProject.model.components){
        selectedProject.model.components.forEach(c => {
            group.add(meshFrom(c))
        })
    }
    let boundingbox = new THREE.Box3().setFromObject(group)
    let size = boundingbox.getSize(boundingbox.max)

    return (
        <div className="flex justify-center">
            {selectedProject && selectedProject.model?.components ? (
                <ReactReduxContext.Consumer>
                    {({store}) => (
                        <Canvas style={{width: "1920px", height: "828px"}}>
                            <Provider store={store}>
                                <pointLight position={[100, 100, 100]} intensity={0.8}/>
                                <hemisphereLight
                                    color={"#ffffff"}
                                    groundColor={new THREE.Color("#b9b9b9")}
                                    position={[-7, 25, 13]}
                                    intensity={0.85}
                                />
                                {/* paint models */}
                                {(!mesherOutput || section !== "Simulator") && selectedPort && section === "Physics" &&
                                    selectedProject && selectedProject.model.components.map((c, index) => {


                                        return(
                                            <>
                                                <instancedMesh ref={(el) => {
                                                    if (el) {
                                                        instance.current[index] = el
                                                    }
                                                }
                                                } args={[undefined, undefined, 10000]}
                                                               onPointerEnter={(e) => {
                                                                   setInstanceId(e.instanceId)
                                                                   setColor(new THREE.Color("white"))
                                                               }
                                                               }
                                                               onPointerLeave={(e) => {
                                                                   setInstanceId(e.instanceId)
                                                                   setColor(new THREE.Color("black"))
                                                               }
                                                               }
                                                               onClick={(e) => {
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
                                                >
                                                    <boxBufferGeometry args={[size.x/100, size.y/100, size.z/100]}/>
                                                    <meshPhongMaterial attach="material" color={0xffffff}/>
                                                </instancedMesh>
                                                <SampledSurface
                                                    instance={instance.current}
                                                    color={color} id={instanceId}>
                                                    {selectedProject && selectedProject.model.components.map(component => {
                                                        return (

                                                            <mesh
                                                                ref={mesh}
                                                                userData={{
                                                                    keyComponent: component.keyComponent,
                                                                    isSelected: false,
                                                                }}
                                                                key={component.keyComponent}
                                                                position={component.transformationParams.position}
                                                                scale={component.transformationParams.scale}
                                                                rotation={component.transformationParams.rotation}>
                                                                <FactoryShapes entity={component}/>
                                                            </mesh>

                                                        )
                                                    })}
                                                </SampledSurface>

                                            </>
                                        )
                                    })

                                }
                                {(!mesherOutput || section !== "Simulator") && selectedProject && selectedProject.model.components.map(component => {
                                    return (
                                        <mesh
                                            ref={mesh}
                                            userData={{
                                                keyComponent: component.keyComponent,
                                                isSelected: false,
                                            }}
                                            key={component.keyComponent}
                                            position={component.transformationParams.position}
                                            scale={component.transformationParams.scale}
                                            rotation={component.transformationParams.rotation}>
                                            <FactoryShapes entity={component}/>
                                        </mesh>
                                    )
                                })}
                                {children}
                                <OrbitControls makeDefault
                                               target={(orbitTarget) ? new THREE.Vector3(orbitTarget?.position[0], orbitTarget?.position[1], orbitTarget?.position[2]) : new THREE.Vector3(0, 0, 0)}/>
                                <GizmoHelper alignment="bottom-left" margin={[150, 80]}>
                                    <GizmoViewport
                                        axisColors={["red", "#40ff00", "blue"]}
                                        labelColor="white"
                                    />
                                </GizmoHelper>
                                <Screenshot selectedProject={selectedProject}/>
                            </Provider>
                        </Canvas>
                    )}
                </ReactReduxContext.Consumer>
            ) : (
                <div className="absolute top-1/2 w-1/5 flex justify-between">
                    <ImportCadProjectButton
                        className="button buttonPrimary flex items-center"
                        importAction={(importActionParamsObject) => {
                            dispatch(importModel(importActionParamsObject))
                            dispatch(setModelUnit(importActionParamsObject.unit))
                        }}
                        actionParams={
                            {id: selectedProject?.faunaDocumentId, unit: "mm"} as ImportActionParamsObject
                        }>
                        <GiCubeforce
                            style={{width: "25px", height: "25px", marginRight: "5px"}}
                        />{" "}
                        Import From FS
                    </ImportCadProjectButton>
                    <span className="border-start border-dark"/>
                    <button
                        className="button buttonPrimary flex items-center"
                        onClick={() => setShowModalLoadFromDB(true)}>
                        <GiCubeforce
                            style={{width: "25px", height: "25px", marginRight: "5px"}}
                        />{" "}
                        Import From DB
                    </button>
                </div>
            )}
            {showModalLoadFromDB && (
                <ImportModelFromDBModal
                    s3Config={s3}
                    bucket={process.env.REACT_APP_AWS_BUCKET_NAME as string}
                    showModalLoad={setShowModalLoadFromDB}
                    importAction={(importActionParamsObject) => {
                        dispatch(importModel(importActionParamsObject))
                        dispatch(setModelUnit(importActionParamsObject.unit))
                        dispatch(setModelS3(importActionParamsObject.modelS3 as string))
                    }}
                    importActionParams={
                        {
                            canvas: {
                                components: [],
                                lastActionType: "",
                                numberOfGeneratedKey: 0,
                                selectedComponentKey: 0,
                            } as CanvasState,
                            unit: "mm",
                            id: selectedProject?.faunaDocumentId,
                        } as ImportActionParamsObject
                    }
                />
            )}
        </div>
    );
};
