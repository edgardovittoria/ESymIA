import React, {useEffect, useState} from 'react';
import {Canvas} from "@react-three/fiber";
import * as THREE from 'three';
import {Color, Mesh, MeshPhongMaterial} from 'three';
import {OrbitControls, GizmoHelper, GizmoViewport, Line, TransformControls} from '@react-three/drei'
import {GiCubeforce} from "react-icons/gi";
import {Project} from '../../../../../../model/Project'
import {Probe} from "../../../../../../model/Port";
import {
    FactoryShapes,
    ImportActionParamsObject,
    ImportCadProjectButton,
    useFaunaQuery
} from 'cad-library'
import {findSelectedPort} from '../../../../../../store/projectSlice';
import {Screenshot} from "./components/Screenshot";
import {PortControls} from "./components/PortControls";
import {ProbeControls} from "./components/ProbeControls";
import {updateProjectInFauna} from '../../../../../../faunadb/api/projectsFolderAPIs';
import {Provider, ReactReduxContext, useSelector} from "react-redux";
import {MesherOutputSelector} from "../../../../../../store/mesherSlice";
import {MyInstancedMesh} from "./components/MeshedElement/components/MyInstancedMesh";
import {MeshedElement} from "./components/MeshedElement/MeshedElement";

interface ModelerProps {
    selectedProject: Project | undefined,
    importModel: (params: ImportActionParamsObject) => any,
    section: string,
    selectPort: Function,
    updatePortPosition: Function,
    setScreenshot: Function,
    setShowLoadFromDBModal: Function
    selectedMaterials: string[]
}

export const Modeler: React.FC<ModelerProps> = (
    {
        selectedProject, importModel, section, selectPort, updatePortPosition,
        setScreenshot, setShowLoadFromDBModal, selectedMaterials
    }
) => {

    const mesherOutput = useSelector(MesherOutputSelector)

    const {execQuery} = useFaunaQuery()
    const [previousColor, setPreviousColor] = useState<Color>({} as Color);
    let selectedPort = findSelectedPort(selectedProject)

    useEffect(() => {
        if(selectedProject){
            execQuery(updateProjectInFauna, selectedProject)
        }
    }, [selectedProject?.model, selectedProject?.ports, selectedProject?.signal, selectedProject?.simulations])


    return (
        <div className="flex justify-center">
            {(selectedProject && selectedProject.model.components) ?
                <ReactReduxContext.Consumer>
                    {({store}) => (
                        <Canvas style={{width: "1920px", height: "700px"}}>
                            <Provider store={store}>
                                <pointLight position={[100, 100, 100]} intensity={0.8}/>
                                <hemisphereLight color={'#ffffff'} groundColor={new THREE.Color('#b9b9b9')}
                                                 position={[-7, 25, 13]}
                                                 intensity={0.85}/>
                                {(!mesherOutput || section !== 'Simulator') && selectedProject.model.components.map(component => {
                                    return (
                                        <mesh
                                            userData={{keyComponent: component.keyComponent, isSelected: false}}
                                            key={component.keyComponent}
                                            onPointerEnter={(event) => {
                                                setPreviousColor(((event.object as Mesh).material as MeshPhongMaterial).color);
                                                (event.object as Mesh).material = new THREE.MeshPhongMaterial({
                                                    color: '#0423fa',
                                                    wireframe: true
                                                })
                                            }}
                                            onPointerLeave={(event) => {
                                                (event.object as Mesh).material = new THREE.MeshPhongMaterial({
                                                    color: previousColor,
                                                    wireframe: false
                                                })
                                            }}
                                            position={component.transformationParams.position}
                                            scale={component.transformationParams.scale}
                                            rotation={component.transformationParams.rotation}
                                        >
                                            <FactoryShapes entity={component}/>
                                        </mesh>
                                    )
                                })}
                                {(!mesherOutput || section !== 'Simulator') && selectedProject.ports.map((port, index) => {
                                    if(port.category === 'port' || port.category === 'lumped'){
                                        return(
                                            <group key={index}>
                                                <mesh
                                                    name={port.inputElement.name}
                                                    position={port.inputElement.transformationParams.position}
                                                    scale={port.inputElement.transformationParams.scale}
                                                    rotation={port.inputElement.transformationParams.rotation}
                                                    onClick={() => selectPort(port.name)}
                                                >
                                                    <FactoryShapes entity={port.inputElement} color="#00ff00"/>
                                                </mesh>

                                                <mesh
                                                    name={port.outputElement.name}
                                                    position={port.outputElement.transformationParams.position}
                                                    scale={port.outputElement.transformationParams.scale}
                                                    rotation={port.outputElement.transformationParams.rotation}
                                                    onClick={() => selectPort(port.name)}
                                                >
                                                    <FactoryShapes entity={port.outputElement}/>
                                                </mesh>
                                                <Line
                                                    points={[port.inputElement.transformationParams.position, port.outputElement.transformationParams.position]}
                                                    color={(port.category === 'port') ? 'red' : 'violet'}
                                                    lineWidth={1} alphaWrite={undefined}/>
                                            </group>
                                        )
                                    }else{
                                        return (
                                            <group
                                                key={port.name}
                                                name={port.name}
                                                onClick={() => selectPort(port.name)}
                                                position={(port as Probe).groupPosition}
                                            >
                                                {(port as Probe).elements.map((element, index) => {
                                                    return (
                                                        <mesh
                                                            key={index}
                                                            position={element.transformationParams.position}
                                                            scale={element.transformationParams.scale}
                                                            rotation={element.transformationParams.rotation}
                                                        >
                                                            <FactoryShapes entity={element} color="orange"/>
                                                        </mesh>
                                                    )
                                                })}
                                            </group>
                                        )
                                    }
                                })}
                                {(section === 'Physics' && selectedPort && (selectedPort.category === 'port' || selectedPort.category === 'lumped')) &&
                                    <PortControls selectedPort={selectedPort} updatePortPosition={updatePortPosition}/>
                                }
                                {section === 'Physics' && selectedPort && selectedPort.category === 'probe' &&
                                    <ProbeControls selectedProbe={selectedPort as Probe}
                                                   updateProbePosition={updatePortPosition}/>
                                }
                                {(section === 'Simulator' && mesherOutput) &&
                                    <MeshedElement mesherOutput={mesherOutput} selectedMaterials={selectedMaterials}/>
                                }
                                <OrbitControls makeDefault/>
                                <GizmoHelper alignment="bottom-left" margin={[150, 80]}>
                                    <GizmoViewport axisColors={['red', '#40ff00', 'blue']} labelColor="white"/>
                                </GizmoHelper>
                                <Screenshot selectedProject={selectedProject} setScreenshot={setScreenshot}/>
                            </Provider>
                        </Canvas>
                    )}
                </ReactReduxContext.Consumer>

                :
                <div className="absolute top-1/2 w-1/5 flex justify-between">
                    <ImportCadProjectButton className='button buttonPrimary flex items-center'
                                            importAction={importModel}
                                            actionParams={{id: selectedProject?.name} as ImportActionParamsObject}>
                        <GiCubeforce style={{width: "25px", height: "25px", marginRight: "5px"}}/> Import From FS
                    </ImportCadProjectButton>
                    <span className="border-start border-dark"/>
                    <button className='button buttonPrimary flex items-center'
                            onClick={() => setShowLoadFromDBModal(true)}>
                        <GiCubeforce style={{width: "25px", height: "25px", marginRight: "5px"}}/> Import From DB
                    </button>
                </div>
            }
        </div>
    )

}
