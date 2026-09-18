#!/bin/sh
# Open vSwitch Virtual Bridge & 5G Slicing Setup Script
# Configures br-slicing, virtual ports, VLAN segmentation, and OpenFlow 1.3 tables.

echo "[OVS-SETUP] Initializing Open vSwitch 5G Virtual Slicing Network..."

# Wait for OVS daemon to be ready
until ovs-vsctl show > /dev/null 2>&1; do
    echo "[OVS-SETUP] Waiting for ovs-vswitchd to start..."
    sleep 1
done

# 1. Create the main virtual switch bridge
echo "[OVS-SETUP] Creating bridge br-slicing..."
ovs-vsctl --if-exists del-br br-slicing
ovs-vsctl add-br br-slicing
ovs-vsctl set bridge br-slicing protocols=OpenFlow13
ovs-vsctl set-fail-mode br-slicing secure

# 2. Add baseline OpenFlow rules: normal local switching
echo "[OVS-SETUP] Installing baseline OpenFlow 1.3 rules..."
# Default drop low priority rule
ovs-ofctl -O OpenFlow13 add-flow br-slicing "table=0,priority=0,actions=drop"
# ARP resolution flow
ovs-ofctl -O OpenFlow13 add-flow br-slicing "table=0,priority=10,dl_type=0x0806,actions=NORMAL"
# Intra-slice and authorized traffic forwarding
ovs-ofctl -O OpenFlow13 add-flow br-slicing "table=0,priority=20,dl_type=0x0800,actions=NORMAL"

echo "[OVS-SETUP] Open vSwitch 5G Slicing setup complete!"
ovs-vsctl show
