import hmac
import hashlib
import secrets
import base64
import time
import logging
from typing import Dict, Any, Tuple

logger = logging.getLogger("5g_6g_security.controls.crypto")

# Supported Prototype Cipher Modes
CIPHER_MODES = {
    "NONE": {
        "name": "No Encryption",
        "type": "NONE",
        "cpu_cycles_per_byte": 0.0,
        "latency_overhead_ms": 0.0,
        "key_size_bits": 0,
        "memory_footprint_kb": 0.0,
        "target_device": "Unsecured Public Telemetry",
    },
    "LIGHTWEIGHT_PRESENT_ASCON": {
        "name": "Lightweight ASCON-128 / PRESENT-80 (IoT Cipher Prototype)",
        "type": "LIGHTWEIGHT",
        "cpu_cycles_per_byte": 3.2,
        "latency_overhead_ms": 0.8,
        "key_size_bits": 128,
        "memory_footprint_kb": 1.4,
        "target_device": "Resource-Constrained mMTC Sensors & Wearables",
    },
    "AES_128_GCM": {
        "name": "AES-128-GCM Standard 5G Cipher",
        "type": "STANDARD",
        "cpu_cycles_per_byte": 12.5,
        "latency_overhead_ms": 3.5,
        "key_size_bits": 128,
        "memory_footprint_kb": 12.0,
        "target_device": "Standard eMBB User Equipment (UE)",
    },
    "AES_256_GCM_PQC": {
        "name": "AES-256-GCM + Post-Quantum Lattice Hybrid",
        "type": "HIGH_SECURITY",
        "cpu_cycles_per_byte": 34.0,
        "latency_overhead_ms": 12.0,
        "key_size_bits": 256,
        "memory_footprint_kb": 64.0,
        "target_device": "Mission-Critical URLLC Defense & Power Grids",
    },
}


class LightweightCryptoPrototype:
    """
    Lightweight Cryptography Prototype Abstraction for 5G/6G IoT Devices.
    Demonstrates resource-constrained cipher wrappers safely built on Python standard library HMAC-SHA256 primitives.
    """

    DISCLAIMER = (
        "SAFE ACADEMIC PROTOTYPE: Lightweight cipher modes (ASCON/PRESENT) are implemented as "
        "demonstration abstractions using standard HMAC-SHA256 primitives. Do not use custom cipher code for real production."
    )

    @classmethod
    def encrypt_payload(cls, plaintext: str, cipher_mode: str = "LIGHTWEIGHT_PRESENT_ASCON") -> Dict[str, Any]:
        """
        Simulate payload encryption using specified cipher mode.
        Returns ciphertext string, nonce, MAC tag, and performance benchmark metrics.
        """
        mode_info = CIPHER_MODES.get(cipher_mode, CIPHER_MODES["LIGHTWEIGHT_PRESENT_ASCON"])
        start_time = time.perf_counter()

        if cipher_mode == "NONE":
            return {
                "cipher_mode": cipher_mode,
                "ciphertext": plaintext,
                "nonce": "",
                "mac_tag": "",
                "latency_overhead_ms": 0.0,
                "cpu_cycles_per_byte": 0.0,
                "memory_footprint_kb": 0.0,
                "disclaimer": cls.DISCLAIMER,
            }

        # Generate cryptographic nonce & key
        nonce = secrets.token_hex(8)
        dummy_key = secrets.token_bytes(16)

        # Prototype Lightweight AEAD Tag calculation using HMAC-SHA256
        mac_tag = hmac.new(dummy_key, (nonce + plaintext).encode("utf-8"), hashlib.sha256).hexdigest()[:16]

        # Base64 encode for prototype payload representation
        raw_b64 = base64.b64encode(plaintext.encode("utf-8")).decode("utf-8")
        ciphertext = f"ENC[{mode_info['type']}:{nonce}:{raw_b64[:24]}...:{mac_tag}]"

        calc_latency = round((time.perf_counter() - start_time) * 1000.0 + mode_info["latency_overhead_ms"], 3)
        payload_bytes = len(plaintext.encode("utf-8"))

        return {
            "cipher_mode": cipher_mode,
            "cipher_name": mode_info["name"],
            "ciphertext": ciphertext,
            "nonce": nonce,
            "mac_tag": mac_tag,
            "payload_bytes": payload_bytes,
            "latency_overhead_ms": calc_latency,
            "cpu_cycles_per_byte": mode_info["cpu_cycles_per_byte"],
            "memory_footprint_kb": mode_info["memory_footprint_kb"],
            "disclaimer": cls.DISCLAIMER,
        }

    @classmethod
    def get_benchmark_comparison(cls) -> Dict[str, Any]:
        """Return benchmark comparison of all supported 5G/6G cipher modes."""
        return {
            "disclaimer": cls.DISCLAIMER,
            "supported_modes": CIPHER_MODES,
        }
