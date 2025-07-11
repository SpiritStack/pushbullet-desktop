import { 
  PushbulletDevice, 
  PushbulletPush, 
  PushbulletContact, 
  PushbulletChannel,
  PushbulletSubscription,
  PushbulletUser,
  PushbulletSms,
  CreatePushData,
  PushbulletApiResponse
} from '../types/pushbullet';

class PushbulletAPI {
  private apiToken: string | null = null;
  private baseURL = 'https://api.pushbullet.com/v2';
  private wsConnection: WebSocket | null = null;
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();

  constructor() {
    this.apiToken = localStorage.getItem('pushbullet_token');
  }

  setApiToken(token: string) {
    this.apiToken = token;
    localStorage.setItem('pushbullet_token', token);
  }

  getApiToken(): string | null {
    return this.apiToken;
  }

  clearApiToken() {
    this.apiToken = null;
    localStorage.removeItem('pushbullet_token');
    this.disconnect();
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.apiToken) {
      throw new Error('No API token provided');
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Access-Token': this.apiToken,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error: Could not connect to Pushbullet API. Please check your internet connection.');
      }
      throw error;
    }
  }

  // Authentication
  async verifyToken(): Promise<PushbulletUser> {
    return this.makeRequest<PushbulletUser>('/users/me');
  }

  // Devices
  async getDevices(): Promise<PushbulletDevice[]> {
    const response = await this.makeRequest<PushbulletApiResponse<PushbulletDevice>>('/devices');
    return response.devices || [];
  }

  async createDevice(nickname: string, type: string = 'stream'): Promise<PushbulletDevice> {
    return this.makeRequest<PushbulletDevice>('/devices', {
      method: 'POST',
      body: JSON.stringify({ nickname, type }),
    });
  }

  async updateDevice(iden: string, data: Partial<PushbulletDevice>): Promise<PushbulletDevice> {
    return this.makeRequest<PushbulletDevice>(`/devices/${iden}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteDevice(iden: string): Promise<void> {
    await this.makeRequest(`/devices/${iden}`, {
      method: 'DELETE',
    });
  }

  // Pushes
  async getPushes(limit = 100, cursor?: string): Promise<{ pushes: PushbulletPush[]; cursor?: string }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(cursor && { cursor }),
    });
    
    const response = await this.makeRequest<PushbulletApiResponse<PushbulletPush>>(`/pushes?${params}`);
    return { pushes: response.pushes || [], cursor: response.cursor };
  }

  async createPush(data: CreatePushData): Promise<PushbulletPush> {
    return this.makeRequest<PushbulletPush>('/pushes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePush(iden: string, data: Partial<PushbulletPush>): Promise<PushbulletPush> {
    return this.makeRequest<PushbulletPush>(`/pushes/${iden}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deletePush(iden: string): Promise<void> {
    await this.makeRequest(`/pushes/${iden}`, {
      method: 'DELETE',
    });
  }

  async dismissPush(iden: string): Promise<void> {
    await this.updatePush(iden, { dismissed: true });
  }

  // Contacts
  async getContacts(): Promise<PushbulletContact[]> {
    const response = await this.makeRequest<PushbulletApiResponse<PushbulletContact>>('/contacts');
    return response.contacts || [];
  }

  async createContact(name: string, email: string): Promise<PushbulletContact> {
    return this.makeRequest<PushbulletContact>('/contacts', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    });
  }

  async updateContact(iden: string, data: Partial<PushbulletContact>): Promise<PushbulletContact> {
    return this.makeRequest<PushbulletContact>(`/contacts/${iden}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteContact(iden: string): Promise<void> {
    await this.makeRequest(`/contacts/${iden}`, {
      method: 'DELETE',
    });
  }

  // Channels
  async getChannels(): Promise<PushbulletChannel[]> {
    const response = await this.makeRequest<PushbulletApiResponse<PushbulletChannel>>('/channels');
    return response.channels || [];
  }

  async getChannelInfo(tag: string): Promise<PushbulletChannel> {
    return this.makeRequest<PushbulletChannel>(`/channel-info?tag=${tag}`);
  }

  // Subscriptions
  async getSubscriptions(): Promise<PushbulletSubscription[]> {
    const response = await this.makeRequest<PushbulletApiResponse<PushbulletSubscription>>('/subscriptions');
    return response.subscriptions || [];
  }

  async subscribeToChannel(channelTag: string): Promise<PushbulletSubscription> {
    return this.makeRequest<PushbulletSubscription>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ channel_tag: channelTag }),
    });
  }

  async unsubscribeFromChannel(iden: string): Promise<void> {
    await this.makeRequest(`/subscriptions/${iden}`, {
      method: 'DELETE',
    });
  }

  // SMS
  async getSmsThreads(deviceIden: string): Promise<any[]> {
    try {
      // Try the texts endpoint first
      const response = await this.makeRequest<PushbulletApiResponse<any>>(`/texts?device_iden=${deviceIden}`);
      return response.texts || [];
    } catch (error) {
      console.log('Texts endpoint failed, trying pushes endpoint for SMS:', error);
      try {
        // Fallback to pushes endpoint and filter for SMS
        const pushesResponse = await this.makeRequest<PushbulletApiResponse<any>>('/pushes');
        const smsPushes = (pushesResponse.pushes || []).filter((push: any) => 
          push.type === 'sms' || 
          push.source_device_iden === deviceIden ||
          push.target_device_iden === deviceIden
        );
        return smsPushes;
      } catch (fallbackError) {
        console.error('Both SMS endpoints failed:', fallbackError);
        return [];
      }
    }
  }

  async sendSms(deviceIden: string, addresses: string[], message: string): Promise<any> {
    return this.makeRequest('/texts', {
      method: 'POST',
      body: JSON.stringify({
        device_iden: deviceIden,
        addresses,
        message,
      }),
    });
  }

  // File Upload
  async uploadFile(file: File): Promise<{ file_name: string; file_type: string; file_url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/upload-request`, {
      method: 'POST',
      headers: {
        'Access-Token': this.apiToken!,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    return response.json();
  }

  // WebSocket Connection
  connect() {
    if (!this.apiToken) {
      throw new Error('No API token provided');
    }

    this.wsConnection = new WebSocket(`wss://stream.pushbullet.com/websocket/${this.apiToken}`);

    this.wsConnection.onopen = () => {
      console.log('WebSocket connected');
      this.emit('connected');
    };

    this.wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit('message', data);
        
        if (data.type === 'push') {
          this.emit('push', data.push);
          this.showNotification(data.push);
        } else if (data.type === 'tickle') {
          this.emit('tickle', data.subtype);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.wsConnection.onclose = () => {
      console.log('WebSocket disconnected');
      this.emit('disconnected');
    };

    this.wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  // Notification System
  private async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  private async showNotification(push: any) {
    const hasPermission = await this.requestNotificationPermission();
    if (!hasPermission) return;

    let title = 'Pushbullet';
    let body = '';
    let icon = '/vite.svg';

    // Format notification based on push type
    switch (push.type) {
      case 'note':
        title = push.title || 'New Note';
        body = push.body || '';
        break;
      case 'link':
        title = push.title || 'New Link';
        body = push.url || push.body || '';
        break;
      case 'file':
        title = 'New File';
        body = push.file_name || 'File shared';
        break;
      case 'address':
        title = 'New Address';
        body = `${push.name || ''} - ${push.address || ''}`.trim();
        break;
      case 'mirror':
        title = push.title || push.application_name || 'Notification';
        body = push.body || push.text || '';
        icon = push.icon || icon;
        break;
      default:
        title = 'New Push';
        body = push.body || push.title || '';
    }

    // Show notification
    const notification = new Notification(title, {
      body: body.substring(0, 200), // Limit body length
      icon: icon,
      tag: push.iden, // Prevent duplicate notifications
      requireInteraction: false,
      silent: false
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
      
      // If it's a link, open it
      if (push.type === 'link' && push.url) {
        window.open(push.url, '_blank');
      }
    };
  }

  async enableNotifications(): Promise<boolean> {
    return await this.requestNotificationPermission();
  }

  disconnect() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  // Event System
  on(event: string, callback: (data: any) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
}

export const pushbulletAPI = new PushbulletAPI();