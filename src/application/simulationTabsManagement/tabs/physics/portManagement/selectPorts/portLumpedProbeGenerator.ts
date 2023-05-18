import {CircleGeometryAttributes, ComponentEntity, TransformationParams} from "cad-library";
import {Port, Probe, RLCParams, TempLumped} from "../../../../../../model/esymiaModels";

export function getDefaultPort(key: number, size: number){
    let port: Port = {
        name: "Port" + key,
        category: 'port',
        type: 0,
        inputElement: {
            type: "CIRCLE",
            keyComponent: 0,
            geometryAttributes: {
                radius: size/100,
                segments: 20,
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
            opacity: 1,
            transparency: false
        } as ComponentEntity,
        outputElement: {
            type: "CIRCLE",
            keyComponent: 0,
            geometryAttributes: {
                radius: size/100,
                segments: 20,
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
            opacity: 1,
            transparency: false
        } as ComponentEntity,
        isSelected: false,
        rlcParams: {} as RLCParams,
    }
    return port
}

export function getDefaultLumped(key: number, size: number){
    let lumped: TempLumped = {
        name: "Lumped" + key,
        category: 'lumped',
        type: 0,
        inputElement: {
            type: "CIRCLE",
            keyComponent: 0,
            geometryAttributes: {
                radius: size/100,
                segments: 20,
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
            opacity: 1,
            transparency: false
        } as ComponentEntity,
        outputElement: {
            type: "CIRCLE",
            keyComponent: 0,
            geometryAttributes: {
                radius: size/100,
                segments: 20,
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
            opacity: 1,
            transparency: false
        } as ComponentEntity,
        isSelected: false,
        rlcParams: {} as RLCParams,
        value: 0
    }
    return lumped
}

export function getDefaultProbe(key: number, size: number){
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
                    radius: size/100,
                    segments: 20,
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
                opacity: 1,
                transparency: false
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: size/100,
                    segments: 20,
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
                opacity: 1,
                transparency: false
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: size/100,
                    segments: 20,
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
                opacity: 1,
                transparency: false
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: size/100,
                    segments: 20,
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
                opacity: 1,
                transparency: false
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: size/100,
                    segments: 20,
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
                opacity: 1,
                transparency: false
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: size/100,
                    segments: 20,
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
                opacity: 1,
                transparency: false
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: size/100,
                    segments: 20,
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
                opacity: 1,
                transparency: false
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: size/100,
                    segments: 20,
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
                opacity: 1,
                transparency: false
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: size/100,
                    segments: 20,
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
                opacity: 1,
                transparency: false
            } as ComponentEntity,
        ]
    }
    return probe
}