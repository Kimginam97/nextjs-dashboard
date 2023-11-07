'use client'

import * as THREE from 'three'
import { useRef } from 'react'
import {
  PerspectiveCamera,
  OrthographicCamera,
  useHelper,
  OrbitControls,
} from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'

const CameraHelper = () => {
  const { fov, position, near, far, lookAtPosition } = useControls(
    'Camera folder',
    {
      fov: { value: 75, min: 0, max: 150 },
      position: [0, 0, 10],
      near: { value: 1, min: 1, max: 100 },
      far: { value: 100, min: 100, max: 1000 },
      lookAtPosition: [0, 0, 0], // Add a control for the lookAt position
    }
  )

  const cameraRef = useRef() as any

  useFrame(({ gl, scene, camera }) => {
    gl.render(scene, camera), 1
  })

  useHelper(cameraRef, THREE.CameraHelper)

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        fov={fov}
        position={position}
        aspect={window.innerWidth / window.innerHeight}
        near={near}
        far={far}
      />
      <OrbitControls args={[cameraRef.current]} target={lookAtPosition} />
    </>
  )
}

export default CameraHelper
