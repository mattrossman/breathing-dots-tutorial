import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from 'react-three-fiber'
import { Effects } from './Effects'
import { proxy, useProxy } from 'valtio'
import { useSpring } from '@react-spring/three'
import * as THREE from 'three'

// INTERACTIVE VERSION

const state = proxy({
  ticks: 0,
  clickSpring: 0
})

const roundedSquareWave = (t, delta = 0.1, a = 1, f = 1 / 10) => {
  // Equation from https://dsp.stackexchange.com/a/56529
  // Visualized here https://www.desmos.com/calculator/uakymahh4u
  return ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta)
}
// Actual cursor coordinates
const vec3Mouse = new THREE.Vector3()

// Center of the screen (0,0,0)
const center = new THREE.Vector3()

// Where the dots are clustered around
const focus = new THREE.Vector3()

// Vector pointing to the right (for angle calculations)
const right = new THREE.Vector3(1, 0, 0)

function Dots({ duration, ...props }) {
  const ref = useRef()
  const snap = useProxy(state)
  const { tSpring, clickSpring } = useSpring({
    tSpring: snap.ticks,
    clickSpring: snap.ticks % 2 === 1 ? 1 : 0,
    config: { tension: 20, friction: 20, clamp: true }
  })
  const { positions, transform, vec } = useMemo(() => {
    const positions = [...Array(10000)].map(() => new THREE.Vector3())
    const transform = new THREE.Matrix4()
    const vec = new THREE.Vector3() // reusable
    return { positions, transform, vec }
  }, [])
  useLayoutEffect(() => {
    const randomAmount = 0.3
    for (let i = 0; i < 10000; ++i) {
      positions[i].set(Math.floor(i / 100) - 50 + (i % 2) * 0.5, (i % 100) - 50, 0)
      positions[i].x += (Math.random() - 0.5) * randomAmount
      positions[i].y += (Math.random() - 0.5) * randomAmount
      transform.setPosition(positions[i])
      ref.current.setMatrixAt(i, transform)
    }
  }, [])
  useFrame(() => {
    let dist, t, position, wave
    state.clickSpring = clickSpring.get()
    for (let i = 0; i < 10000; ++i) {
      position = positions[i]
      focus.lerpVectors(center, vec3Mouse, state.clickSpring)
      vec.copy(position).sub(focus)
      dist = vec.length() + Math.cos(vec.angleTo(right) * 8) * 0.5
      t = tSpring.get() / 2 + 1 / 2 - dist / 100
      wave = roundedSquareWave(t, 0.15 + (0.2 * dist) / 72, 0.4, 1)
      vec.multiplyScalar(wave + 1.3).add(focus)
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

function Cursor() {
  useFrame(({ mouse, viewport }) => {
    vec3Mouse.x = (mouse.x * viewport.width) / 2
    vec3Mouse.y = (mouse.y * viewport.height) / 2
  })
  return null
}

export default function App() {
  const bind = {
    onPointerDown: (e) => {
      e.target.setPointerCapture(e.pointerId)
      state.ticks++
    },
    onPointerUp: (e) => {
      if (state.ticks % 2 === 1) {
        e.target.setPointerCapture(e.pointerId)
        if (state.clickSpring > 0.5) state.ticks++
        else state.ticks--
      }
    }
  }
  return (
    <Canvas orthographic colorManagement={false} camera={{ position: [0, 0, 100], zoom: 20 }} {...bind}>
      <color attach="background" args={['black']} />
      <Dots duration={3.8} />
      <Effects />
      <Cursor />
    </Canvas>
  )
}
