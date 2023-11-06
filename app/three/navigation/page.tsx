'use client'
import * as THREE from 'three'
import React, { useEffect, useState } from 'react'
import { Canvas, ThreeEvent, useFrame } from '@react-three/fiber'
import { Environment, Line, OrbitControls, useGLTF } from '@react-three/drei'
import {
  Crowd,
  CrowdAgent,
  NavMeshQuery,
  OffMeshConnectionParams,
  init,
} from 'recast-navigation'
import { threeToSoloNavMesh } from 'recast-navigation/three'
import { suspend } from 'suspend-react'
import { Mesh } from 'three'
import { Perf } from 'r3f-perf'
import { GLTF } from 'three-stdlib'
import { Debug } from './debug'
import './style.css'

const assetUrl = '/models/nav_test.glb'
// const assetUrl = '/models/dungeon.gltf'

const NavTestEnvirionment = () => {
  const gltf = useGLTF(assetUrl) as GLTF

  return <primitive object={gltf.scene} />
}

useGLTF.preload(assetUrl)

const agentMaterial = new THREE.MeshStandardMaterial({
  color: 'red',
})

const offMeshConnectionDefaults = {
  radius: 0.3,
  area: 0,
  flags: 1,
  bidirectional: false,
}

const offMeshConnections: OffMeshConnectionParams[] = [
  {
    ...offMeshConnectionDefaults,
    startPosition: {
      x: 4.501361846923828,
      y: 0.36645400524139404,
      z: 2.227370500564575,
    },
    endPosition: {
      x: 6.453944206237793,
      y: 0.4996081590652466,
      z: 1.6987327337265015,
    },
    bidirectional: true,
  },
  {
    ...offMeshConnectionDefaults,
    startPosition: {
      x: 0.2870096266269684,
      y: 3.9292590618133545,
      z: 2.564833402633667,
    },
    endPosition: {
      x: 1.4627689123153687,
      y: 2.778116226196289,
      z: 3.5469906330108643,
    },
  },
  {
    ...offMeshConnectionDefaults,
    startPosition: {
      x: 3.5109636783599854,
      y: 3.1664540767669678,
      z: 2.893442392349243,
    },
    endPosition: {
      x: 3.669801950454712,
      y: 0.36645400524139404,
      z: 2.135521173477173,
    },
  },
]

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
      offMeshConnections,
    })

    if (!success) return

    const navMeshQuery = new NavMeshQuery({ navMesh })

    const crowd = new Crowd({ navMesh, maxAgents: 1, maxAgentRadius: 0.2 })

    const agent = crowd.addAgent(
      navMeshQuery.getClosestPoint({ x: -2.9, y: 2.366, z: 0.9 }),
      {
        radius: agentRadius,
        height: 0.5,
        maxAcceleration: 2.0,
        maxSpeed: 2.0,
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

        <Debug
          navMesh={navMesh}
          crowd={crowd}
          agentMaterial={agentMaterial}
          offMeshConnections={offMeshConnections}
        />
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
