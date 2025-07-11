export interface PushbulletDevice {
  iden: string;
  active: boolean;
  created: number;
  modified: number;
  type: string;
  kind: string;
  nickname: string;
  manufacturer?: string;
  model?: string;
  app_version?: number;
  fingerprint?: string;
  key_fingerprint?: string;
  push_token?: string;
  has_sms?: boolean;
  icon?: string;
}

export interface PushbulletPush {
  iden: string;
  active: boolean;
  created: number;
  modified: number;
  type: 'note' | 'link' | 'file' | 'address';
  dismissed: boolean;
  direction: 'self' | 'outgoing' | 'incoming';
  sender_iden?: string;
  sender_email?: string;
  sender_email_normalized?: string;
  sender_name?: string;
  receiver_iden?: string;
  receiver_email?: string;
  receiver_email_normalized?: string;
  target_device_iden?: string;
  source_device_iden?: string;
  client_iden?: string;
  channel_iden?: string;
  awake_app_guids?: string[];
  title?: string;
  body?: string;
  url?: string;
  file_name?: string;
  file_type?: string;
  file_url?: string;
  image_url?: string;
  image_width?: number;
  image_height?: number;
  name?: string;
  address?: string;
}

export interface PushbulletContact {
  iden: string;
  name: string;
  email: string;
  email_normalized: string;
  image_url?: string;
  created: number;
  modified: number;
  active: boolean;
}

export interface PushbulletChannel {
  iden: string;
  tag: string;
  name: string;
  description: string;
  image_url?: string;
  website_url?: string;
  created: number;
  modified: number;
  active: boolean;
  recent_pushes?: PushbulletPush[];
}

export interface PushbulletSubscription {
  iden: string;
  active: boolean;
  created: number;
  modified: number;
  channel: PushbulletChannel;
  muted: boolean;
}

export interface PushbulletUser {
  iden: string;
  email: string;
  email_normalized: string;
  name: string;
  image_url?: string;
  max_upload_size: number;
  created: number;
  modified: number;
}

export interface PushbulletSms {
  iden: string;
  thread_id: string;
  timestamp: number;
  body: string;
  direction: 'incoming' | 'outgoing';
  addresses: string[];
  target_device_iden: string;
}

export interface CreatePushData {
  type: 'note' | 'link' | 'file' | 'address';
  title?: string;
  body?: string;
  url?: string;
  file_name?: string;
  file_type?: string;
  file_url?: string;
  name?: string;
  address?: string;
  device_iden?: string;
  email?: string;
  channel_tag?: string;
}

export interface PushbulletApiResponse<T> {
  accounts?: T[];
  blocks?: T[];
  channels?: T[];
  chats?: T[];
  clients?: T[];
  contacts?: T[];
  devices?: T[];
  grants?: T[];
  pushes?: T[];
  profiles?: T[];
  subscriptions?: T[];
  texts?: T[];
  cursor?: string;
}