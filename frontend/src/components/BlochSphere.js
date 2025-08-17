/**
 * BlochSphere Component
 * 3D visualization of quantum states on the Bloch sphere using Three.js
 */

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

// Individual Bloch Sphere component
function BlochSphereGeometry({ blochCoordinates, qubitIndex, isAnimated = false }) {
  const sphereRef = useRef();
  const vectorRef = useRef();
  const { x, y, z } = blochCoordinates;

  // Animation for the state vector
  useFrame((state) => {
    if (isAnimated && vectorRef.current) {
      const time = state.clock.getElapsedTime();
      vectorRef.current.rotation.y = time * 0.5;
    }
  });

  // Create the state vector line
  const vectorPoints = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(x, z, y) // Note: Three.js uses Y as up, quantum uses Z as up
  ];

  return (
    <group>
      {/* Main sphere (wireframe) */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial 
          color="#4A90E2" 
          wireframe 
          transparent 
          opacity={0.3} 
        />
      </mesh>

      {/* Coordinate axes */}
      {/* X-axis (red) */}
      <Line
        points={[[-1.2, 0, 0], [1.2, 0, 0]]}
        color="red"
        lineWidth={2}
      />
      {/* Y-axis (green) - maps to quantum Z */}
      <Line
        points={[[0, -1.2, 0], [0, 1.2, 0]]}
        color="green"
        lineWidth={2}
      />
      {/* Z-axis (blue) - maps to quantum Y */}
      <Line
        points={[[0, 0, -1.2], [0, 0, 1.2]]}
        color="blue"
        lineWidth={2}
      />

      {/* State vector */}
      <group ref={vectorRef}>
        <Line
          points={vectorPoints}
          color="#FF6B6B"
          lineWidth={4}
        />
        {/* State vector endpoint */}
        <mesh position={[x, z, y]}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="#FF6B6B" />
        </mesh>
      </group>

      {/* Axis labels */}
      <Text
        position={[1.4, 0, 0]}
        fontSize={0.1}
        color="red"
        anchorX="center"
        anchorY="middle"
      >
        |+⟩ₓ
      </Text>
      <Text
        position={[-1.4, 0, 0]}
        fontSize={0.1}
        color="red"
        anchorX="center"
        anchorY="middle"
      >
        |-⟩ₓ
      </Text>
      <Text
        position={[0, 1.4, 0]}
        fontSize={0.1}
        color="green"
        anchorX="center"
        anchorY="middle"
      >
        |0⟩
      </Text>
      <Text
        position={[0, -1.4, 0]}
        fontSize={0.1}
        color="green"
        anchorX="center"
        anchorY="middle"
      >
        |1⟩
      </Text>
      <Text
        position={[0, 0, 1.4]}
        fontSize={0.1}
        color="blue"
        anchorX="center"
        anchorY="middle"
      >
        |+⟩ᵧ
      </Text>
      <Text
        position={[0, 0, -1.4]}
        fontSize={0.1}
        color="blue"
        anchorX="center"
        anchorY="middle"
      >
        |-⟩ᵧ
      </Text>

      {/* Qubit label */}
      <Text
        position={[0, -2, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Qubit {qubitIndex}
      </Text>
    </group>
  );
}

// Main BlochSphere component that can display multiple qubits
const BlochSphere = ({ quantumStates, isAnimated = false }) => {
  if (!quantumStates || !quantumStates.qubits) {
    return (
      <div className="bloch-sphere-container" style={{ height: '400px', background: '#1a1a1a' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          color: 'white'
        }}>
          No quantum states to display
        </div>
      </div>
    );
  }

  const numQubits = quantumStates.qubits.length;
  const sphereSpacing = 3;

  return (
    <div className="bloch-sphere-container" style={{ height: '500px', background: '#1a1a1a' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Render each qubit's Bloch sphere */}
        {quantumStates.qubits.map((qubit, index) => (
          <group 
            key={qubit.index} 
            position={[
              (index - (numQubits - 1) / 2) * sphereSpacing, 
              0, 
              0
            ]}
          >
            <BlochSphereGeometry
              blochCoordinates={qubit.bloch_coordinates}
              qubitIndex={qubit.index}
              isAnimated={isAnimated}
            />
          </group>
        ))}
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
      
      {/* Information panel */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        <div><strong>Quantum States Visualization</strong></div>
        <div>Number of Qubits: {numQubits}</div>
        <div style={{ marginTop: '10px' }}>
          {quantumStates.qubits.map((qubit, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              <strong>Qubit {qubit.index}:</strong>
              <div>x: {qubit.bloch_coordinates.x.toFixed(3)}</div>
              <div>y: {qubit.bloch_coordinates.y.toFixed(3)}</div>
              <div>z: {qubit.bloch_coordinates.z.toFixed(3)}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>
          Use mouse to rotate, zoom, and pan
        </div>
      </div>
    </div>
  );
};

export default BlochSphere;