# VYOMSENTINEL Privacy Shield Demonstration

This standalone Streamlit service illustrates confidential multi-operator space traffic management using simulated Secure Multi-Party Computation (SMPC).

## Concept Overview

Space surveillance and collision avoidance face a fundamental tension:
- Civil and commercial operators must avoid catastrophic orbital debris collisions.
- Defense, sovereign, and commercial constellation operators cannot publicly broadcast sensitive orbital ephemerides or maneuver schedules.

The Privacy Shield protocol models how two parties (e.g. a sovereign defense satellite operator and a commercial constellation operator) can jointly evaluate collision probabilities without ever exchanging their raw orbital vectors or Keplerian parameters.

## Running the Demonstration

From the workspace root or the `privacy-shield` directory:

```bash
cd privacy-shield
pip install -r requirements.txt
streamlit run app.py --server.port 8501
```

The application opens at `http://localhost:8501`.

## Protocol Simulation Workflow

1. **Operator A Authorization**: Submits secret-shared polynomial representation of trajectory without revealing coordinates.
2. **Operator B Authorization**: Submits corresponding secret-shared evaluation shares.
3. **SMPC Homomorphic Circuit Execution**: Evaluates Euclidean separation distance and probability of collision (Pc) directly on shares.
4. **Output Verification**: Reveals only scalar values (Miss Distance and Pc). Verifies that raw states remain classified and undisclosed.

## Production Implementation Roadmap

In a production environment, this workflow is backed by cryptographic SMPC engines (such as MPyC or PySyft) utilizing BGW/SPDZ secret-sharing protocols, oblivious transfer, and verifiable zero-knowledge proofs (ZKP) to ensure mathematical security against active adversaries.
