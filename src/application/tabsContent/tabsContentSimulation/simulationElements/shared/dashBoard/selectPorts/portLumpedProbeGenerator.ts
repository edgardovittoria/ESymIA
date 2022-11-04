import {Port, Probe, RLCParams} from "../../../../../../../model/Port";
import {CircleGeometryAttributes, ComponentEntity, TransformationParams} from "cad-library";

export function getDefaultPort(key: number){
    let port: Port = {
        name: "Port" + key,
        category: 'port',
        type: 0,
        inputElement: {
            type: "CIRCLE",
            keyComponent: 0,
            geometryAttributes: {
                radius: 0.05,
                segments: 10,
            } as CircleGeometryAttributes,
            name: "inputPort" + key,
            orbitEnabled: false,
            transformationParams: {
                position: [-2.5, 2.5, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            } as TransformationParams,
            previousTransformationParams: {
                position: [-2.5, 2.5, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            } as TransformationParams,
        } as ComponentEntity,
        outputElement: {
            type: "CIRCLE",
            keyComponent: 0,
            geometryAttributes: {
                radius: 0.05,
                segments: 10,
            } as CircleGeometryAttributes,
            name: "outputPort" + key,
            orbitEnabled: false,
            transformationParams: {
                position: [2.5, 2.5, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            } as TransformationParams,
            previousTransformationParams: {
                position: [2.5, 2.5, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            } as TransformationParams,
        } as ComponentEntity,
        isSelected: false,
        rlcParams: {} as RLCParams,
    }
    return port
}

export function getDefaultLumped(key: number){
    let lumped: Port = {
        name: "Lumped" + key,
        category: 'lumped',
        type: 0,
        inputElement: {
            type: "CIRCLE",
            keyComponent: 0,
            geometryAttributes: {
                radius: 0.05,
                segments: 10,
            } as CircleGeometryAttributes,
            name: "inputPort" + key,
            orbitEnabled: false,
            transformationParams: {
                position: [-2.5, 2.5, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            } as TransformationParams,
            previousTransformationParams: {
                position: [-2.5, 2.5, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            } as TransformationParams,
        } as ComponentEntity,
        outputElement: {
            type: "CIRCLE",
            keyComponent: 0,
            geometryAttributes: {
                radius: 0.05,
                segments: 10,
            } as CircleGeometryAttributes,
            name: "outputPort" + key,
            orbitEnabled: false,
            transformationParams: {
                position: [2.5, 2.5, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            } as TransformationParams,
            previousTransformationParams: {
                position: [2.5, 2.5, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            } as TransformationParams,
        } as ComponentEntity,
        isSelected: false,
        rlcParams: {} as RLCParams,
    }
    return lumped
}

export function getDefaultProbe(key: number){
    let probe: Probe = {
        name: "Probe" + key,
        category: 'probe',
        isSelected: false,
        groupPosition: [0, 3, 0],
        elements: [
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: 0.05,
                    segments: 10,
                } as CircleGeometryAttributes,
                name: "inputPort" + key,
                orbitEnabled: false,
                transformationParams: {
                    position: [-0.5, .5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                previousTransformationParams: {
                    position: [-0.5, .5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: 0.05,
                    segments: 10,
                } as CircleGeometryAttributes,
                name: "inputPort" + key,
                orbitEnabled: false,
                transformationParams: {
                    position: [0, .5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                previousTransformationParams: {
                    position: [0, .5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: 0.05,
                    segments: 10,
                } as CircleGeometryAttributes,
                name: "inputPort" + key,
                orbitEnabled: false,
                transformationParams: {
                    position: [.5, .5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                previousTransformationParams: {
                    position: [.5, .5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: 0.05,
                    segments: 10,
                } as CircleGeometryAttributes,
                name: "inputPort" + key,
                orbitEnabled: false,
                transformationParams: {
                    position: [-0.5, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                previousTransformationParams: {
                    position: [-0.5, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: 0.05,
                    segments: 10,
                } as CircleGeometryAttributes,
                name: "inputPort" + key,
                orbitEnabled: false,
                transformationParams: {
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                previousTransformationParams: {
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: 0.05,
                    segments: 10,
                } as CircleGeometryAttributes,
                name: "inputPort" + key,
                orbitEnabled: false,
                transformationParams: {
                    position: [.5, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                previousTransformationParams: {
                    position: [.5, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: 0.05,
                    segments: 10,
                } as CircleGeometryAttributes,
                name: "inputPort" + key,
                orbitEnabled: false,
                transformationParams: {
                    position: [-0.5, -0.5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                previousTransformationParams: {
                    position: [-0.5, -0.5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: 0.05,
                    segments: 10,
                } as CircleGeometryAttributes,
                name: "inputPort" + key,
                orbitEnabled: false,
                transformationParams: {
                    position: [0, -0.5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                previousTransformationParams: {
                    position: [0, -0.5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: 0.05,
                    segments: 10,
                } as CircleGeometryAttributes,
                name: "inputPort" + key,
                orbitEnabled: false,
                transformationParams: {
                    position: [.5, -0.5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                previousTransformationParams: {
                    position: [.5, -0.5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
            } as ComponentEntity,
        ]
    }
    return probe
}