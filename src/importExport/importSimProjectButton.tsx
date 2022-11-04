import { FC, useRef } from "react";
import { useDispatch } from "react-redux";
import { Project } from "../model/Project";
import { addProject } from "../store/projectSlice";

interface ImportSimProjectButtonProps{
    className?: string,
    setMenuItem: Function
}

export const ImportSimProjectButton: FC<ImportSimProjectButtonProps> = ({ className, children, setMenuItem }) => {

    const inputRefProject = useRef(null)
    const dispatch = useDispatch()

    const onImportProjectClick = () => {
        let input = inputRefProject.current
        if (input) {
            (input as HTMLInputElement).click()
        }

    };

    return (
        <button className={(className) ? className : "btn-success"} onClick={onImportProjectClick}>
            {children}
            <input
                type="file"
                ref={inputRefProject}
                style={{ display: "none" }}
                accept="application/json"
                onChange={(e) => {
                    let files = e.target.files;
                    if (files) {
                        files[0].text().then((value) => {
                            let project: Project = JSON.parse(value)
                            dispatch(addProject(project))
                            setMenuItem("Projects")
                        })
                    }
                }}
            />
        </button>
    )

}