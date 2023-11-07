'use client'

import {
  OrbitControls,
  Environment,
  useGLTF,
  useAnimations,
} from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import { useEffect } from 'react'

export default function Page() {
  return (
    <Canvas camera={{ position: [25, 5, 15] }} shadows>
      <Environment preset="city" />
      <Model />
      <OrbitControls target={[15, 0, 25]} />
      <Perf position="bottom-right" />
      <axesHelper args={[50]} />
      <gridHelper args={[100]} />
    </Canvas>
  )
}

function Model() {
  const gltf = useGLTF('/models/dsg_left.glb') as any
  const { ref, actions, names } = useAnimations(gltf.animations) as any

  useEffect(() => {
    for (let key in actions) {
      actions[key].play()
    }
  }, [actions])

  return (
    <group ref={ref}>
      <primitive object={gltf.scene} children-0-castShadow />
    </group>
  )
}
