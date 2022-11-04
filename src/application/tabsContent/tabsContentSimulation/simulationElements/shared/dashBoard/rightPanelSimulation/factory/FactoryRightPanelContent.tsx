import React, {useState} from 'react';
import {ComponentEntity} from "cad-library";
import {Probe} from "../../../../../../../../model/Port";
import {PortManagement} from "./components/portManagement/PortManagement";
import {PortType} from "./components/portManagement/components/PortType";
import {PortPosition} from "./components/portManagement/components/PortPosition";
import {RLCParamsComponent} from "./components/portManagement/components/RLCParamsComponent";
import {InputSignal} from "./components/inputSignalManagement/components/inputSignal/InputSignal";
import {ModalSelectPortType} from "./components/modals/ModalSelectPortType";
import {ModalSignals} from "./components/modals/ModalSignals";
import {useSelector} from "react-redux";
import {selectedProjectSelector} from "../../../../../../../../store/projectSlice";
import {Project} from "../../../../../../../../model/Project";
import {InputSignalManagement} from "./components/inputSignalManagement/InputSignalManagement";
import {GenerateMesh} from "./components/generateMesh/GenerateMesh";

interface FactoryRightPanelContentProps {
    section: string,
    components?: ComponentEntity[],
    setMenuItem: Function,
    quantumDimensions: [number, number, number],
    setQuantumDimensions: Function,
}

export const FactoryRightPanelContent: React.FC<FactoryRightPanelContentProps> = (
    {
        section, components, setMenuItem, quantumDimensions,
        setQuantumDimensions
    }
) => {

    const selectedProject = useSelector(selectedProjectSelector)
    let selectedPort = selectedProject?.ports.filter(port => port.isSelected)[0];
    const [showModalSelectPortType, setShowModalSelectPortType] = useState(false);
    const [showModalSignal, setShowModalSignal] = useState(false);

    switch (section) {
        case 'Modeler':
            return <></>

        case 'Physics':
            return (
                <>
                    {(selectedPort && (selectedPort?.category === 'port' || selectedPort?.category === 'lumped')) ?
                        <>
                            <PortManagement selectedPort={selectedPort}>
                                <PortType setShow={setShowModalSelectPortType} selectedPort={selectedPort}/>
                                <PortPosition selectedPort={selectedPort}/>
                                <RLCParamsComponent selectedPort={selectedPort}/>
                                <ModalSelectPortType show={showModalSelectPortType} setShow={setShowModalSelectPortType}
                                                     selectedPort={selectedPort}/>
                            </PortManagement>
                            <InputSignalManagement>
                                <InputSignal setShowModalSignal={setShowModalSignal} selectedProject={selectedProject as Project}/>
                                <ModalSignals showModalSignal={showModalSignal} setShowModalSignal={setShowModalSignal}/>
                            </InputSignalManagement>
                        </>
                        :
                        <PortManagement selectedPort={selectedPort}>
                            <PortPosition selectedPort={selectedPort ?? {} as Probe}/>
                        </PortManagement>
                    }
                </>
            )
        case 'Simulator':
            return (
                /*<SimulatorLauncher components={components} setMenuItem={setMenuItem}/>*/
                <GenerateMesh
                    quantumDimensions={quantumDimensions}
                    setQuantumDimensions={setQuantumDimensions}
                    setMenuItem={setMenuItem}
                />
            )
        case 'Results':
            return <></>
        default:
            return <></>
    }


}