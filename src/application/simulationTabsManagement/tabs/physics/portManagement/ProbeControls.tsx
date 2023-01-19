import React, {useEffect, useRef} from 'react';
import {Object3DNode, useThree} from "@react-three/fiber";
import * as THREE from "three";
import {TransformControls} from "@react-three/drei";
import { Probe } from '../../../../../model/esymiaModels';

interface ProbeControlsProps {
    selectedProbe: Probe,
    updateProbePosition: Function,
    setSavedPortParameters: Function
}

export const ProbeControls: React.FC<ProbeControlsProps> = (
    {selectedProbe, updateProbePosition, setSavedPortParameters}
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
        setSavedPortParameters(false)
        if (!event.value && transformation.current) {
            const controls: Object3DNode<any, any> = transformation.current as unknown as Object3DNode<any, any>
            let transformationParmas = {
                type: 'probe',
                position: [controls.worldPosition.x, controls.worldPosition.y, controls.worldPosition.z],
            }
            updateProbePosition(transformationParmas)
            setSavedPortParameters(true)
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