import {useEffect, useState} from "react";
import {Simulation} from "../../../../model/Simulation";
import {getSimulationByName} from "../../../../faunadb/api/simulationAPIs";
import {useFaunaQuery} from "cad-library";
import {Project} from "../../../../model/Project";
import {useDispatch, useSelector} from "react-redux";
import {createSimulation, simulationSelector, updateSimulation} from "../../../../store/projectSlice";
import {MeshApprovedSelector} from "../../../../store/mesherSlice";
import {setSimulationStatus, setSolverOutput} from "../../../../store/solverSlice";
import {Port, TempLumped} from "../../../../model/Port";
import axios from "axios";
import {SolverOutput} from "../../../../model/SolverInputOutput";

export const useRunSimulation =
    (
        associatedProject: Project | undefined
    ) => {

        const dispatch = useDispatch()
        const simulations = useSelector(simulationSelector)
        const meshApproved = useSelector(MeshApprovedSelector)
        const [newSimulation, setNewSimulation] = useState<Simulation>({} as Simulation);
        const {execQuery} = useFaunaQuery()



        useEffect(() => {
            if (meshApproved) {
                dispatch(setSimulationStatus("started"))
                let simulation: Simulation = {
                    name: associatedProject?.name + ' - sim' + ((simulations as Simulation[]).length + 1).toString(),
                    started: Date.now().toString(),
                    ended: "",
                    results: {} as SolverOutput,
                    status: "Queued",
                    associatedProject: associatedProject?.name as string
                }
                dispatch(createSimulation(simulation))
                setNewSimulation(simulation)

                let frequencyArray: number[] = []
                if(associatedProject) associatedProject.signal?.signalValues.forEach(sv => frequencyArray.push(sv.freq))

                let signalsValuesArray: { Re: number; Im: number; }[] = []
                if(associatedProject) associatedProject.signal?.signalValues.forEach(sv => signalsValuesArray.push(sv.signal))

                let ports = (associatedProject) && associatedProject.ports.filter(port => port.category === 'port')
                let lumped_elements = (associatedProject) && associatedProject.ports.filter(port => port.category === 'lumped')

                let lumped_array: {type: number, value: number}[] = []
                lumped_elements?.forEach(le => {
                    let lumped: TempLumped = {...le as Port, value: (le as Port).rlcParams.resistance as number}
                    lumped_array.push(lumped)
                })


                //TODO: add http request to execute the simulation
                /*
                * axios.post("url", dataToSendToSolver).then((res) => {
                *   save results on the store to visualize relative charts
                * })
                * */
                axios.get('http://localhost:3001/solverOutput').then(res => {
                    dispatch(setSolverOutput(res.data))
                    let simulationUpdated: Simulation = {
                        ...simulation,
                        results: res.data,
                        ended: Date.now().toString(),
                        status: "Completed"
                    }
                    console.log(simulationUpdated)
                    dispatch(updateSimulation(simulationUpdated))
                })
                //console.log(dataToSendToSolver)
                //exportSolverJson(dataToSendToSolver)
                setTimeout(() => {
                    dispatch(setSimulationStatus("completed"))
                    execQuery(getSimulationByName, 'simulation1').then(() => {

                    })
                        .catch(() => {
                            //management of exceptions
                        });

                }, 5000)
            }
        }, [meshApproved]);

        return {newSimulation}
    }