import React from 'react';

import {useSelector} from "react-redux";
import {selectedProjectSelector} from "../../../store/projectSlice";

interface ModelsProps {
}

export const Models: React.FC<ModelsProps> = ({children}) => {

    const selectedProject = useSelector(selectedProjectSelector)

    return(
        <>
            {(selectedProject && selectedProject.model.components !== undefined)
                ? <div>
                    {children}
                </div>
                : <div className="text-center ">
                    <img src="/noModelsIcon.png" className="mt-[50px] mx-auto" alt='No Models'/>
                    <h5>No Model</h5>
                    <p className="mt-[50px]">Use the icon from the Tool Bar <br/> to import a 3D CAD File.
                    </p>
                </div>
            }
        </>
    )

}