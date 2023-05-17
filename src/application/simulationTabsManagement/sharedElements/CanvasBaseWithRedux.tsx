import React, {useEffect, useRef, useState} from "react";
import {Canvas} from "@react-three/fiber";
import * as THREE from "three";
import {Mesh} from "three";
import {OrbitControls, GizmoHelper, GizmoViewport, Edges} from "@react-three/drei";
import {GiCubeforce} from "react-icons/gi";
import {
    CanvasState,
    FactoryShapes,
    ImportActionParamsObject,
    ImportCadProjectButton,
    ImportModelFromDBModal, meshFrom,
    useFaunaQuery,
    usePointerIntersectionOnMeshSurface,
} from "cad-library";
import {
    findSelectedPort,
    importModel,
    OrbitTarget,
    orbitTargetSelector,
    selectedProjectSelector,
    setModelS3,
    setModelUnit,
    setOrbitTarget,
} from "../../../store/projectSlice";
import {updateProjectInFauna} from "../../../faunadb/projectsFolderAPIs";
import {Provider, ReactReduxContext, useDispatch, useSelector} from "react-redux";
import {s3} from "../../../aws/s3Config";
import {Screenshot} from "./Screenshot";
import {convertInFaunaProjectThis} from "../../../faunadb/apiAuxiliaryFunctions";
import EdgesGenerator from "./EdgesGenerator";
import {uploadFileS3} from "../../../aws/mesherAPIs";
import {setModelInfoFromS3} from "../../dashboardTabsManagement/tabs/shared/utilFunctions";

interface CanvasBaseWithReduxProps {
    section: string;
    portClickAction?: Function;
    savedPortParameters?: boolean;
    surfaceAdvices?: boolean,
    setPointerEvent?: Function, 
    setInputPortPositioned?: Function
    inputPortPositioned?: boolean
}

export const CanvasBaseWithRedux: React.FC<CanvasBaseWithReduxProps> = ({
                                                                            section,
                                                                            savedPortParameters,
                                                                            surfaceAdvices,
                                                                            setPointerEvent,
                                                                            setInputPortPositioned,
                                                                            inputPortPositioned,
                                                                            children
                                                                        }) => {
        const selectedProject = useSelector(selectedProjectSelector);
        let mesherOutput = selectedProject?.meshData.mesh;
        const [showModalLoadFromDB, setShowModalLoadFromDB] = useState(false);
        const orbitTarget = useSelector(orbitTargetSelector)

        const {execQuery} = useFaunaQuery();
        const mesh = useRef<Mesh[]>([]);
        const dispatch = useDispatch()
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
            if (mesh.current && mesh.current.length !== 0) {
                let group = new THREE.Group()
                if (selectedProject && selectedProject.model.components) {
                    selectedProject.model.components.forEach(c => {
                        group.add(meshFrom(c))
                    })
                }
                let boundingbox = new THREE.Box3().setFromObject(group)
                dispatch(
                    setOrbitTarget({
                        position: [
                            boundingbox.getCenter(new THREE.Vector3()).x,
                            boundingbox.getCenter(new THREE.Vector3()).y,
                            boundingbox.getCenter(new THREE.Vector3()).z,
                        ]
                    } as OrbitTarget)
                );
            }
        }, [selectedProject, selectedProject?.model, mesh.current])

        useEffect(() => {
            if(!selectedProject?.model.components && selectedProject?.modelS3){
                setModelInfoFromS3(selectedProject, dispatch)
            }
        }, [])

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
                                        <EdgesGenerator section={section} meshRef={mesh} surfaceAdvices={surfaceAdvices as boolean} inputPortPositioned={inputPortPositioned as boolean} setInputPortPositioned={setInputPortPositioned as Function}/>
                                    }
                                    {(!mesherOutput || section !== "Simulator") && selectedProject && selectedProject.model.components.map((component, index) => {
                                        return (
                                                <mesh
                                                    ref={(el) => {
                                                        if (el) {
                                                            mesh.current[index] = el;
                                                        }
                                                    }}
                                                    userData={{
                                                        keyComponent: component.keyComponent,
                                                        isSelected: false,
                                                    }}
                                                    key={component.keyComponent}
                                                    position={component.transformationParams.position}
                                                    scale={component.transformationParams.scale}
                                                    rotation={component.transformationParams.rotation}
                                                    onDoubleClick={(e) => setPointerEvent && setPointerEvent(e)}
                                                    >
                                                    <FactoryShapes entity={component}/>
                                                    <Edges/>
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
                                let model = JSON.stringify({components: importActionParamsObject.canvas.components, unit: importActionParamsObject.unit})
                                let blobFile = new Blob([model])
                                let modelFile = new File([blobFile], `${selectedProject?.faunaDocumentId}.json`, {type: 'application/json'})
                                uploadFileS3(modelFile).then(res => {
                                    if(res){
                                        dispatch(setModelS3(res.key))
                                    }
                                })
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
    }
;
