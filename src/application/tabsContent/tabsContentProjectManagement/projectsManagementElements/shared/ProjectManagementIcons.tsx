import React, {useRef} from 'react';
import {BiShareAlt} from "react-icons/bi";
import {Project} from "../../../../../model/Project";

interface ProjectManagementIconsProps {
    project: Project,
}

export const ProjectManagementIcons: React.FC<ProjectManagementIconsProps> = (
    {
        project,
    }
) => {

    const shareIcon = useRef(null);

    return(
        <div className="row justify-content-end">
            <div ref={shareIcon}
                 className="col-2">
                <BiShareAlt
                    className="hover:cursor-pointer hover:bg-green-200 hover:rounded-2xl"
                    color={'#1C494D'}
                    size="20px"
                    onClick={() => {}}
                />
            </div>
        </div>
    )

}