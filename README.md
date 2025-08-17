# 🌌 Quantum State Visualizer

**AMARAVATI QUANTUM VALLEY HACKATHON 2025 - Problem Statement 3**

An interactive web application that accepts multi-qubit quantum circuits, performs partial tracing to isolate single-qubit reduced density matrices, and visualizes each qubit's mixed state on the Bloch sphere.

## 🎯 Problem Statement

**Theme**: Quantum State Visualizer  
**Category**: Software  
**PS Number**: AQV11912

Develop a tool/app that:
- Accepts multi-qubit quantum circuits
- Isolates single-qubit reduced density matrices using partial tracing
- Visualizes each qubit's mixed state on the Bloch sphere

## ✨ Features

- **Interactive Circuit Builder**: Drag-and-drop interface for building quantum circuits
- **Real-time Visualization**: Live Bloch sphere updates as you modify circuits
- **Multiple Qubit Support**: Handle circuits with 1-5 qubits
- **Comprehensive Gate Library**: Support for H, X, Y, Z, Rx, Ry, Rz, CNOT, CZ gates
- **Educational Content**: Built-in explanations of quantum concepts
- **Example Circuits**: Pre-built circuits (Bell state, GHZ state, etc.)
- **Import/Export**: Save and load circuit configurations
- **3D Visualization**: Interactive Bloch spheres with rotation and zoom

## 🚀 Quick Start

### Prerequisites

- Python 3.8+ 
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv quantum-env
source quantum-env/bin/activate  # On Windows: quantum-env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask API
python app.py
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The frontend will be available at `http://localhost:3000`

## 🏗️ Architecture

### Backend (Python + Flask)
- **Flask API**: RESTful endpoints for circuit processing
- **Qiskit**: Quantum circuit simulation and state vector calculation
- **NumPy**: Matrix operations and density matrix calculations
- **Quantum Processor**: Core logic for partial tracing and Bloch coordinates

### Frontend (React + Three.js)
- **React**: Component-based UI framework
- **Three.js**: 3D Bloch sphere visualization
- **Circuit Builder**: Interactive quantum circuit designer
- **State Visualizer**: Real-time quantum state display

## 📡 API Endpoints

### `POST /api/process-circuit`
Process a quantum circuit and return Bloch sphere coordinates.

**Request Body:**
```json
{
  "num_qubits": 2,
  "gates": [
    {"type": "h", "qubit": 0},
    {"type": "cx", "control": 0, "target": 1}
  ]
}
```

**Response:**
```json
{
  "num_qubits": 2,
  "qubits": [
    {
      "index": 0,
      "bloch_coordinates": {"x": 0.0, "y": 0.0, "z": 0.0},
      "density_matrix": [[0.5, 0.0], [0.0, 0.5]]
    }
  ]
}
```

### `GET /api/example-circuits`
Get predefined example circuits.

### `GET /api/supported-gates`
Get list of supported quantum gates.

## 🎮 Usage Guide

### Building Circuits
1. Select the number of qubits (1-5)
2. Choose a gate type from the dropdown
3. Select target qubit(s) for the gate
4. Click "Add Gate" to add it to the circuit
5. Watch the Bloch sphere visualization update in real-time

### Supported Gates
- **Single-qubit gates**: H, X, Y, Z, Rx, Ry, Rz
- **Two-qubit gates**: CNOT, Controlled-Z
- **Parameterized gates**: Rotation gates with adjustable angles

### Understanding the Visualization
- **Bloch Sphere**: Each qubit gets its own 3D Bloch sphere
- **State Vector**: Red arrow shows the quantum state direction
- **Pure States**: Points on the sphere surface
- **Mixed States**: Points inside the sphere (from entanglement)
- **Coordinates**: X, Y, Z values represent the Bloch vector components

## 🧮 Quantum Concepts Explained

### Density Matrices
Quantum states are represented as density matrices ρ, which generalize pure states to mixed states:
- Pure state: ρ = |ψ⟩⟨ψ|
- Mixed state: ρ = Σᵢ pᵢ|ψᵢ⟩⟨ψᵢ|

### Partial Tracing
For a multi-qubit system, partial tracing isolates individual qubit states:
- Full system: ρ_total
- Single qubit: ρ_i = Tr_{j≠i}(ρ_total)

### Bloch Sphere Mapping
Single-qubit density matrices map to Bloch sphere coordinates:
- x = Tr(ρσₓ)
- y = Tr(ρσᵧ)  
- z = Tr(ρσᵤ)

Where σₓ, σᵧ, σᵤ are the Pauli matrices.

## 🛠️ Development with Modern Tools

### Using Bolt.new
1. Visit [bolt.new](https://bolt.new)
2. Upload the project files
3. Use AI assistance for rapid prototyping
4. Deploy directly from the platform

### Using Lovable
1. Import the project structure
2. Use natural language to modify components
3. Generate new features with AI assistance
4. Iterate quickly on the design

### Using Kiro (AI Assistant)
- Ask for code explanations and improvements
- Get help with quantum computing concepts
- Debug issues and optimize performance
- Generate additional features and tests

## 📁 Project Structure

```
quantum-visualizer/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── quantum_processor.py   # Core quantum logic
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BlochSphere.js     # 3D visualization
│   │   │   ├── CircuitBuilder.js  # Circuit interface
│   │   │   └── CircuitBuilder.css # Styling
│   │   ├── App.js             # Main application
│   │   └── App.css            # Main styling
│   └── package.json           # Node.js dependencies
├── quantum-visualizer-plan.md # Development plan
└── README.md                  # This file
```

## 🚀 Deployment Options

### Backend Deployment
- **Heroku**: Easy Python app deployment
- **Railway**: Modern deployment platform
- **AWS Lambda**: Serverless deployment
- **Google Cloud Run**: Container-based deployment

### Frontend Deployment
- **Vercel**: Optimized for React apps
- **Netlify**: Static site hosting with CI/CD
- **GitHub Pages**: Free static hosting
- **AWS S3 + CloudFront**: Scalable static hosting

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📚 Learning Resources

- [Qiskit Textbook](https://qiskit.org/textbook/)
- [IBM Quantum Experience](https://quantum-computing.ibm.com/)
- [Quantum Computing Explained](https://www.microsoft.com/en-us/quantum/)
- [Bloch Sphere Visualization](https://en.wikipedia.org/wiki/Bloch_sphere)

## 📄 License

This project is developed for the AMARAVATI QUANTUM VALLEY HACKATHON 2025.

## 🏆 Hackathon Submission

**Team**: [Your Team Name]  
**Problem Statement**: 3 - Quantum State Visualizer  
**Category**: Software  
**PS Number**: AQV11912

### Key Achievements
- ✅ Multi-qubit quantum circuit support
- ✅ Partial tracing implementation
- ✅ Interactive Bloch sphere visualization
- ✅ Educational quantum computing content
- ✅ Modern web application architecture
- ✅ Real-time state updates
- ✅ Comprehensive gate library

---

Built with ❤️ for quantum computing education and visualization.