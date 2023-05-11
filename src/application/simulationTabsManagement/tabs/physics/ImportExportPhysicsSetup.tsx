import {FC, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    Port,
    Probe,
    Signal,
    TempLumped,
} from "../../../../model/esymiaModels";
import {
    addPorts,
    selectedProjectSelector,
    setAssociatedSignal, setPortKey,
} from "../../../../store/projectSlice";
import {BiExport, BiImport} from "react-icons/bi";
import { exportToJsonFileThis } from "../../sharedElements/utilityFunctions";

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
    return (
        <>
            <div className="tooltip absolute left-[28%] top-[160px]" data-tip="Import Physics">
                <button
                    disabled={selectedProject?.simulation?.status === "Completed"}
                    className={`bg-white rounded p-2 ${selectedProject?.simulation?.status === "Completed" && 'opacity-40'}`}
                    onClick={onImportPhysicsClick}>
                    <BiImport className="h-5 w-5 text-green-300 hover:text-secondaryColor"/>
                    <input
                        type="file"
                        ref={inputRefPhysics}
                        style={{display: "none"}}
                        accept="application/json"
                        onChange={(e) => {
                            let files = e.target.files;
                            files &&
                            files[0].text().then((value) => {
                                let physics: {
                                    ports: (Port | Probe | TempLumped)[];
                                    signal: Signal | undefined;
                                    portKey: number
                                } = JSON.parse(value);
                                physics.ports.length > 0 &&
                                physics.ports.forEach((p) => dispatch(addPorts(p)));
                                physics.signal && dispatch(setAssociatedSignal(physics.signal));
                                dispatch(setPortKey(physics.portKey))
                            });
                        }}
                    />
                </button>
            </div>
            <div className="tooltip absolute left-[30.5%] top-[160px]" data-tip="Export Physics">
                <button
                    disabled={
                        !(selectedProject &&
                            (selectedProject.ports.length > 0 || selectedProject.signal))
                    }
                    className="bg-white rounded p-2"
                    onClick={() => {
                        let physics = {
                            ports: selectedProject?.ports,
                            signal: selectedProject?.signal,
                            portKey: selectedProject?.portKey
                        };
                        exportToJsonFileThis(physics, selectedProject?.name + "_physics.json");
                    }}>
                    <BiExport className={`h-5 w-5 text-green-300 hover:text-secondaryColor ${!(selectedProject &&
                        (selectedProject.ports.length > 0 || selectedProject.signal)) && 'opacity-40'}`}/>
                </button>
            </div>
        </>
    );
};
