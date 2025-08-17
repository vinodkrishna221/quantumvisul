"""
Flask API for Quantum State Visualizer
Provides endpoints for quantum circuit processing and state visualization
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from quantum_processor import QuantumStateProcessor
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize quantum processor
quantum_processor = QuantumStateProcessor()

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        'message': 'Quantum State Visualizer API',
        'status': 'running',
        'version': '1.0.0'
    })

@app.route('/api/process-circuit', methods=['POST'])
def process_circuit():
    """
    Process a quantum circuit and return Bloch sphere coordinates
    
    Expected JSON payload:
    {
        "num_qubits": 2,
        "gates": [
            {"type": "h", "qubit": 0},
            {"type": "cx", "control": 0, "target": 1}
        ]
    }
    
    Returns:
    {
        "num_qubits": 2,
        "qubits": [
            {
                "index": 0,
                "bloch_coordinates": {"x": 0.0, "y": 0.0, "z": 0.0},
                "density_matrix": [[...], [...]]
            },
            ...
        ]
    }
    """
    try:
        # Get circuit data from request
        circuit_data = request.get_json()
        
        if not circuit_data:
            return jsonify({'error': 'No circuit data provided'}), 400
        
        # Validate required fields
        if 'num_qubits' not in circuit_data:
            return jsonify({'error': 'num_qubits field is required'}), 400
        
        if 'gates' not in circuit_data:
            circuit_data['gates'] = []  # Empty circuit is valid
        
        # Process the circuit
        result = quantum_processor.process_circuit(circuit_data)
        
        if 'error' in result:
            return jsonify(result), 500
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/example-circuits', methods=['GET'])
def get_example_circuits():
    """
    Get predefined example circuits for demonstration
    """
    examples = {
        'bell_state': {
            'name': 'Bell State (Entangled Qubits)',
            'description': 'Creates maximum entanglement between two qubits',
            'circuit': {
                'num_qubits': 2,
                'gates': [
                    {'type': 'h', 'qubit': 0},
                    {'type': 'cx', 'control': 0, 'target': 1}
                ]
            }
        },
        'ghz_state': {
            'name': 'GHZ State (3 Qubits)',
            'description': 'Three-qubit entangled state',
            'circuit': {
                'num_qubits': 3,
                'gates': [
                    {'type': 'h', 'qubit': 0},
                    {'type': 'cx', 'control': 0, 'target': 1},
                    {'type': 'cx', 'control': 1, 'target': 2}
                ]
            }
        },
        'superposition': {
            'name': 'Single Qubit Superposition',
            'description': 'Single qubit in equal superposition',
            'circuit': {
                'num_qubits': 1,
                'gates': [
                    {'type': 'h', 'qubit': 0}
                ]
            }
        },
        'mixed_state': {
            'name': 'Mixed State Example',
            'description': 'Creates mixed states through partial measurement',
            'circuit': {
                'num_qubits': 2,
                'gates': [
                    {'type': 'h', 'qubit': 0},
                    {'type': 'h', 'qubit': 1},
                    {'type': 'cx', 'control': 0, 'target': 1}
                ]
            }
        }
    }
    
    return jsonify(examples)

@app.route('/api/supported-gates', methods=['GET'])
def get_supported_gates():
    """
    Get list of supported quantum gates
    """
    gates = {
        'single_qubit': [
            {
                'type': 'h',
                'name': 'Hadamard',
                'description': 'Creates superposition',
                'parameters': ['qubit']
            },
            {
                'type': 'x',
                'name': 'Pauli-X',
                'description': 'Bit flip gate',
                'parameters': ['qubit']
            },
            {
                'type': 'y',
                'name': 'Pauli-Y',
                'description': 'Bit and phase flip gate',
                'parameters': ['qubit']
            },
            {
                'type': 'z',
                'name': 'Pauli-Z',
                'description': 'Phase flip gate',
                'parameters': ['qubit']
            },
            {
                'type': 'rx',
                'name': 'Rotation-X',
                'description': 'Rotation around X-axis',
                'parameters': ['qubit', 'angle']
            },
            {
                'type': 'ry',
                'name': 'Rotation-Y',
                'description': 'Rotation around Y-axis',
                'parameters': ['qubit', 'angle']
            },
            {
                'type': 'rz',
                'name': 'Rotation-Z',
                'description': 'Rotation around Z-axis',
                'parameters': ['qubit', 'angle']
            }
        ],
        'two_qubit': [
            {
                'type': 'cx',
                'name': 'CNOT',
                'description': 'Controlled-X gate',
                'parameters': ['control', 'target']
            },
            {
                'type': 'cz',
                'name': 'Controlled-Z',
                'description': 'Controlled-Z gate',
                'parameters': ['control', 'target']
            }
        ]
    }
    
    return jsonify(gates)

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("Starting Quantum State Visualizer API...")
    print("Available endpoints:")
    print("  GET  /                     - Health check")
    print("  POST /api/process-circuit  - Process quantum circuit")
    print("  GET  /api/example-circuits - Get example circuits")
    print("  GET  /api/supported-gates  - Get supported gates")
    
    app.run(debug=True, host='0.0.0.0', port=5000)