#!/bin/sh
# Real IP/MAC Identity Spoofing Packet Generator for Open vSwitch
SPOOFED_IP=${1:-"172.28.0.10"} # Spoofs legitimate eMBB node
TARGET_IP=${2:-"172.28.0.20"}  # Sends to URLLC node
COUNT=${3:-"500"}

echo "[ATTACK-SPOOF] Injecting Spoofed Packets (Forging Source: ${SPOOFED_IP} -> Target: ${TARGET_IP})..."
python3 -c "
import socket, sys, time

# Send UDP frames with spoofed headers and simulated fake credentials
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    for i in range(${COUNT}):
        payload = f'SPOOFED_SUCI_HEADER_ID={i:05d}_SRC={SPOOFED_IP}_UNAUTHORIZED_TOKEN'.encode()
        s.sendto(payload, ('${TARGET_IP}', 8080))
        time.sleep(0.002)
    print('[ATTACK-SPOOF] Injected', ${COUNT}, 'spoofed packets successfully.')
except Exception as e:
    print('[ATTACK-SPOOF] Error:', e)
"
