import { FC, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	Port,
	Probe,
	Signal,
	TempLumped,
} from "../../../../model/esymiaModels";
import {
	addPorts,
	selectedProjectSelector,
	setAssociatedSignal,
} from "../../../../store/projectSlice";

export const ImportExportPhysicsSetup: FC<{}> = () => {
	const selectedProject = useSelector(selectedProjectSelector);
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
			<button
				disabled={selectedProject?.simulation?.status === "Completed"}
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
								let physics: {
									ports: (Port | Probe | TempLumped)[];
									signal: Signal | undefined;
								} = JSON.parse(value);
								physics.ports.length > 0 &&
									physics.ports.forEach((p) => dispatch(addPorts(p)));
								physics.signal && dispatch(setAssociatedSignal(physics.signal));
							});
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
		</>
	);
};
