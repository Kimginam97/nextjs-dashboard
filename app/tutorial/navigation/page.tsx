'use client'
import * as THREE from 'three'
import React, { useEffect, useState } from 'react'
import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber'
import { Environment, Line, OrbitControls, useGLTF } from '@react-three/drei'
import { Crowd, CrowdAgent, NavMeshQuery, init } from 'recast-navigation'
import { threeToSoloNavMesh } from 'recast-navigation/three'
import { suspend } from 'suspend-react'
import { Mesh } from 'three'
import { Perf } from 'r3f-perf'
import './style.css'
import { GLTF } from 'three-stdlib'
import { Debug } from './debug'

const assetUrl = '/models/nav_test.glb'

const NavTestEnvirionment = () => {
  const gltf = useGLTF(assetUrl) as GLTF

  return <primitive object={gltf.scene} />
}

useGLTF.preload(assetUrl)

const agentMaterial = new THREE.MeshStandardMaterial({
  color: 'red',
})

const NavMesh = ({ children }: { children: any }) => {
  const [group, setGroup] = useState<THREE.Group | null>(null)
  const [navMesh, setNavMesh] = useState() as any

  const [navMeshQuery, setNavMeshQuery] = useState<NavMeshQuery | undefined>()
  const [crowd, setCrowd] = useState<Crowd | undefined>()
  const [agent, setAgent] = useState<CrowdAgent | undefined>()

  const [agentTarget, setAgentTarget] = useState<THREE.Vector3 | undefined>()
  const [agentPath, setAgentPath] = useState<THREE.Vector3Tuple[] | undefined>()

  useEffect(() => {
    if (!group) return

    const meshes: Mesh[] = []

    group.traverse((object: any) => {
      if (object instanceof Mesh) {
        meshes.push(object)
      }
    })

    const agentRadius = 0.1
    const cellSize = 0.05

    const { success, navMesh } = threeToSoloNavMesh(meshes, {
      cs: cellSize,
      ch: 0.2,
      walkableRadius: Math.ceil(agentRadius / cellSize),
    })

    if (!success) return

    const navMeshQuery = new NavMeshQuery({ navMesh })

    const crowd = new Crowd({ navMesh, maxAgents: 1, maxAgentRadius: 0.2 })

    const agent = crowd.addAgent(
      navMeshQuery.getClosestPoint({ x: -2.9, y: 2.366, z: 0.9 }),
      {
        radius: agentRadius,
        height: 0.5,
        maxAcceleration: 4.0,
        maxSpeed: 1.0,
        collisionQueryRange: 0.5,
        pathOptimizationRange: 0.0,
      }
    )

    setNavMesh(navMesh)
    setNavMeshQuery(navMeshQuery)
    setCrowd(crowd)
    setAgent(agent)

    return () => {
      navMesh.destroy()
      navMeshQuery.destroy()
      crowd.destroy()

      setNavMesh(undefined)
      setNavMeshQuery(undefined)
      setCrowd(undefined)
      setAgent(undefined)
    }
  }, [group])

  useEffect(() => {
    if (!crowd || !agent) return

    if (!agentTarget) {
      setAgentPath(undefined)
      return
    }

    const interval = setInterval(() => {
      const path = [agent.position(), ...agent.corners()]

      if (path.length) {
        setAgentPath(path.map((p) => [p.x, p.y + 0.1, p.z]))
      } else {
        setAgentPath(undefined)
      }
    }, 200)

    return () => {
      clearInterval(interval)
    }
  }, [crowd, agentTarget])

  useFrame((_, delta) => {
    if (!crowd) return

    crowd.update(delta)
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!navMesh || !navMeshQuery || !crowd || !agent) return

    e.stopPropagation()

    const target = navMeshQuery.getClosestPoint(e.point)

    if (e.button === 2) {
      agent.teleport(target)

      setAgentTarget(undefined)
    } else {
      agent.goto(target)

      setAgentTarget(new THREE.Vector3().copy(target as THREE.Vector3))
    }
  }

  return (
    <>
      {agentPath && (
        <group position={[0, 0.2, 0]}>
          <primitive object={agentPath} />
        </group>
      )}

      {agentTarget && (
        <group position={[0, 0, 0]}>
          <mesh position={agentTarget}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color="blue" />
          </mesh>
        </group>
      )}

      <group onPointerDown={onClick}>
        <group ref={setGroup}>{children}</group>

        <Debug navMesh={navMesh} crowd={crowd} agentMaterial={agentMaterial} />
      </group>

      {agentPath && <Line points={agentPath} color="blue" lineWidth={10} />}

      <OrbitControls />
    </>
  )
}

const Page: React.FC = () => {
  suspend(() => init(), [])

  return (
    <Canvas camera={{ position: [5, 5, 5] }}>
      <Environment preset="city" />
      <NavMesh>
        <NavTestEnvirionment />
      </NavMesh>

      <Perf position="bottom-right" />
      <axesHelper args={[50]} />
      <gridHelper args={[100]} />
    </Canvas>
  )
}

export default Page
