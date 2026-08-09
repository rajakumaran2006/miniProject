from abc import ABC, abstractmethod
from typing import Dict, Any, List, Tuple
from pydantic import BaseModel


class StateVector(BaseModel):
    """Normalized cross-layer feature vector representation."""
    slice_id: str
    physical_features: List[float]
    transport_features: List[float]
    core_features: List[float]
    application_features: List[float]


class ActionVector(BaseModel):
    """Mitigation action selected by security policy."""
    action_id: int
    action_name: str
    target_slice_id: str
    parameters: Dict[str, Any] = {}


class BaseRLAgent(ABC):
    """Abstract base class for Reinforcement Learning security agents (DQN, PPO, SAC)."""

    @abstractmethod
    def select_action(self, state: StateVector, explore: bool = True) -> ActionVector:
        """Select an action based on current state vector."""
        pass

    @abstractmethod
    def compute_reward(self, prev_state: StateVector, action: ActionVector, next_state: StateVector) -> float:
        """Compute scalar reward for cross-layer security & SLA compliance."""
        pass

    @abstractmethod
    def update_policy(self, batch_data: Any) -> Dict[str, float]:
        """Update agent weights/policy parameters."""
        pass


class BaseFederatedAgent(ABC):
    """Abstract base class for Federated Learning participants across 5G/6G domains."""

    @abstractmethod
    def get_local_weights(self) -> Dict[str, Any]:
        """Extract local model weight parameters."""
        pass

    @abstractmethod
    def update_global_weights(self, global_weights: Dict[str, Any]) -> None:
        """Receive aggregated global model parameters."""
        pass


class BaseAttackSimulator(ABC):
    """Abstract base class for synthetic attack generators."""

    @abstractmethod
    def inject_attack(self, target_slice_id: str, attack_type: str, intensity: float) -> Dict[str, Any]:
        """Inject synthetic multi-layer attack into network simulation."""
        pass

    @abstractmethod
    def stop_attack(self, target_slice_id: str) -> bool:
        """Stop active attack injection."""
        pass


class BaseCrossLayerMonitor(ABC):
    """Abstract base class for cross-layer telemetry aggregator."""

    @abstractmethod
    def collect_telemetry(self, slice_id: str) -> StateVector:
        """Synthesize metrics across physical, transport, core, and app layers."""
        pass
