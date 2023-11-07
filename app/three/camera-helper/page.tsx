'use client'
import * as THREE from 'three'
import React, { useEffect, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Environment, OrbitControls, useGLTF } from '@react-three/drei'
import { useControls } from 'leva'
import { Perf } from 'r3f-perf'
import { GLTFLoader } from 'three-stdlib'

const CameraScene = ({ model }: { model: any }) => {
  return (
    <group>
      <primitive object={model.scene} />
    </group>
  )
}

interface CameraHelperSceneProps {
  camera: THREE.PerspectiveCamera
}

const CameraHelperScene: React.FC<CameraHelperSceneProps> = ({ camera }) => {
  const cameraHelperRef = useRef<THREE.CameraHelper | null>(null)

  if (!cameraHelperRef.current) {
    cameraHelperRef.current = new THREE.CameraHelper(camera)
  }

  useFrame(() => {
    cameraHelperRef.current?.update()
  })

  return (
    <group>
      <primitive object={cameraHelperRef.current} />
    </group>
  )
}

const Page: React.FC = () => {
  const sharedCamera = useRef<THREE.PerspectiveCamera | null>(null)
  const { fov, position, near, far, target } = useControls('Camera folder', {
    fov: { value: 75, min: 0, max: 150 },
    position: [25, 76, 15],
    near: { value: 70, min: 1, max: 1000 },
    far: { value: 80, min: 10, max: 1000 },
    target: [25, 0, 15],
  })

  if (!sharedCamera.current) {
    sharedCamera.current = new THREE.PerspectiveCamera(fov, 1, near, far)
    sharedCamera.current.position.set(position[0], position[1], position[2])
  }

  useEffect(() => {
    if (sharedCamera.current) {
      sharedCamera.current.fov = fov
      sharedCamera.current.near = near
      sharedCamera.current.far = far
      sharedCamera.current.position.set(position[0], position[1], position[2])
      sharedCamera.current.lookAt(target[0], target[1], target[2])
    }
  }, [fov, near, far, position, target])

  // const model = useGLTF('/models/dsg_left.glb') as any // 모델 로드
  // const model1 = useGLTF('/models/dsg_right.glb') as any // 모델 로드

  return (
    <div style={{ display: 'flex' }} className="h-screen">
      <div style={{ flex: 1 }} className=" bg-zinc-800">
        <h3 className="text-yellow-50">Main Camera View</h3>
        <Canvas camera={sharedCamera.current!}>
          <Environment preset="city" />
          {/* <CameraScene model={model} /> 모델을 전달 */}
          <Perf position="bottom-left" />
          <axesHelper args={[50]} />
          <gridHelper args={[100]} />
        </Canvas>
      </div>
      <div style={{ flex: 1 }} className=" bg-zinc-700">
        <h3 className="text-yellow-50">Camera Helper View</h3>
        <Canvas camera={{ position: [80, 80, 80] }}>
          <Environment preset="city" />
          {/* <CameraScene model={model1} /> 모델을 전달 */}
          <CameraHelperScene camera={sharedCamera.current!} />
          <OrbitControls />
          <Perf position="bottom-right" />
          <axesHelper args={[50]} />
          <gridHelper args={[100]} />
        </Canvas>
      </div>
    </div>
  )
}

export default Page
