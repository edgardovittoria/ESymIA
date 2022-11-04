import React, {useEffect, useRef} from 'react';
import {Probe} from "../../../../../../../model/Port";
import {Object3DNode, useThree} from "@react-three/fiber";
import * as THREE from "three";
import {TransformControls} from "@react-three/drei";

interface ProbeControlsProps {
    selectedProbe: Probe,
    updateProbePosition: Function
}

export const ProbeControls: React.FC<ProbeControlsProps> = (
    {selectedProbe, updateProbePosition}
) => {
    const transformation = useRef(null);
    const { scene } = useThree()

    useEffect(() => {
        if (transformation.current) {
            const controls = transformation.current as unknown as Object3DNode<any, any>;
            controls.addEventListener("dragging-changed", onChangePositionHandler)
            return () => controls.removeEventListener("dragging-changed", onChangePositionHandler)
        }
    })


    function onChangePositionHandler(event: THREE.Event) {
        if (!event.value && transformation.current) {
            const controls: Object3DNode<any, any> = transformation.current as unknown as Object3DNode<any, any>
            let transformationParmas = {
                type: 'probe',
                position: [controls.worldPosition.x, controls.worldPosition.y, controls.worldPosition.z],
            }
            updateProbePosition(transformationParmas)
        }
    }

    return (
        <>
            <TransformControls
                object={scene.getObjectByName(selectedProbe.name)}
                ref={transformation}
                position={selectedProbe.elements[4].transformationParams.position}
                showX={selectedProbe.isSelected}
                showY={selectedProbe.isSelected}
                showZ={selectedProbe.isSelected}
            />
        </>
    )

}