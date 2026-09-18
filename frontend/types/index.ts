export type SliceType = 'eMBB' | 'URLLC' | 'mMTC';
export type SliceStatus = 'HEALTHY' | 'DEGRADED' | 'UNDER_ATTACK' | 'CRITICAL';
export type SecurityLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';

export type AttackType = 'Denial-of-Service' | 'Spoofing' | 'Network-Slice Isolation Breach';
export type AttackSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AttackEvent {
  event_id: string;
  timestamp: string;
  slice_id: string;
  attack_type: AttackType;
  severity: AttackSeverity;
  affected_features: Record<string, any>;
  ground_truth_label: number;
  duration_steps: number;
  steps_remaining: number;
  is_active: boolean;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: number[][];
  trained_timestamp: string;
  num_samples: number;
  algorithm: string;
}

export interface DetectionResult {
  event_id: string;
  affected_slice: string;
  slice_type: string;
  timestamp: string;
  anomaly_score: number;
  predicted_status: 'NORMAL' | 'ANOMALOUS';
  confidence_score: number;
  threat_category: string;
  feature_contributions: Record<string, number>;
}

export interface RLMetrics {
  num_episodes: number;
  steps_per_episode: number;
  final_epsilon: number;
  mean_cumulative_reward: number;
  mean_attack_mitigation_rate_pct: number;
  mean_average_latency_ms: number;
  mean_resource_usage_pct: number;
  total_successful_attacks: number;
  episode_rewards: number[];
  mitigation_rates: number[];
  avg_latencies: number[];
  avg_cpu_usages: number[];
}

export interface RLSelectActionResponse {
  slice_id: string;
  slice_type: string;
  selected_action_id: number;
  selected_action_name: string;
  expected_mitigation: number;
  latency_penalty_ms: number;
  cpu_penalty_pct: number;
  has_active_attack: boolean;
  current_anomaly_score: number;
}

export interface StrategyMetrics {
  strategy_name: string;
  detection_rate_pct: number;
  response_time_steps: number;
  latency_ms: number;
  resource_consumption_cpu_pct: number;
  attack_mitigation_rate_pct: number;
  cumulative_reward: number;
  successful_attacks_count: number;
  total_attacks_simulated: number;
}

export interface ComparativeResults {
  experiment_seed: number;
  eval_episodes: number;
  strategies: {
    static_baseline: StrategyMetrics;
    single_agent_rl: StrategyMetrics;
    multi_agent_rl: StrategyMetrics;
  };
}

export interface PrivacyProof {
  round: number;
  timestamp: string;
  participating_nodes: string[];
  transmitted_data_type: string;
  raw_feature_vectors_transmitted: number;
  dataset_sizes: Record<string, number>;
  privacy_verification: string;
}

export interface FLNodeInfo {
  node_id: string;
  node_name: string;
  slice_type_focus: string;
  dataset_size: number;
  dataset_path: string;
}

export interface FLResults {
  num_communication_rounds: number;
  local_epochs_per_round: number;
  participating_edge_nodes: FLNodeInfo[];
  final_global_model_metrics: ModelMetrics;
  privacy_proof: PrivacyProof;
  round_history: any[];
}

export interface FLPredictResponse {
  slice_id: string;
  slice_type: string;
  anomaly_score: number;
  predicted_status: 'NORMAL' | 'ANOMALOUS';
  confidence_score: number;
  model_type: string;
  timestamp: string;
}

export interface SecurityControlStatus {
  slice_id: string;
  slice_type: string;
  overall_security_level: string;
  controls: {
    authentication: string;
    encryption: string;
    intrusion_detection: string;
    slice_isolation: string;
  };
  current_latency_ms: number;
  current_cpu_usage_pct: number;
}

export interface SecurityDecisionEntry {
  entry_id: string;
  timestamp: string;
  slice_id: string;
  threat_vector: string;
  rl_agent: string;
  action_taken: string;
  previous_security_level: string;
  new_security_level: string;
  reason: string;
  latency_impact_ms: number;
  resource_impact_pct: number;
  controls_snapshot: Record<string, string>;
}

export interface CryptoTestResponse {
  cipher_mode: string;
  cipher_name: string;
  ciphertext: string;
  nonce: string;
  mac_tag: string;
  payload_bytes: number;
  latency_overhead_ms: number;
  cpu_cycles_per_byte: number;
  memory_footprint_kb: number;
  disclaimer: string;
}

export interface LayerMetrics {
  physical_ran: Record<string, number>;
  transport_network: Record<string, number>;
  core_3gpp: Record<string, number>;
  application: Record<string, number>;
}

export interface NetworkSlice {
  slice_id: string;
  name: string;
  slice_type: SliceType;
  bandwidth: number;
  latency: number;
  packet_rate: number;
  packet_loss: number;
  connected_devices: number;
  cpu_usage: number;
  security_level: SecurityLevel;
  current_status: SliceStatus;
  anomaly_score: number;
  allocated_bandwidth_mbps: number;
  max_latency_ms: number;
  target_reliability: number;
  is_active: boolean;
  metrics: LayerMetrics;
  last_updated: string;
}

export interface AnomalyEvent {
  anomaly_id: string;
  slice_id: string;
  anomaly_type: string;
  severity: string;
  step_injected: number;
  duration_steps: number;
  steps_remaining: number;
}

export interface SimulationState {
  step_count: number;
  is_running: boolean;
  last_updated: string;
  slices: Record<string, NetworkSlice>;
  total_bandwidth_mbps: number;
  total_packet_rate: number;
  avg_latency_ms: number;
  overall_security_posture: SecurityLevel;
  active_anomalies: AnomalyEvent[];
  active_attacks: AttackEvent[];
}

export interface HealthCheckResponse {
  status: string;
  project_name: string;
  version: string;
  environment: string;
  timestamp: string;
  uptime_seconds: number;
  modules: Record<string, boolean>;
}

export type OVSBackendMode = 'DOCKER_OVS' | 'NATIVE_EMULATOR';
export type OVSAttackType = 'DOS' | 'SPOOFING' | 'ISOLATION_BREACH';
export type OVSMitigationAction = 'DROP' | 'RATE_LIMIT' | 'ISOLATE' | 'RESET';

export interface OVSPort {
  port_name: string;
  port_number: number;
  vlan_tag: number;
  slice_id: string;
  ip_address: string;
  mac_address: string;
  status: string;
  rx_packets: number;
  tx_packets: number;
  rx_dropped: number;
}

export interface OpenFlowRule {
  rule_id: string;
  table: number;
  priority: number;
  match: string;
  actions: string;
  packet_count: number;
  byte_count: number;
  duration_sec: number;
}

export interface OVSBridgeStatus {
  bridge_name: string;
  backend_mode: OVSBackendMode;
  is_active: boolean;
  openflow_version: string;
  ports: OVSPort[];
  active_rules_count: number;
  active_attack: Record<string, any> | null;
  mitigation_active: boolean;
  active_mitigation_rule: string | null;
}

