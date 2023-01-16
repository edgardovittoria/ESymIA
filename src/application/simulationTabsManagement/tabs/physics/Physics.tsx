import { FactoryShapes } from "cad-library";
import { useDispatch, useSelector } from "react-redux";
import {
	findSelectedPort,
	selectedProjectSelector,
	selectPort,
	updatePortPosition,
} from "../../../../store/projectSlice";
import { CanvasBaseWithRedux } from "../../sharedElements/CanvasBaseWithRedux";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { PortControls } from "./portManagement/PortControls";
import { ProbeControls } from "./portManagement/ProbeControls";
import { PhysicsLeftPanelTab } from "./PhysicsLeftPanelTab";
import { SelectPorts } from "./portManagement/selectPorts/SelectPorts";
import { PortManagement } from "./portManagement/PortManagement";
import { PortType } from "./portManagement/components/PortType";
import { PortPosition } from "./portManagement/components/PortPosition";
import { RLCParamsComponent } from "./portManagement/components/RLCParamsComponent";
import { ModalSelectPortType } from "./portManagement/ModalSelectPortType";
import { InputSignal } from "./inputSignal/InputSignal";
import { ModalSignals } from "./inputSignal/ModalSignals";
import { useState } from "react";
import { InputSignalManagement } from "./inputSignal/InputSignalManagement";
import { LeftPanel } from "../../sharedElements/LeftPanel";
import { Models } from "../../sharedElements/Models";
import { ModelOutliner } from "../../sharedElements/ModelOutliner";
import { Probe, Project } from "../../../../model/esymiaModels";

interface PhysicsProps {
	selectedTabLeftPanel: string;
	setSelectedTabLeftPanel: Function;
}

export const Physics: React.FC<PhysicsProps> = ({
	selectedTabLeftPanel,
	setSelectedTabLeftPanel,
}) => {
	const selectedProject = useSelector(selectedProjectSelector);
	let selectedPort = findSelectedPort(selectedProject);
	const [showModalSelectPortType, setShowModalSelectPortType] = useState(false);
	const [showModalSignal, setShowModalSignal] = useState(false);
	const dispatch = useDispatch();
	return (
		<>
			<CanvasBaseWithRedux section="Physics">
				{selectedProject?.ports.map((port, index) => {
					if (port.category === "port" || port.category === "lumped") {
						return (
							<group key={index}>
								<mesh
									name={port.inputElement.name}
									position={port.inputElement.transformationParams.position}
									scale={port.inputElement.transformationParams.scale}
									rotation={port.inputElement.transformationParams.rotation}
									onClick={() => dispatch(selectPort(port.name))}>
									<FactoryShapes entity={port.inputElement} color="#00ff00" />
								</mesh>

								<mesh
									name={port.outputElement.name}
									position={port.outputElement.transformationParams.position}
									scale={port.outputElement.transformationParams.scale}
									rotation={port.outputElement.transformationParams.rotation}
									onClick={() => dispatch(selectPort(port.name))}>
									<FactoryShapes entity={port.outputElement} />
								</mesh>
								<Line
									points={[
										port.inputElement.transformationParams.position,
										port.outputElement.transformationParams.position,
									]}
									color={
										port.category === "port"
											? new THREE.Color("red").getHex()
											: new THREE.Color("violet").getHex()
									}
									lineWidth={1}
									alphaWrite={undefined}
								/>
							</group>
						);
					} else {
						return (
							<group
								key={port.name}
								name={port.name}
								onClick={() => dispatch(selectPort(port.name))}
								position={(port as Probe).groupPosition}>
								{(port as Probe).elements.map((element, index) => {
									return (
										<mesh
											key={index}
											position={element.transformationParams.position}
											scale={element.transformationParams.scale}
											rotation={element.transformationParams.rotation}>
											<FactoryShapes entity={element} color="orange" />
										</mesh>
									);
								})}
							</group>
						);
					}
				})}
				{selectedProject?.simulation?.status !== "Completed" && (
					<>
						{selectedPort &&
							(selectedPort.category === "port" ||
								selectedPort.category === "lumped") && (
								<PortControls
									selectedPort={selectedPort}
									updatePortPosition={(obj: {
										type: "first" | "last";
										position: [number, number, number];
									}) => dispatch(updatePortPosition(obj))}
								/>
							)}
						{selectedPort && selectedPort.category === "probe" && (
							<ProbeControls
								selectedProbe={selectedPort as Probe}
								updateProbePosition={(obj: {
									type: "first" | "last";
									position: [number, number, number];
								}) => dispatch(updatePortPosition(obj))}
							/>
						)}
					</>
				)}
			</CanvasBaseWithRedux>
			<LeftPanel
				tabs={["Modeler", "Physics"]}
				selectedTab={selectedTabLeftPanel}
				setSelectedTab={setSelectedTabLeftPanel}>
				{selectedTabLeftPanel === "Physics" ? (
					<PhysicsLeftPanelTab />
				) : (
					<Models>
						<ModelOutliner />
					</Models>
				)}
			</LeftPanel>
			{selectedProject?.model.components && (
				<SelectPorts selectedProject={selectedProject} />
			)}
			{/* <RightPanelSimulation> */}
			{selectedPort &&
			(selectedPort?.category === "port" ||
				selectedPort?.category === "lumped") ? (
				<>
					<PortManagement selectedPort={selectedPort}>
						<PortType
							disabled={selectedProject?.simulation?.status === "Completed"}
							setShow={setShowModalSelectPortType}
							selectedPort={selectedPort}
						/>
						<PortPosition
							selectedPort={selectedPort}
							disabled={selectedProject?.simulation?.status === "Completed"}
						/>
						<RLCParamsComponent
							selectedPort={selectedPort}
							disabled={selectedProject?.simulation?.status === "Completed"}
						/>
						{selectedProject?.simulation?.status !== "Completed" && (
							<ModalSelectPortType
								show={showModalSelectPortType}
								setShow={setShowModalSelectPortType}
								selectedPort={selectedPort}
							/>
						)}
					</PortManagement>
					<InputSignalManagement>
						<InputSignal
							disabled={selectedProject?.simulation?.status === "Completed"}
							setShowModalSignal={setShowModalSignal}
							selectedProject={selectedProject as Project}
						/>
						<ModalSignals
							showModalSignal={showModalSignal}
							setShowModalSignal={setShowModalSignal}
						/>
					</InputSignalManagement>
				</>
			) : (
				<PortManagement selectedPort={selectedPort}>
					<PortPosition
						selectedPort={selectedPort ?? ({} as Probe)}
						disabled={selectedProject?.simulation?.status === "Completed"}
					/>
				</PortManagement>
			)}
			{/* </RightPanelSimulation> */}
		</>
	);
};
