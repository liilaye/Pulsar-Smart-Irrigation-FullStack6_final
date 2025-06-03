
export interface MQTTMessage {
  topic: string;
  message: string;
}

export interface MQTTConfig {
  brokerUrls: string[];
  maxRetries: number;
  connectTimeout: number;
  keepalive: number;
  topics: {
    status: string;
    control: string;
    data: string;
  };
}

export interface PublishOptions {
  qos?: 0 | 1 | 2;
  retain?: boolean;
}
