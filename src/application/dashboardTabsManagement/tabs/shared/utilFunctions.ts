import {Project} from "../../../../model/esymiaModels";
import {s3} from "../../../../aws/s3Config";
import {ComponentEntity} from "cad-library";
import { Dispatch } from "@reduxjs/toolkit";
import { setModel, setModelUnit } from "../../../../store/projectSlice";

export const setModelInfoFromS3  = (project: Project, dispatch: Dispatch) =>  {
    const params = {
        Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
        Key: project.modelS3 as string,
    };
    s3.getObject(params, (err, data) => {
        if (err) {
            console.log(err)
        }
        let model = JSON.parse(
            data.Body?.toString() as string
        ) as { components: ComponentEntity[], unit: string }
        dispatch(setModelUnit(model.unit))
        dispatch(setModel(model.components))
    })
}