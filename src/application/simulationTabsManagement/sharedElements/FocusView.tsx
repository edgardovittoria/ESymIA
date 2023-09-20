import { Bounds, useBounds } from "@react-three/drei"
import { FC, useEffect } from "react"
import { useSelector } from "react-redux"
import { selectedProjectSelector } from "../../../store/projectSlice"


export const FocusView: FC = ({ children }) => {
    return (
        <Bounds fit clip observe margin={1.8}>
            <FocusViewCommonActions>
                {children}
            </FocusViewCommonActions>
        </Bounds>
    )
}

const FocusViewCommonActions: FC = ({ children }) => {
    const selectedProject = useSelector(selectedProjectSelector)
    const bounds = useBounds()
    useEffect(() => {
        //bounds.refresh().fit()
    }, [selectedProject])

    return (
        <group
            //onPointerMissed={(e) => e.button === 0 && bounds.refresh().fit()}
        >
            {children}
        </group>
    )
}