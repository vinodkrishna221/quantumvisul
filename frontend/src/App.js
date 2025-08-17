/**
 * Main App Component for Quantum State Visualizer
 * Integrates circuit builder and Bloch sphere visualization
 */

import React, { useState, useCallback } from 'react';
import CircuitBuilder from './components/CircuitBuilder';
import BlochSphere from './components/BlochSphere';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [currentCircuit, setCurrentCircuit] = useState({
    num_qubits: 2,
    gates: []
  });
  const [quantumStates, setQuantumStates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAnimated, setIsAnimated] = useState(false);

  // Debounced circuit processing to avoid too many API calls
  const processCircuitDebounced = useCallback(
    debounce((circuit) => {
      processCircuit(circuit);
    }, 500),
    []
  );

  // Handle circuit changes from CircuitBuilder
  const handleCircuitChange = useCallback((circuit) => {
    setCurrentCircuit(circuit);
    // Auto-process circuit when it changes (with debouncing)
    if (circuit.gates.length > 0) {
      processCircuitDebounced(circuit);
    } else {
      setQuantumStates(null);
    }
  }, [processCircuitDebounced]);

  // Process quantum circuit through API
  const processCircuit = async (circuit = currentCircuit) => {
    if (!circuit.gates || circuit.gates.length === 0) {
      setQuantumStates(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/process-circuit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(circuit),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setQuantumStates(result);
    } catch (err) {
      setError(`Failed to process circuit: ${err.message}`);
      console.error('Circuit processing error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load example circuits
  const loadExampleCircuit = async (exampleName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/example-circuits`);
      const examples = await response.json();
      
      if (examples[exampleName]) {
        const circuit = examples[exampleName].circuit;
        setCurrentCircuit(circuit);
        await processCircuit(circuit);
      }
    } catch (err) {
      setError(`Failed to load example: ${err.message}`);
    }
  };

  // Export circuit data
  const exportCircuit = () => {
    const dataStr = JSON.stringify(currentCircuit, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'quantum_circuit.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import circuit data
  const importCircuit = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const circuit = JSON.parse(e.target.result);
          setCurrentCircuit(circuit);
          processCircuit(circuit);
        } catch (err) {
          setError('Invalid circuit file format');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌌 Quantum State Visualizer</h1>
        <p>Interactive quantum circuit builder with Bloch sphere visualization</p>
        <div className="header-info">
          <span>AMARAVATI QUANTUM VALLEY HACKATHON 2025</span>
          <span>Problem Statement 3 - AQV11912</span>
        </div>
      </header>

      <main className="App-main">
        {/* Control Panel */}
        <div className="control-panel">
          <div className="control-section">
            <h3>Quick Examples</h3>
            <div className="example-buttons">
              <button onClick={() => loadExampleCircuit('bell_state')}>
                Bell State
              </button>
              <button onClick={() => loadExampleCircuit('ghz_state')}>
                GHZ State
              </button>
              <button onClick={() => loadExampleCircuit('superposition')}>
                Superposition
              </button>
              <button onClick={() => loadExampleCircuit('mixed_state')}>
                Mixed State
              </button>
            </div>
          </div>

          <div className="control-section">
            <h3>Visualization Controls</h3>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isAnimated}
                onChange={(e) => setIsAnimated(e.target.checked)}
              />
              Animate Bloch Spheres
            </label>
            <button onClick={() => processCircuit()} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Refresh Visualization'}
            </button>
          </div>

          <div className="control-section">
            <h3>Import/Export</h3>
            <div className="file-controls">
              <button onClick={exportCircuit}>Export Circuit</button>
              <label className="file-input-label">
                Import Circuit
                <input
                  type="file"
                  accept=".json"
                  onChange={importCircuit}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Circuit Builder */}
        <section className="circuit-section">
          <CircuitBuilder
            onCircuitChange={handleCircuitChange}
            initialCircuit={currentCircuit}
          />
        </section>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <h3>⚠️ Error</h3>
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="loading-message">
            <div className="spinner"></div>
            <p>Processing quantum circuit...</p>
          </div>
        )}

        {/* Bloch Sphere Visualization */}
        <section className="visualization-section">
          <h2>Quantum State Visualization</h2>
          {quantumStates ? (
            <>
              <BlochSphere 
                quantumStates={quantumStates} 
                isAnimated={isAnimated}
              />
              <div className="state-info">
                <h3>Quantum State Information</h3>
                <div className="state-details">
                  <p><strong>Number of Qubits:</strong> {quantumStates.num_qubits}</p>
                  <div className="qubit-states">
                    {quantumStates.qubits.map((qubit, index) => (
                      <div key={index} className="qubit-info">
                        <h4>Qubit {qubit.index}</h4>
                        <div className="coordinates">
                          <span>X: {qubit.bloch_coordinates.x.toFixed(4)}</span>
                          <span>Y: {qubit.bloch_coordinates.y.toFixed(4)}</span>
                          <span>Z: {qubit.bloch_coordinates.z.toFixed(4)}</span>
                        </div>
                        <div className="state-description">
                          {getStateDescription(qubit.bloch_coordinates)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-visualization">
              <p>Build a quantum circuit above to see the Bloch sphere visualization</p>
              <p>Add gates to your circuit and watch how they affect the quantum states!</p>
            </div>
          )}
        </section>

        {/* Educational Information */}
        <section className="education-section">
          <h2>Understanding the Visualization</h2>
          <div className="education-content">
            <div className="concept">
              <h3>🎯 Bloch Sphere</h3>
              <p>
                The Bloch sphere is a geometric representation of quantum states for a single qubit.
                Each point on the sphere represents a possible quantum state.
              </p>
            </div>
            <div className="concept">
              <h3>🔄 Partial Tracing</h3>
              <p>
                When qubits are entangled, we use partial tracing to isolate the state of individual qubits
                from the multi-qubit system, showing their reduced density matrices.
              </p>
            </div>
            <div className="concept">
              <h3>📊 Mixed States</h3>
              <p>
                Points inside the Bloch sphere represent mixed states, which occur when qubits are
                entangled with other qubits in the system.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="App-footer">
        <p>Built for AMARAVATI QUANTUM VALLEY HACKATHON 2025</p>
        <p>Quantum State Visualizer - Problem Statement 3</p>
      </footer>
    </div>
  );
}

// Utility function to describe quantum states
function getStateDescription(coords) {
  const { x, y, z } = coords;
  const magnitude = Math.sqrt(x*x + y*y + z*z);
  
  if (magnitude < 0.01) {
    return "Maximally mixed state (center of sphere)";
  } else if (magnitude > 0.99) {
    if (Math.abs(z - 1) < 0.01) return "Pure |0⟩ state";
    if (Math.abs(z + 1) < 0.01) return "Pure |1⟩ state";
    if (Math.abs(x - 1) < 0.01) return "Pure |+⟩ state";
    if (Math.abs(x + 1) < 0.01) return "Pure |-⟩ state";
    if (Math.abs(y - 1) < 0.01) return "Pure |+i⟩ state";
    if (Math.abs(y + 1) < 0.01) return "Pure |-i⟩ state";
    return "Pure quantum state";
  } else {
    return `Mixed state (purity: ${magnitude.toFixed(3)})`;
  }
}

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default App;