import { useFrame } from '@react-three/fiber'
import {
  Crowd,
  NavMesh,
  OffMeshConnectionParams,
  TileCache,
} from '@recast-navigation/core'
import {
  CrowdHelper,
  NavMeshHelper,
  TileCacheHelper,
} from '@recast-navigation/three'

import React, { useEffect, useMemo } from 'react'
import { Material } from 'three'
import { OffMeshConnectionsHelper } from './off-mesh-connections-helper'

/**
 * autoUpdate: 자동 업데이트 여부를 설정합니다.
 * navMesh: 네비게이션 메시 객체.
 * navMeshMaterial: 네비게이션 메시를 시각화하는 데 사용할 재질.
 * tileCache: 타일 캐시 객체.
 * obstacleMaterial: 장애물을 시각화하는 데 사용할 재질.
 * crowd: 크라우드 객체.
 * agentMaterial: 크라우드 에이전트를 시각화하는 데 사용할 재질.
 *
 * navMeshHelper, tileCacheHelper, crowdHelper
 * 네비게이션 메시, 타일 캐시, 크라우드를 시각적으로 나타내기 위한 도우미 클래스
 */
export type DebugProps = {
  autoUpdate?: boolean
  navMesh?: NavMesh
  navMeshMaterial?: Material
  tileCache?: TileCache
  obstacleMaterial?: Material
  crowd?: Crowd
  agentMaterial?: Material
  offMeshConnections?: OffMeshConnectionParams[]
}

export const Debug = ({
  autoUpdate,
  navMesh,
  navMeshMaterial,
  tileCache,
  obstacleMaterial,
  crowd,
  agentMaterial,
  offMeshConnections,
}: DebugProps) => {
  const navMeshHelper = useMemo(() => {
    if (!navMesh) return null

    return new NavMeshHelper({
      navMesh,
      navMeshMaterial,
    })
  }, [navMesh, navMeshMaterial])

  const tileCacheHelper = useMemo(() => {
    if (!tileCache) return null

    return new TileCacheHelper({
      tileCache,
      obstacleMaterial,
    })
  }, [tileCache, obstacleMaterial])

  const crowdHelper = useMemo(() => {
    if (!crowd) return null

    return new CrowdHelper({
      crowd,
      agentMaterial,
    })
  }, [crowd, agentMaterial])

  const offMeshConnectionsHelper = useMemo(() => {
    if (!offMeshConnections) return null

    return new OffMeshConnectionsHelper({
      offMeshConnections,
    })
  }, [offMeshConnections])

  useFrame(() => {
    if (crowdHelper) {
      crowdHelper.update()
    }
  })

  useEffect(() => {
    if (!navMeshHelper || !autoUpdate) return

    const interval = setInterval(() => {
      navMeshHelper.update()
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [navMeshHelper])

  useEffect(() => {
    if (!tileCacheHelper || !autoUpdate) return

    const interval = setInterval(() => {
      tileCacheHelper.update()
    }, 100)

    return () => {
      clearInterval(interval)
    }
  }, [tileCacheHelper])

  return (
    <>
      {navMeshHelper && <primitive object={navMeshHelper} />}

      <group position={[0, 0.01, 0]}>
        {tileCacheHelper && <primitive object={tileCacheHelper} />}
      </group>

      {crowdHelper && <primitive object={crowdHelper} />}

      {offMeshConnectionsHelper && (
        <primitive object={offMeshConnectionsHelper} />
      )}
    </>
  )
}
