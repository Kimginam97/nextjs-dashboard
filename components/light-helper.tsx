import React, { useRef } from 'react'
import * as THREE from 'three'
import { useControls } from 'leva'
import { useFrame } from '@react-three/fiber'
import { useHelper } from '@react-three/drei'

const LightHelper = () => {
  const ambientLightRef = useRef<THREE.AmbientLight>() as any
  const directionalLightRef = useRef<THREE.DirectionalLight>() as any
  const pointLightRef = useRef<THREE.PointLight>() as any
  const spotLightRef = useRef<THREE.SpotLight>() as any

  const {
    ambient,
    ambientPosition,
    ambientColor,
    ambientIntensity,
    directional,
    directionalPosition,
    directionalColor,
    directionalIntensity,
    directionalTarget,
    point,
    pointPosition,
    pointColor,
    pointIntensity,
    spot,
    spotPosition,
    spotColor,
    spotIntensity,
  } = useControls('Light folder', {
    ambient: { value: true },
    ambientPosition: [0, 0, 0],
    ambientColor: { value: 'white' },
    ambientIntensity: { value: 1 },
    directional: { value: false },
    directionalPosition: [0, 0, 0],
    directionalColor: { value: 'white' },
    directionalIntensity: { value: 1 },
    directionalTarget: [0, 0, 0],
    point: { value: false },
    pointPosition: [0, 0, 0],
    pointColor: { value: 'white' },
    pointIntensity: { value: 1 },
    spot: { value: false },
    spotPosition: [0, 0, 0],
    spotColor: { value: 'white' },
    spotIntensity: { value: 1 },
  })

  useFrame(({ gl, scene, camera }) => gl.render(scene, camera), 1)

  useHelper(ambient && ambientLightRef, THREE.PointLightHelper)
  useHelper(directional && directionalLightRef, THREE.DirectionalLightHelper)
  useHelper(point && pointLightRef, THREE.PointLightHelper)
  useHelper(spot && spotLightRef, THREE.SpotLightHelper)

  return (
    <>
      {ambient && (
        <ambientLight
          ref={ambientLightRef}
          position={ambientPosition}
          color={ambientColor}
          intensity={ambientIntensity}
        />
      )}
      {directional && (
        <directionalLight
          ref={directionalLightRef}
          position={directionalPosition}
          color={directionalColor}
          intensity={directionalIntensity}
          target-position={directionalTarget}
        />
      )}
      {point && (
        <pointLight
          ref={pointLightRef}
          position={pointPosition}
          color={pointColor}
          intensity={pointIntensity}
        />
      )}
      {spot && (
        <spotLight
          ref={spotLightRef}
          position={spotPosition}
          color={spotColor}
          intensity={spotIntensity}
        />
      )}
    </>
  )
}

export default LightHelper
