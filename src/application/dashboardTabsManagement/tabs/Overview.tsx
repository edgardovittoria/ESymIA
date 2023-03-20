import React from 'react';
import {Simulations} from "./Simulations";
import {useDispatch, useSelector} from "react-redux";
import {importModel, projectsSelector, setModel} from "../../../store/projectSlice";
import {addProjectTab} from '../../../store/tabsAndMenuItemsSlice';
import {getFileS3} from "cad-library/dist/cjs/types/components/aws";
import {s3, s3Config} from "../../../aws/s3Config";
import {ComponentEntity, ImportActionParamsObject} from "cad-library";
import {addUnit} from "../../../store/unitSlice";
import {getModelFromS3} from "./shared/utilFunctions";

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
                <div className="flex flex-row justify-between items-start">
                    <h5>My Recent Projects</h5>
                    <button className="text-primaryColor bg-transparent border-none hover:underline hover:text-black"
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
                                             let model = getModelFromS3(project)
                                             if (model) {
                                                 dispatch(addUnit({unit: model.unit, projectId: project.faunaDocumentId}))
                                                 dispatch(setModel(model.components))
                                             }
                                         }
                                         dispatch(addProjectTab(project))
                                     }}>
                                    <div className="box">
                                        <div className="flex justify-between">
                                            <div className={`w-7/8 text-[20px] mb-[10px]`}>
                                                {(project.name.length > 15) ? project.name.substr(0, 15) + '...' : project.name}
                                            </div>
                                            {/*<div className="w-1/8" onMouseOver={() => setCardMenuHovered(!cardMenuHovered)}>
                                                <ProjectManagementIcons project={project}/>
                                            </div>*/}
                                        </div>
                                        <h6 className="mb-2 text-gray-500">{project.description.substr(0, 50)}</h6>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                }
            </div>
            <div className={`box w-[48.5%] h-1/2 bg-gradient-to-br from-primaryColor to-secondaryColor text-white`}>
                <h5>Your Plan</h5>
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


            </div>
            <div className="mt-3 justify-between w-full h-1/2">
                <Simulations/>
            </div>


        </>
    )

}

