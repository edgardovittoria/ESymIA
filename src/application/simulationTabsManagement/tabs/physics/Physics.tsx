import { FactoryShapes } from "cad-library";
import { useDispatch, useSelector } from "react-redux";
import {
	findSelectedPort,
	selectedProjectSelector,
	selectPort,
	updatePortPosition,
	addPorts,
	setAssociatedSignal
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
import { useRef, useState } from "react";
import { InputSignalManagement } from "./inputSignal/InputSignalManagement";
import { LeftPanel } from "../../sharedElements/LeftPanel";
import { Models } from "../../sharedElements/Models";
import { ModelOutliner } from "../../sharedElements/ModelOutliner";
import { Port, Probe, Project, Signal, TempLumped } from "../../../../model/esymiaModels";

interface PhysicsProps {
	selectedTabLeftPanel: string;
	setSelectedTabLeftPanel: Function;
	savedPortParameters: boolean;
	setSavedPortParameters: Function;
}

export const Physics: React.FC<PhysicsProps> = ({
	selectedTabLeftPanel,
	setSelectedTabLeftPanel,
	savedPortParameters,
	setSavedPortParameters,
}) => {
	const selectedProject = useSelector(selectedProjectSelector);
	let selectedPort = findSelectedPort(selectedProject);
	const [showModalSelectPortType, setShowModalSelectPortType] = useState(false);
	const [showModalSignal, setShowModalSignal] = useState(false);
	const dispatch = useDispatch();
	const inputRefPhysics = useRef(null);

	const onImportPhysicsClick = () => {
		let input = inputRefPhysics.current;
		if (input) {
			(input as HTMLInputElement).click();
		}
	};

	const exportDataToJsonFile = (data: any) => {
		const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
			JSON.stringify(data)
		)}`;
		const link = document.createElement("a");
		link.href = jsonString;
		link.download = selectedProject?.name + "_physics.json";

		link.click();
	};

	return (
		<>
			<CanvasBaseWithRedux
				section="Physics"
				savedPortParameters={savedPortParameters}>
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
									setSavedPortParameters={setSavedPortParameters}
								/>
							)}
						{selectedPort && selectedPort.category === "probe" && (
							<ProbeControls
								selectedProbe={selectedPort as Probe}
								updateProbePosition={(obj: {
									type: "first" | "last";
									position: [number, number, number];
								}) => dispatch(updatePortPosition(obj))}
								setSavedPortParameters={setSavedPortParameters}
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
			<button
			disabled={selectedProject?.simulation?.status === 'Completed'}
				className="absolute left-[30%] top-[160px] text-primaryColor bg-transparent border-none hover:underline hover:text-black"
				onClick={onImportPhysicsClick}>
				Import Physics Setup
				<input
					type="file"
					ref={inputRefPhysics}
					style={{ display: "none" }}
					accept="application/json"
					onChange={(e) => {
						let files = e.target.files;
						files &&
						files[0].text().then((value) => {
							let physics : {ports: (Port | Probe | TempLumped)[], signal: Signal | undefined} = JSON.parse(value);
							(physics.ports.length > 0) && physics.ports.forEach(p => dispatch(addPorts(p)));
							(physics.signal) && dispatch(setAssociatedSignal(physics.signal))
						})
					}}
				/>
			</button>
			<button
				disabled={
					selectedProject &&
					(selectedProject.ports.length > 0 || selectedProject.signal)
						? false
						: true
				}
				className="absolute left-[40%] top-[160px] text-primaryColor bg-transparent border-none hover:underline hover:text-black"
				onClick={() => {
					let physics = {
						ports: selectedProject?.ports,
						signal: selectedProject?.signal,
					};
					exportDataToJsonFile(physics);
				}}>
				Export Physics Setup
			</button>
			{/* <RightPanelSimulation> */}
			{selectedPort &&
			(selectedPort?.category === "port" ||
				selectedPort?.category === "lumped") ? (
				<>
					<PortManagement
						selectedPort={selectedPort}
						savedPortParameters={savedPortParameters}
						setSavedPortParameters={setSavedPortParameters}>
						<PortType
							disabled={selectedProject?.simulation?.status === "Completed"}
							setShow={setShowModalSelectPortType}
							selectedPort={selectedPort}
						/>
						<PortPosition
							selectedPort={selectedPort}
							disabled={selectedProject?.simulation?.status === "Completed"}
							setSavedPortParameters={setSavedPortParameters}
						/>
						<RLCParamsComponent
							selectedPort={selectedPort}
							disabled={selectedProject?.simulation?.status === "Completed"}
							setSavedPortParameters={setSavedPortParameters}
						/>
						{selectedProject?.simulation?.status !== "Completed" && (
							<ModalSelectPortType
								show={showModalSelectPortType}
								setShow={setShowModalSelectPortType}
								selectedPort={selectedPort}
								setSavedPortParameters={setSavedPortParameters}
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
				<PortManagement
					selectedPort={selectedPort}
					savedPortParameters={savedPortParameters}
					setSavedPortParameters={setSavedPortParameters}>
					<PortPosition
						selectedPort={selectedPort ?? ({} as Probe)}
						disabled={selectedProject?.simulation?.status === "Completed"}
						setSavedPortParameters={setSavedPortParameters}
					/>
				</PortManagement>
			)}
			{/* </RightPanelSimulation> */}s
		</>
	);
};
