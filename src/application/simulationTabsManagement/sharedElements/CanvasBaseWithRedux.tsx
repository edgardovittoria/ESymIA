import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Color, Mesh, MeshPhongMaterial } from "three";
import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { GiCubeforce } from "react-icons/gi";
import {
	CanvasState,
	FactoryShapes,
	ImportActionParamsObject,
	ImportCadProjectButton,
	ImportModelFromDBModal,
	useFaunaQuery,
} from "cad-library";
import {
	importModel,
	OrbitTarget,
	orbitTargetSelector,
	selectedProjectSelector,
  setOrbitTarget,
} from "../../../store/projectSlice";
import { updateProjectInFauna } from "../../../faunadb/projectsFolderAPIs";
import { Provider, ReactReduxContext, useDispatch, useSelector } from "react-redux";
import { s3 } from "../../../aws/s3Config";
import { Screenshot } from "./Screenshot";

interface CanvasBaseWithReduxProps {
	section: string;
	portClickAction?: Function;
	savedPortParameters?: boolean;
}

export const CanvasBaseWithRedux: React.FC<CanvasBaseWithReduxProps> = ({
	section,
	savedPortParameters,
	children,
}) => {
	const selectedProject = useSelector(selectedProjectSelector);
	let mesherOutput = selectedProject?.meshData.mesh;
	const [showModalLoadFromDB, setShowModalLoadFromDB] = useState(false);
  const orbitTarget = useSelector(orbitTargetSelector)

	const { execQuery } = useFaunaQuery();
	const mesh = useRef(null);
  const dispatch = useDispatch()

	useEffect(() => {
		if (selectedProject && savedPortParameters === true) {
			execQuery(updateProjectInFauna, selectedProject);
		}
	}, [
		selectedProject?.model,
		savedPortParameters,
		selectedProject?.ports,
		selectedProject?.signal,
		selectedProject?.simulation,
		selectedProject?.meshData,
	]);

  useEffect(() => {
    if(mesh.current){
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

	return (
		<div className="flex justify-center">
			{selectedProject && selectedProject.model.components ? (
				<ReactReduxContext.Consumer>
					{({ store }) => (
						<Canvas style={{ width: "1920px", height: "828px" }}>
							<Provider store={store}>
								<pointLight position={[100, 100, 100]} intensity={0.8} />
								<hemisphereLight
									color={"#ffffff"}
									groundColor={new THREE.Color("#b9b9b9")}
									position={[-7, 25, 13]}
									intensity={0.85}
								/>
								{/* paint models */}
								{(!mesherOutput || section !== "Simulator") &&
									selectedProject?.model.components.map((component) => {
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
												<FactoryShapes entity={component} />
											</mesh>
										);
									})}
								{children}
								<OrbitControls makeDefault target={(orbitTarget) ? new THREE.Vector3(orbitTarget?.position[0], orbitTarget?.position[1], orbitTarget?.position[2]): new THREE.Vector3(0,0,0)}/>
								<GizmoHelper alignment="bottom-left" margin={[150, 80]}>
									<GizmoViewport
										axisColors={["red", "#40ff00", "blue"]}
										labelColor="white"
									/>
								</GizmoHelper>
								<Screenshot selectedProject={selectedProject} />
							</Provider>
						</Canvas>
					)}
				</ReactReduxContext.Consumer>
			) : (
				<div className="absolute top-1/2 w-1/5 flex justify-between">
					<ImportCadProjectButton
						className="button buttonPrimary flex items-center"
						importAction={importModel}
						actionParams={
							{ id: selectedProject?.name } as ImportActionParamsObject
						}>
						<GiCubeforce
							style={{ width: "25px", height: "25px", marginRight: "5px" }}
						/>{" "}
						Import From FS
					</ImportCadProjectButton>
					<span className="border-start border-dark" />
					<button
						className="button buttonPrimary flex items-center"
						onClick={() => setShowModalLoadFromDB(true)}>
						<GiCubeforce
							style={{ width: "25px", height: "25px", marginRight: "5px" }}
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
					importAction={importModel}
					importActionParams={
						{
							canvas: {
								components: [],
								lastActionType: "",
								numberOfGeneratedKey: 0,
								selectedComponentKey: 0,
							} as CanvasState,
							id: selectedProject?.name,
						} as ImportActionParamsObject
					}
				/>
			)}
		</div>
	);
};
