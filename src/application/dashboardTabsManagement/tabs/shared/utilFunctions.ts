import {Project} from "../../../../model/esymiaModels";
import {s3} from "../../../../aws/s3Config";
import {ComponentEntity} from "cad-library";

export const getModelFromS3  = (project: Project): { components: ComponentEntity[], unit: string } | undefined =>  {
    let model: { components: ComponentEntity[], unit: string } | undefined = undefined
    const params = {
        Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
        Key: project.modelS3 as string,
    };
    s3.getObject(params, (err, data) => {
        if (err) {
            console.log(err)
        }
        model = JSON.parse(
            data.Body?.toString() as string
        ) as { components: ComponentEntity[], unit: string }
    })
    return model
}