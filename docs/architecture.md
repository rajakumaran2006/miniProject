# Cross-Layer Security Architecture for 5G/6G Network Slicing

## 1. Introduction

5G and 6G networks utilize Network Slicing to create dedicated virtual networks customized for distinct Quality of Service (QoS) requirements:
- **eMBB (Enhanced Mobile Broadband)**: High throughput (video streaming, AR/VR).
- **URLLC (Ultra-Reliable Low-Latency Communication)**: Sub-millisecond latency (autonomous driving, industrial automation).
- **mMTC (Massive Machine-Type Communications)**: High density of IoT devices (smart cities, sensor networks).

## 2. Cross-Layer Threat Vectors

Security breaches in one layer can cascade into cross-layer degradation:
1. **Physical/RAN Layer**: RF jamming, spoofed gNB signals, beamforming manipulation.
2. **Transport/Network Layer**: Inter-slice hopping, BGP spoofing, SDN flow table overflow.
3. **Core Layer (3GPP Service Based Architecture)**: Compromised NF (Network Function) registration, OAuth token forgery, NRF poisoning.
4. **Management & Orchestration (MANO)**: Unauthorized slice provisioning, resource starvation attacks.

## 3. Framework Design Principles

- **Separation of Concerns**: Business telemetry, API routing, and AI simulation engines are modularized.
- **Cross-Layer Telemetry Aggregation**: Metrics from RAN, Transport, and Core are normalized into a unified security vector.
- **Extensible Simulation Interface**: The `BaseRLAgent` and `BaseAttackSimulator` allow plug-and-play research implementations.
- **Decoupled Frontend**: Next.js single-page application consumes asynchronous REST endpoints with full TypeScript type safety.
