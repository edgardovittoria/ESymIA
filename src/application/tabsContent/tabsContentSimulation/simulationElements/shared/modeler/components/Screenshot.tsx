import {Project} from "../../../../../../../model/Project";
import React, {FC, useEffect} from "react";
import {useThree} from "@react-three/fiber";
import * as THREE from "three";
import imageCompression from "browser-image-compression";

interface ScreenshotProps{
    selectedProject: Project | undefined,
    setScreenshot: Function
}

export const Screenshot: FC<ScreenshotProps> = ({selectedProject, setScreenshot}) => {

    useEffect(() => {
        screenShot()
    }, [selectedProject?.model.components]);

    const { gl, scene, camera } = useThree()

    const options = {
        maxSizeMB: .05,
        maxWidthOrHeight: 300
    }

    function screenShot() {
        gl.render(scene, camera)
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 0.6
        gl.outputEncoding = THREE.sRGBEncoding
        gl.domElement.toBlob(
            function(blob) {
                if(blob){
                    let imageFile = new File([blob], "screenshot.png", { type: "image/png" })
                    imageCompression(imageFile, options).then(image => {
                        let reader = new FileReader();
                        reader.readAsDataURL(image);
                        reader.onloadend = function() {
                            let base64data = reader.result;
                            setScreenshot(base64data as string)
                        }
                    })
                }

            },
            'image/jpg',
            2.0
        )
    }



    return <></>
}
