import React, { useLayoutEffect, useMemo, useRef } from 'react'
import ReactDOM from 'react-dom'
import { Canvas, useFrame } from 'react-three-fiber'
import { Effects } from './Effects'
import * as THREE from 'three'
import './base.css'

// Inspired by:
// https://twitter.com/beesandbombs/status/1329796242298245124

const roundedSquareWave = (t, delta = 0.1, a = 1, f = 1 / 10) => {
  // Equation from https://dsp.stackexchange.com/a/56529
  // Visualized here https://www.desmos.com/calculator/uakymahh4u
  return ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta)
}

function Dots({ duration, ...props }) {
  const ref = useRef()
  const { positions, distances, transform, vec } = useMemo(() => {
    const positions = [...Array(10000)].map(() => new THREE.Vector3())
    const distances = [...Array(10000)]
    const transform = new THREE.Matrix4()
    const vec = new THREE.Vector3() // reusable
    return { positions, distances, transform, vec }
  }, [])
  useLayoutEffect(() => {
    const randomAmount = 0.3
    const origin = new THREE.Vector3(0, 0, 0)
    const right = new THREE.Vector3(1, 0, 0)
    for (let i = 0; i < 10000; ++i) {
      positions[i].set(Math.floor(i / 100) - 50 + (i % 2) * 0.5, (i % 100) - 50, 0)
      positions[i].x += (Math.random() - 0.5) * randomAmount
      positions[i].y += (Math.random() - 0.5) * randomAmount
      distances[i] = positions[i].distanceTo(origin) + Math.cos(positions[i].angleTo(right) * 8) * 0.5
      transform.setPosition(positions[i])
      ref.current.setMatrixAt(i, transform)
    }
  }, [])
  useFrame(({ clock }) => {
    let dist, t, position, wave
    for (let i = 0; i < 10000; ++i) {
      position = positions[i]
      dist = distances[i]
      t = clock.elapsedTime - dist / 25 // wave is offset away from center
      wave = roundedSquareWave(t, 0.15 + (0.2 * dist) / 72, 0.4, 1 / duration)
      vec.copy(position).multiplyScalar(wave + 1.3)
      transform.setPosition(vec)
      ref.current.setMatrixAt(i, transform)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh args={[null, null, 10000]} ref={ref} {...props}>
      <circleBufferGeometry args={[0.15, 8]} />
      <meshBasicMaterial color={'white'} />
    </instancedMesh>
  )
}

function App() {
  return (
    <Canvas orthographic colorManagement={false} camera={{ position: [0, 0, 100], zoom: 20 }}>
      <color attach="background" args={['black']} />
      <Dots duration={3.8} />
      <Effects />
    </Canvas>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
