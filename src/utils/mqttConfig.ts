
import { MQTTConfig } from '@/types/mqtt';

export const mqttConfig: MQTTConfig = {
  brokerUrls: [
    'ws://localhost:1883',
    'ws://127.0.0.1:1883',
    'wss://broker.emqx.io:8084/mqtt'
  ],
  maxRetries: 3,
  connectTimeout: 10000,
  keepalive: 60,
  topics: {
    status: 'irrigation/PulsarInfinite/status',
    control: 'irrigation/PulsarInfinite/control',
    data: 'data/PulsarInfinite/swr'
  }
};

export const getClientOptions = () => ({
  connectTimeout: mqttConfig.connectTimeout,
  keepalive: mqttConfig.keepalive,
  clean: true,
  reconnectPeriod: 0
});
