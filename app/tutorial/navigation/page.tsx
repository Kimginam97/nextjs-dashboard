'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, useGLTF } from '@react-three/drei'
import { init } from 'recast-navigation'
import { NavMeshHelper, threeToSoloNavMesh } from 'recast-navigation/three'
import { suspend } from 'suspend-react'
import { Mesh } from 'three'
import './style.css'

const NavMesh = ({ children }: { children: any }) => {
  const group = useRef<THREE.Group>() as any
  const [navMesh, setNavMesh] = useState() as any

  const navMeshHelper = useMemo(() => {
    if (!navMesh) return null

    return new NavMeshHelper({ navMesh })
  }, [navMesh])

  useEffect(() => {
    const meshes: Mesh[] = []

    group.current.traverse((object: any) => {
      if (object instanceof Mesh) {
        meshes.push(object)
      }
    })

    const { success, navMesh } = threeToSoloNavMesh(meshes)

    if (!success) return

    setNavMesh(navMesh)

    return () => {
      setNavMesh(undefined)
      navMesh.destroy()
    }
  }, [])

  return (
    <group>
      <group ref={group}>{children}</group>

      {navMeshHelper && <primitive object={navMeshHelper} />}
    </group>
  )
}

function Model() {
  const { scene } = useGLTF('/models/test.glb') // 모델 로드

  return <primitive object={scene} />
}

const Page: React.FC = () => {
  suspend(() => init(), [])

  return (
    <Canvas camera={{ position: [80, 80, 80] }}>
      <Environment preset="city" />
      <NavMesh>
        <Model />
      </NavMesh>

      <OrbitControls />
    </Canvas>
  )
}

export default Page
