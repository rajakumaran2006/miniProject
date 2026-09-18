# Open vSwitch (OVS) 5G/6G Overlay Virtual Network (OVN)

This directory contains the software-defined **Open vSwitch (OVS)** Overlay Virtual Network infrastructure for the 5G/6G Adaptive Security Framework.

## Network Topology

- **`ovs-switch`** (`172.28.0.2`): Open vSwitch bridge (`br-slicing`) with OpenFlow 1.3 flow tables, meters, and packet drop filters.
- **`embb-node`** (`172.28.0.10`): eMBB slice endpoint (VLAN/VNI 10 - High throughput).
- **`urllc-node`** (`172.28.0.20`): URLLC slice endpoint (VLAN/VNI 20 - Ultra-low latency).
- **`mmtc-node`** (`172.28.0.30`): mMTC slice endpoint (VLAN/VNI 30 - IoT sensors).
- **`attacker-node`** (`172.28.0.99`): Adversarial node equipped with packet injection tools.

## How to Run with Docker

1. Start the OVS Virtual Network:
   ```bash
   docker compose -f docker-compose.ovs.yml up -d
   ```

2. Check OVS bridge status:
   ```bash
   docker exec -it ovs-switch ovs-vsctl show
   ```

3. View live OpenFlow rules and packet counters:
   ```bash
   docker exec -it ovs-switch ovs-ofctl -O OpenFlow13 dump-flows br-slicing
   ```

4. Launch attacks manually or via the Web UI:
   ```bash
   # DoS Flood:
   docker exec -it attacker-node /scripts/attack_dos.sh 172.28.0.20 5001 2000

   # Spoofing:
   docker exec -it attacker-node /scripts/attack_spoof.sh 172.28.0.10 172.28.0.20 500

   # Cross-Slice Breach:
   docker exec -it attacker-node /scripts/attack_breach.sh 172.28.0.30 172.28.0.20 300
   ```

5. Install an OpenFlow drop rule to resolve an attack:
   ```bash
   docker exec -it ovs-switch ovs-ofctl -O OpenFlow13 add-flow br-slicing "priority=100,ip,nw_src=172.28.0.99,actions=drop"
   ```

*(Note: If Docker is not running on your host, the backend automatically switches to the built-in Native OVS Emulator so all APIs and the Web UI continue functioning seamlessly).*
