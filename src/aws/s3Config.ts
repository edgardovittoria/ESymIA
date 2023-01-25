import AWS from "aws-sdk"

export const s3Config = {
    bucketName: "models-bucket-49718971291",
    region: "us-east-1",
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY as string,
    s3Url: "https://models-bucket-49718971291.s3.amazonaws.com/",
}

AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_KEY,
    httpOptions:{
        timeout: 300*1000,
        connectTimeout: 300*1000
    }
})

export const s3 = new AWS.S3()
export const lambdaClient = new AWS.Lambda({region: "us-east-1"})
