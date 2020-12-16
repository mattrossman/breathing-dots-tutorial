import React, { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from 'react-three-fiber'
import { Effects } from './Effects'
import { useSpring } from '@react-spring/three'
import { ResizeObserver } from '@juggle/resize-observer'
import * as THREE from 'three'

// INTERACTIVE VERSION

const roundedSquareWave = (t, delta = 0.1, a = 1, f = 1 / 10) => {
  // Equation from https://dsp.stackexchange.com/a/56529
  // Visualized here https://www.desmos.com/calculator/uakymahh4u
  return ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta)
}

function Dots({ ticksSpring, clickSpring, duration, ...props }) {
  const ref = useRef() // Reference to our InstancedMesh
  const { vec, right, transform, vec3Mouse, focus, positions } = useMemo(() => {
    // Variables for intermediary calculations
    const vec = new THREE.Vector3()
    const transform = new THREE.Matrix4()

    // Vector pointing to the right (for angle calculations)
    const right = new THREE.Vector3(1, 0, 0)

    // True cursor position in 3D space
    const vec3Mouse = new THREE.Vector3()

    // Where the dots are clustered around
    const focus = new THREE.Vector3()

    // Precompute randomized initial positions (array of Vector3)
    const positions = [...Array(10000)].map((_, i) => {
      const position = new THREE.Vector3()

      // Place in a grid
      position.x = (i % 100) - 50
      position.y = Math.floor(i / 100) - 50

      // Offset every other column (hexagonal pattern)
      position.y += (i % 2) * 0.5

      // Add some noise
      position.x += Math.random() * 0.3
      position.y += Math.random() * 0.3
      return position
    })
    return { vec, right, transform, vec3Mouse, focus, positions }
  }, [])
  useFrame(({ mouse, viewport }) => {
    // Convert mouse screen coords to 3D scene coords
    vec3Mouse.x = (mouse.x * viewport.width) / 2
    vec3Mouse.y = (mouse.y * viewport.height) / 2

    for (let i = 0; i < 10000; ++i) {
      // Drift focus to center as click is released
      focus.copy(vec3Mouse).multiplyScalar(clickSpring.get())

      // Vec holds the dot position relative to the focus point
      vec.copy(positions[i]).sub(focus)

      // Same distance calculation as original demo
      const dist = vec.length() + Math.cos(vec.angleTo(right) * 8) * 0.5

      // This adjusts the wave input to set a suitable phase and frequency
      const t = ticksSpring.get() / 2 + 1 / 2 - dist / 100
      const wave = roundedSquareWave(t, 0.15 + (0.2 * dist) / 72, 0.4, 1)

      // Scale dot position relative to the focus point
      vec.multiplyScalar(wave + 1.3).add(focus)

      // Set the instance's transformation matrix
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

export default function App() {
  const [ticks, setTicks] = useState(0)
  const { ticksSpring, clickSpring } = useSpring({
    ticksSpring: ticks, // Springy tick value (each click / release is a tick)
    clickSpring: ticks % 2 === 1 ? 1 : 0, // Springy click factor (1 means clicked, 0 means released)
    config: { tension: 20, friction: 20, clamp: true }
  })
  const bind = {
    onPointerDown: (e) => {
      // Capture the pointer so it's still tracked outside the window
      e.target.setPointerCapture(e.pointerId)
      setTicks(ticks + 1)
    },
    onPointerUp: () => {
      // Prevent misfires
      if (ticks % 2 === 1) {
        // Only finish the animation if held down for long enough
        if (clickSpring.get() > 0.5) setTicks(ticks + 1)
        // Otherwise undo the contraction (this way you can't speed up the animation by spam clicking)
        else setTicks(ticks - 1)
      }
    }
  }
  return (
    <Canvas
      orthographic
      colorManagement={false}
      camera={{ position: [0, 0, 100], zoom: 20 }}
      resize={{ polyfill: ResizeObserver }}  // Allows @react-spring/three to work in Safari
      {...bind}
    >
      <color attach="background" args={['black']} />
      <Dots ticksSpring={ticksSpring} clickSpring={clickSpring} duration={3.8} />
      <Effects />
    </Canvas>
  )
}
