import ReactS3Client from 'react-aws-s3-typescript';
import {s3Config} from './s3Config';


export const uploadFileS3 = async (file: File) => {
    const s3 = new ReactS3Client(s3Config);
    try {
        return await s3.uploadFile(file)
    } catch (exception) {
        console.log(exception);
    }
}

