/**
 * CircuitBuilder Component
 * Interactive quantum circuit builder interface
 */

import React, { useState, useEffect } from 'react';
import './CircuitBuilder.css';

const CircuitBuilder = ({ onCircuitChange, initialCircuit = null }) => {
  const [numQubits, setNumQubits] = useState(2);
  const [gates, setGates] = useState([]);
  const [selectedGate, setSelectedGate] = useState('h');
  const [selectedQubit, setSelectedQubit] = useState(0);
  const [selectedControl, setSelectedControl] = useState(0);
  const [selectedTarget, setSelectedTarget] = useState(1);
  const [rotationAngle, setRotationAngle] = useState(Math.PI / 2);

  // Available gates
  const availableGates = {
    'h': { name: 'Hadamard', symbol: 'H', type: 'single' },
    'x': { name: 'Pauli-X', symbol: 'X', type: 'single' },
    'y': { name: 'Pauli-Y', symbol: 'Y', type: 'single' },
    'z': { name: 'Pauli-Z', symbol: 'Z', type: 'single' },
    'rx': { name: 'Rotation-X', symbol: 'Rx', type: 'single', hasAngle: true },
    'ry': { name: 'Rotation-Y', symbol: 'Ry', type: 'single', hasAngle: true },
    'rz': { name: 'Rotation-Z', symbol: 'Rz', type: 'single', hasAngle: true },
    'cx': { name: 'CNOT', symbol: '⊕', type: 'two' },
    'cz': { name: 'Controlled-Z', symbol: 'CZ', type: 'two' }
  };

  // Initialize with initial circuit if provided
  useEffect(() => {
    if (initialCircuit) {
      setNumQubits(initialCircuit.num_qubits);
      setGates(initialCircuit.gates || []);
    }
  }, [initialCircuit]);

  // Notify parent component when circuit changes
  useEffect(() => {
    const circuit = {
      num_qubits: numQubits,
      gates: gates
    };
    onCircuitChange(circuit);
  }, [numQubits, gates, onCircuitChange]);

  const addGate = () => {
    const gateInfo = availableGates[selectedGate];
    let newGate;

    if (gateInfo.type === 'single') {
      newGate = {
        type: selectedGate,
        qubit: selectedQubit
      };
      
      if (gateInfo.hasAngle) {
        newGate.angle = rotationAngle;
      }
    } else if (gateInfo.type === 'two') {
      if (selectedControl === selectedTarget) {
        alert('Control and target qubits must be different!');
        return;
      }
      
      newGate = {
        type: selectedGate,
        control: selectedControl,
        target: selectedTarget
      };
    }

    setGates([...gates, newGate]);
  };

  const removeGate = (index) => {
    const newGates = gates.filter((_, i) => i !== index);
    setGates(newGates);
  };

  const clearCircuit = () => {
    setGates([]);
  };

  const loadExampleCircuit = (example) => {
    const examples = {
      'bell': {
        num_qubits: 2,
        gates: [
          { type: 'h', qubit: 0 },
          { type: 'cx', control: 0, target: 1 }
        ]
      },
      'ghz': {
        num_qubits: 3,
        gates: [
          { type: 'h', qubit: 0 },
          { type: 'cx', control: 0, target: 1 },
          { type: 'cx', control: 1, target: 2 }
        ]
      },
      'superposition': {
        num_qubits: 1,
        gates: [
          { type: 'h', qubit: 0 }
        ]
      }
    };

    if (examples[example]) {
      setNumQubits(examples[example].num_qubits);
      setGates(examples[example].gates);
    }
  };

  const renderCircuitDiagram = () => {
    const qubitLines = Array.from({ length: numQubits }, (_, i) => i);
    const maxGates = Math.max(gates.length, 1);
    
    return (
      <div className="circuit-diagram">
        <div className="circuit-grid">
          {qubitLines.map(qubitIndex => (
            <div key={qubitIndex} className="qubit-line">
              <div className="qubit-label">|q{qubitIndex}⟩</div>
              <div className="wire">
                {Array.from({ length: maxGates + 1 }, (_, gateIndex) => {
                  const gate = gates[gateIndex];
                  return (
                    <div key={gateIndex} className="gate-position">
                      {gate && renderGateAtPosition(gate, qubitIndex, gateIndex)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGateAtPosition = (gate, qubitIndex, gateIndex) => {
    const gateInfo = availableGates[gate.type];
    
    if (gateInfo.type === 'single' && gate.qubit === qubitIndex) {
      return (
        <div 
          className="gate single-gate"
          onClick={() => removeGate(gateIndex)}
          title={`${gateInfo.name} on qubit ${gate.qubit}`}
        >
          {gateInfo.symbol}
          {gate.angle && <div className="angle">({(gate.angle / Math.PI).toFixed(2)}π)</div>}
        </div>
      );
    } else if (gateInfo.type === 'two') {
      if (gate.control === qubitIndex) {
        return (
          <div 
            className="gate control-gate"
            onClick={() => removeGate(gateIndex)}
            title={`Control qubit for ${gateInfo.name}`}
          >
            ●
          </div>
        );
      } else if (gate.target === qubitIndex) {
        return (
          <div 
            className="gate target-gate"
            onClick={() => removeGate(gateIndex)}
            title={`Target qubit for ${gateInfo.name}`}
          >
            {gateInfo.symbol}
          </div>
        );
      } else {
        // Check if this qubit is between control and target for connection line
        const minQubit = Math.min(gate.control, gate.target);
        const maxQubit = Math.max(gate.control, gate.target);
        if (qubitIndex > minQubit && qubitIndex < maxQubit) {
          return <div className="connection-line">|</div>;
        }
      }
    }
    
    return null;
  };

  return (
    <div className="circuit-builder">
      <div className="circuit-controls">
        <div className="control-group">
          <label>Number of Qubits:</label>
          <select 
            value={numQubits} 
            onChange={(e) => setNumQubits(parseInt(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Gate Type:</label>
          <select 
            value={selectedGate} 
            onChange={(e) => setSelectedGate(e.target.value)}
          >
            {Object.entries(availableGates).map(([key, gate]) => (
              <option key={key} value={key}>{gate.name}</option>
            ))}
          </select>
        </div>

        {availableGates[selectedGate].type === 'single' && (
          <div className="control-group">
            <label>Target Qubit:</label>
            <select 
              value={selectedQubit} 
              onChange={(e) => setSelectedQubit(parseInt(e.target.value))}
            >
              {Array.from({ length: numQubits }, (_, i) => (
                <option key={i} value={i}>Qubit {i}</option>
              ))}
            </select>
          </div>
        )}

        {availableGates[selectedGate].type === 'two' && (
          <>
            <div className="control-group">
              <label>Control Qubit:</label>
              <select 
                value={selectedControl} 
                onChange={(e) => setSelectedControl(parseInt(e.target.value))}
              >
                {Array.from({ length: numQubits }, (_, i) => (
                  <option key={i} value={i}>Qubit {i}</option>
                ))}
              </select>
            </div>
            <div className="control-group">
              <label>Target Qubit:</label>
              <select 
                value={selectedTarget} 
                onChange={(e) => setSelectedTarget(parseInt(e.target.value))}
              >
                {Array.from({ length: numQubits }, (_, i) => (
                  <option key={i} value={i}>Qubit {i}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {availableGates[selectedGate].hasAngle && (
          <div className="control-group">
            <label>Rotation Angle:</label>
            <input 
              type="range"
              min="0"
              max={2 * Math.PI}
              step="0.1"
              value={rotationAngle}
              onChange={(e) => setRotationAngle(parseFloat(e.target.value))}
            />
            <span>{(rotationAngle / Math.PI).toFixed(2)}π</span>
          </div>
        )}

        <div className="button-group">
          <button onClick={addGate} className="add-gate-btn">
            Add Gate
          </button>
          <button onClick={clearCircuit} className="clear-btn">
            Clear Circuit
          </button>
        </div>

        <div className="example-circuits">
          <label>Load Example:</label>
          <div className="example-buttons">
            <button onClick={() => loadExampleCircuit('bell')}>Bell State</button>
            <button onClick={() => loadExampleCircuit('ghz')}>GHZ State</button>
            <button onClick={() => loadExampleCircuit('superposition')}>Superposition</button>
          </div>
        </div>
      </div>

      <div className="circuit-display">
        <h3>Quantum Circuit</h3>
        {renderCircuitDiagram()}
        
        <div className="circuit-info">
          <div><strong>Gates in circuit:</strong> {gates.length}</div>
          <div className="gate-list">
            {gates.map((gate, index) => (
              <span key={index} className="gate-tag">
                {availableGates[gate.type].name}
                {gate.qubit !== undefined && ` (q${gate.qubit})`}
                {gate.control !== undefined && ` (c${gate.control}→t${gate.target})`}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircuitBuilder;