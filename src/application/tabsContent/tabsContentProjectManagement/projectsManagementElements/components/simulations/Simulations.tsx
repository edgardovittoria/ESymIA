import React from 'react';
import {FaCheck, FaPauseCircle} from "react-icons/fa";
import {Simulation} from "../../../../../../model/Simulation";
import {TiDelete} from "react-icons/ti";
import {MdWatchLater} from "react-icons/md";
import {AiOutlineBarChart} from "react-icons/ai";
import {Folder} from "../../../../../../model/Folder";
import {
    findProjectByName,
    mainFolderSelector,
    projectsSelector,
    selectProject
} from "../../../../../../store/projectSlice";
import {Project} from "../../../../../../model/Project";
import {useDispatch, useSelector} from "react-redux";

interface SimulationsProps {
    selectTab: Function,
    setSimulationCoreMenuItemSelected: Function,
    setSelectedSimulation: Function,
    setProjectsTab: Function,
    projectsTab: Project[]
}

export const Simulations: React.FC<SimulationsProps> = (
    {
        selectTab, setSimulationCoreMenuItemSelected, setSelectedSimulation,
        setProjectsTab, projectsTab
    }
) => {
    const dispatch = useDispatch()
    const mainFolder = useSelector(mainFolderSelector)
    const projects = useSelector(projectsSelector)

    let simulations: Simulation[] = []

    function getAllSimulation(folder: Folder) {
        folder.projectList.forEach(p => {
            p.simulations.forEach(s => simulations.push(s))
        })
        folder.subFolders.forEach(f => {
            getAllSimulation(f)
        })
    }

    getAllSimulation(mainFolder)


    function showResultsIcon(id: string) {
        document.getElementById(id)?.setAttribute('style', 'visibility: visible')
    }

    function hideResultsIcon(id: string) {
        document.getElementById(id)?.setAttribute('style', 'visibility: hidden')
    }

    function factoryStatusIcon(status: string) {
        switch (status) {
            case "Completed":
                return <FaCheck color={'#1aa33c'}/>
            case "Failed":
                return <TiDelete color={'#ec0c0c'}/>
            case "Paused":
                return <FaPauseCircle color={'#ec0c0c'}/>
            case "Queued":
                return <MdWatchLater color={'#ffcc00'}/>
            default :
                return <></>
        }
    }

    return (
        <div className="text-center p-[20px] box w-full flex flex-col">
            <h5 className="text-left">Simulations</h5>
            {simulations.length > 0
                ?
                <div className="overflow-auto h-full w-full mt-5">
                    <table className="table mt-4 w-full">
                        <thead className="sticky top-0 bg-[#f4f4f4]">
                        <tr>
                            <th className="py-4" scope="col"/>
                            <th className="py-4" scope="col">Project - Name</th>
                            <th className="py-4" scope="col">Started</th>
                            <th className="py-4" scope="col">Ended</th>
                            <th className="py-4" scope="col">Status</th>
                            <th className="py-4" scope="col"/>
                        </tr>
                        </thead>
                        <tbody>
                        {simulations.map((simulation, index) => {
                            let statusIcon: JSX.Element = factoryStatusIcon(simulation.status)
                            let started = new Date(parseInt(simulation.started))
                            let ended = new Date(parseInt(simulation.ended))
                            return (
                                <tr key={simulation.name}
                                    onMouseOver={() => showResultsIcon(index.toString())}
                                    onMouseOut={() => hideResultsIcon(index.toString())}
                                    className="hover:bg-[#f1f1f1]"
                                >
                                    <th scope="row" className="pl-8">
                                        {statusIcon}
                                    </th>
                                    <td className="fw-bold py-4">{simulation.name}</td>
                                    <td className="py-4">{`${started.toLocaleString()}`}</td>
                                    <td className="py-4">{`${ended.toLocaleString()}`}</td>
                                    <td className="py-4">{simulation.status}</td>
                                    <td id={index.toString()} className={`py-4 hover:cursor-pointer`}
                                        style={{visibility: "hidden"}}>
                                        <AiOutlineBarChart color={'#00ae52'} style={{width: "30px", height: "30px"}}
                                                           onClick={() => {
                                                               let proj = findProjectByName(projects, simulation.associatedProject)
                                                               if(proj && projectsTab.includes(proj)){
                                                                   selectTab(simulation.associatedProject)
                                                               }else{
                                                                   setProjectsTab([...projectsTab, proj])
                                                                   selectTab(simulation.associatedProject)
                                                               }
                                                               dispatch(selectProject(simulation.associatedProject))
                                                               setSelectedSimulation(simulation)
                                                               setSimulationCoreMenuItemSelected('Results')
                                                           }}
                                        />
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>

                :
                <div>
                    <img src="/noresultfound.png" className="my-[46px] mx-auto" alt="No Results Icon"/>
                    <p>No results found</p>
                </div>

            }
        </div>
    )
}