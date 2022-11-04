import {useEffect, useState} from "react";
import {ComponentEntity} from "cad-library";
import {generateSTLListFromComponents, getMaterialListFrom} from "./auxiliaryFunctions/auxiliaryFunctions";
import axios from "axios";
import {MesherOutput} from "../../../../model/MesherInputOutput";
import {exportJson} from "../../../../importExport/exportFunctions";
import {useDispatch, useSelector} from "react-redux";
import {
    MeshGeneratedSelector,
    setDownloadPercentage,
    setMesherOutput,
    setMeshGenerated
} from "../../../../store/mesherSlice";

export const useGenerateMesh = (
    components: ComponentEntity[], quantumDimensions: [number, number, number]
) => {
    //const [meshGenerated, setMeshGenerated] = useState<"Not Generated" | "Generating" | "Generated">("Not Generated");

    const meshGenerated = useSelector(MeshGeneratedSelector)

    const dispatch = useDispatch()


    useEffect(() => {


        if(meshGenerated === "Generating"){
            let objToSendToMesher = {
                STLList: (components) && generateSTLListFromComponents(getMaterialListFrom(components), components),
                quantum: quantumDimensions
            }
            console.log(objToSendToMesher)
            //TODO: add http request to generate mesh and set mesherOutput
            axios.get('http://localhost:3001/mesherOutput', {
                /*onDownloadProgress: progressEvent => {
                    console.log(progressEvent)
                    dispatch(setDownloadPercentage(Math.round((progressEvent.loaded * 100) / progressEvent.total)))
                }*/
            }).then(res => {
                dispatch(setMesherOutput(res.data))
            })
            //exportJson(objToSendToMesher)
        }

    }, [meshGenerated]);

}