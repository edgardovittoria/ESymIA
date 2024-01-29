import React from 'react';
import {Simulations} from "./Simulations";
import {useDispatch, useSelector} from "react-redux";
import {projectsSelector} from "../../../store/projectSlice";
import {addProjectTab} from '../../../store/tabsAndMenuItemsSlice';
import {setModelInfoFromS3} from "./shared/utilFunctions";
import {AiFillUnlock} from "react-icons/ai";

interface OverviewProps {
    setShowModal: Function
}

export const Overview: React.FC<OverviewProps> = (
    {
        setShowModal
    }
) => {
    const dispatch = useDispatch()
    const projects = useSelector(projectsSelector)
    //const [cardMenuHovered, setCardMenuHovered] = useState(false);


    return (
        <>
            <div className={`box w-[48.5%] h-1/2`}>
                <div className="flex flex-row justify-between items-start p-2">
                    <h5 className="text-base">My Recent Projects</h5>
                    <button className="text-primaryColor text-sm bg-transparent border-none hover:underline hover:text-black"
                            onClick={() => {
                                setShowModal(true)
                            }}>
                        + New Project
                    </button>
                </div>

                {projects.length === 0 ?
                    <div className="text-center p-[20px]">
                        <img src="/noProjectsIcon2.png" className="m-auto" alt="No Projects Icon"/>
                        <p>No projects for now.</p>
                        <button className="button buttonPrimary" data-toggle="modal"
                                data-target="#createNewProjectModal"
                                onClick={() => {
                                    setShowModal(true)
                                }}>CREATE YOUR FIRST PROJECT
                        </button>
                    </div>
                    :
                    <div className="p-[15px] overflow-scroll max-h-[250px]">
                        {projects.map(project => {
                            return (
                                <div key={project.name}
                                     className="w-100 rounded border-[1px] border-gray-400 mb-[15px] hover:cursor-pointer"
                                     onClick={() => {
                                         if(!project.model.components && project.modelS3){
                                             setModelInfoFromS3(project, dispatch)
                                         }
                                         dispatch(addProjectTab(project))
                                     }}>
                                    <div className="box">
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <div className={`text-[20px]`}>
                                                    {(project.name.length > 15) ? project.name.substring(0, 15) + '...' : project.name}
                                                </div>
                                                <h6 className="mb-2 text-gray-500">{project.description.substring(0, 50)}</h6>
                                            </div>
                                            <img className="w-[15%]" alt="project_screenshot" src="/noResultsIconForProject.png"/>
                                        </div>

                                    </div>
                                </div>
                            )
                        })}
                    </div>
                }
            </div>
            <div className={`box w-[48.5%] relative h-1/2 bg-gradient-to-br from-primaryColor to-green-600 text-white`}>
                <h5 className="text-base p-2">Your Plan</h5>
                <div className="pl-[20px]">
                    <h2 className="mt-[10px]">Upgrade to a Pro <br/> Account</h2>
                    <div className="flex">
                        <div>
                            <ul className="ml-8">
                                <li className="mt-[10px] text-[20px]">
                                    text list item 1
                                </li>
                                <li className="mt-[10px] text-[20px]">
                                    text list item 2
                                </li>
                            </ul>
                            <button
                                className={`button mt-[20px] text-[18px] uppercase text-secondaryColor bg-white`}>See
                                More
                            </button>
                        </div>
                    </div>
                </div>
                <svg width="1em" height="1em">
                    <linearGradient id="blue-gradient" x1="20%" y1="100%" x2="20%" y2="30%">
                        <stop stopColor="#ececec" offset="0%" />
                        <stop stopColor="#174143" offset="100%" />
                    </linearGradient>
                </svg>
                <AiFillUnlock style={{ fill: "url(#blue-gradient)"}} size={280} className="absolute right-0 bottom-[-40px]"/>

            </div>
            <div className="mt-3 justify-between w-full h-1/2">
                <Simulations/>
            </div>


        </>
    )

}

