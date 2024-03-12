import React, {MutableRefObject, ReactNode, useEffect, useRef, useState} from 'react';
import {BufferGeometry, InstancedBufferAttribute, InstancedMesh, Material, Object3D, Vector3} from "three";
import {MeshSurfaceSampler} from "three/examples/jsm/math/MeshSurfaceSampler";
import * as THREE from "three";

export interface SampledSurfaceProps {
    instance: InstancedMesh<BufferGeometry, Material | Material[]>[]
    color: THREE.Color,
    id: number | undefined,
    children: ReactNode
}

const SampledSurface: React.FC<SampledSurfaceProps> = (
    {children, instance, color, id}
) => {
    const objects = useRef<any>();
    const [pointsGenerated, setPointsGenerated] = useState(false)

    useEffect(() => {
        instance.forEach((inst, index) => {
            if (objects && objects.current && objects.current.children[index] && inst && !pointsGenerated) {
                if (!objects.current.children[index].instanceColor) {
                    const sampler = new MeshSurfaceSampler(
                        objects.current.children[index]
                    ).build();
                    const _position = new Vector3();
                    const _normal = new Vector3();
                    const dummy = new Object3D();

                    for (let i = 0; i < 100000; i++) {
                        sampler.sample(_position, _normal);
                        _normal.add(_position);

                        dummy.position.copy(_position);
                        dummy.lookAt(_normal);
                        dummy.updateMatrix();

                        inst.setMatrixAt(i, dummy.matrix);
                        inst.setColorAt(i, new THREE.Color("black"));
                    }
                    inst.instanceMatrix.needsUpdate = true;
                    (inst.instanceColor as InstancedBufferAttribute).needsUpdate = true;

                    objects.current.add(inst);
                }
            }
            if (id && inst) {
                objects.current.remove(inst);
                inst.setColorAt(id, color);
                (inst.instanceColor as InstancedBufferAttribute).needsUpdate = true;
                objects.current.add(inst);
            }
        })
        setPointsGenerated(true)
    }, [children, id, pointsGenerated]);

    return (
        <group ref={objects}>
            {children}
        </group>
    );
}

export default SampledSurface