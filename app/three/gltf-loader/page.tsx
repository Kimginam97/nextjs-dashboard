'use client'

import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Perf } from 'r3f-perf'

export default function Page() {
  const gltf = useGLTF('/models/dsg_a.gltf')

  return (
    <Canvas camera={{ position: [13, 10, 5] }} shadows>
      <Environment preset="city" />
      <primitive object={gltf.scene} children-0-castShadow />
      <OrbitControls target={[13, 0, 0]} />
      <Perf position="bottom-right" />
      <axesHelper args={[50]} />
      <gridHelper args={[100]} />
    </Canvas>
  )
}
