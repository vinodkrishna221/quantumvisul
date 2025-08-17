"""
Quantum State Processor for Quantum State Visualizer
Handles quantum circuit processing, density matrix calculations, and partial tracing
"""

import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, DensityMatrix, partial_trace
from qiskit_aer import AerSimulator
from typing import List, Dict, Tuple
import json

class QuantumStateProcessor:
    def __init__(self):
        self.simulator = AerSimulator(method='statevector')
    
    def create_circuit_from_json(self, circuit_data: Dict) -> QuantumCircuit:
        """
        Create a quantum circuit from JSON representation
        
        Args:
            circuit_data: Dictionary containing circuit information
                {
                    "num_qubits": int,
                    "gates": [
                        {"type": "h", "qubit": 0},
                        {"type": "cx", "control": 0, "target": 1},
                        ...
                    ]
                }
        
        Returns:
            QuantumCircuit: The constructed quantum circuit
        """
        num_qubits = circuit_data.get('num_qubits', 2)
        circuit = QuantumCircuit(num_qubits)
        
        for gate in circuit_data.get('gates', []):
            gate_type = gate['type'].lower()
            
            if gate_type == 'h':
                circuit.h(gate['qubit'])
            elif gate_type == 'x':
                circuit.x(gate['qubit'])
            elif gate_type == 'y':
                circuit.y(gate['qubit'])
            elif gate_type == 'z':
                circuit.z(gate['qubit'])
            elif gate_type == 'cx' or gate_type == 'cnot':
                circuit.cx(gate['control'], gate['target'])
            elif gate_type == 'cz':
                circuit.cz(gate['control'], gate['target'])
            elif gate_type == 'rx':
                circuit.rx(gate['angle'], gate['qubit'])
            elif gate_type == 'ry':
                circuit.ry(gate['angle'], gate['qubit'])
            elif gate_type == 'rz':
                circuit.rz(gate['angle'], gate['qubit'])
        
        return circuit
    
    def get_statevector(self, circuit: QuantumCircuit) -> np.ndarray:
        """
        Get the statevector from a quantum circuit
        
        Args:
            circuit: The quantum circuit
            
        Returns:
            np.ndarray: The statevector
        """
        # Use the modern Qiskit approach
        statevector = Statevector.from_instruction(circuit)
        return np.array(statevector.data)
    
    def calculate_density_matrix(self, statevector: np.ndarray) -> np.ndarray:
        """
        Calculate the density matrix from a statevector
        
        Args:
            statevector: The quantum statevector
            
        Returns:
            np.ndarray: The density matrix
        """
        return np.outer(statevector, np.conj(statevector))
    
    def partial_trace_single_qubit(self, density_matrix: np.ndarray, 
                                 num_qubits: int, qubit_index: int) -> np.ndarray:
        """
        Perform partial trace to isolate a single qubit
        
        Args:
            density_matrix: The full system density matrix
            num_qubits: Total number of qubits
            qubit_index: Index of the qubit to isolate
            
        Returns:
            np.ndarray: 2x2 density matrix for the single qubit
        """
        # Create list of qubits to trace out (all except the target qubit)
        qubits_to_trace = [i for i in range(num_qubits) if i != qubit_index]
        
        # Convert to Qiskit DensityMatrix for easier partial tracing
        dm = DensityMatrix(density_matrix)
        reduced_dm = partial_trace(dm, qubits_to_trace)
        
        return reduced_dm.data
    
    def density_matrix_to_bloch_vector(self, density_matrix: np.ndarray) -> Tuple[float, float, float]:
        """
        Convert a single-qubit density matrix to Bloch sphere coordinates
        
        Args:
            density_matrix: 2x2 density matrix for a single qubit
            
        Returns:
            Tuple[float, float, float]: (x, y, z) coordinates on Bloch sphere
        """
        # Pauli matrices
        sigma_x = np.array([[0, 1], [1, 0]], dtype=complex)
        sigma_y = np.array([[0, -1j], [1j, 0]], dtype=complex)
        sigma_z = np.array([[1, 0], [0, -1]], dtype=complex)
        
        # Calculate Bloch vector components
        x = np.real(np.trace(density_matrix @ sigma_x))
        y = np.real(np.trace(density_matrix @ sigma_y))
        z = np.real(np.trace(density_matrix @ sigma_z))
        
        return (x, y, z)
    
    def process_circuit(self, circuit_data: Dict) -> Dict:
        """
        Main processing function that takes circuit data and returns Bloch coordinates
        
        Args:
            circuit_data: Dictionary containing circuit information
            
        Returns:
            Dict: Results containing Bloch coordinates for each qubit
        """
        try:
            # Create circuit
            circuit = self.create_circuit_from_json(circuit_data)
            num_qubits = circuit.num_qubits
            
            # Get statevector
            statevector = self.get_statevector(circuit)
            
            # Calculate full density matrix
            full_density_matrix = self.calculate_density_matrix(statevector)
            
            # Process each qubit
            results = {
                'num_qubits': num_qubits,
                'qubits': []
            }
            
            for qubit_idx in range(num_qubits):
                # Get reduced density matrix for this qubit
                reduced_dm = self.partial_trace_single_qubit(
                    full_density_matrix, num_qubits, qubit_idx
                )
                
                # Convert to Bloch coordinates
                x, y, z = self.density_matrix_to_bloch_vector(reduced_dm)
                
                # Convert complex numbers to real for JSON serialization
                density_matrix_real = []
                for row in reduced_dm:
                    real_row = []
                    for element in row:
                        if isinstance(element, complex):
                            real_row.append([float(element.real), float(element.imag)])
                        else:
                            real_row.append([float(element), 0.0])
                    density_matrix_real.append(real_row)
                
                results['qubits'].append({
                    'index': qubit_idx,
                    'bloch_coordinates': {'x': float(x), 'y': float(y), 'z': float(z)},
                    'density_matrix': density_matrix_real  # For debugging
                })
            
            return results
            
        except Exception as e:
            return {'error': str(e)}

# Example usage and testing
if __name__ == "__main__":
    processor = QuantumStateProcessor()
    
    # Test with a simple Bell state circuit
    test_circuit = {
        "num_qubits": 2,
        "gates": [
            {"type": "h", "qubit": 0},
            {"type": "cx", "control": 0, "target": 1}
        ]
    }
    
    result = processor.process_circuit(test_circuit)
    print("Test Result:")
    print(json.dumps(result, indent=2))