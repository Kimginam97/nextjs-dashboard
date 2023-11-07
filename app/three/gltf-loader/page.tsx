'use client'

import { OrbitControls, Environment, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Perf } from 'r3f-perf'

export default function Page() {
  const gltf = useGLTF('/models/dungeon.gltf')

  return (
    <Canvas camera={{ position: [13, 50, 30] }} shadows>
      <Environment preset="city" />
      <primitive object={gltf.scene} children-0-castShadow />
      <OrbitControls target={[0, 0, 0]} />
      <Perf position="bottom-right" />
      <axesHelper args={[50]} />
      <gridHelper args={[100]} />
    </Canvas>
  )
}

useGLTF.preload('/models/dungeon.gltf')
