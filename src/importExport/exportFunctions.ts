import { Project } from "../model/Project";
import {Material} from "cad-library";
import {Port, Probe} from "../model/Port";
import {MesherOutput} from "../model/MesherInputOutput";

export const exportSimulationProject = (project: Project) => {
    const link = document.createElement('a');
    link.href = `data:application/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(project)
    )}`
    link.download = project.name + ".json"
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


export const exportJson = (obj: { STLList: { material: string; STL: string; }[]; quantum: [number, number, number]; }) => {
    const link = document.createElement('a');
    link.href = `data:application/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(obj)
    )}`
    link.download = "inputMesher.json"
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export const exportSolverJson = (obj: { mesherOutput: MesherOutput | undefined; materials: Material[]; ports: undefined | (Port | Probe )[] }) => {
    const link = document.createElement('a');
    link.href = `data:application/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(obj)
    )}`
    link.download = "inputSolver.json"
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
