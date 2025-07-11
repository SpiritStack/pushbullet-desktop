import React, { useState, useEffect } from 'react';
import { pushbulletAPI } from './services/pushbullet';
import AuthForm from './components/AuthForm';
import Sidebar from './components/Sidebar';
import PushCard from './components/PushCard';
import ComposeForm from './components/ComposeForm';
import DevicesList from './components/DevicesList';
import ContactsList from './components/ContactsList';
import SmsInterface from './components/SmsInterface';
import ChannelsList from './components/ChannelsList';
import { 
  PushbulletUser, 
  PushbulletPush, 
  PushbulletDevice, 
  PushbulletContact,
  PushbulletChannel,
  PushbulletSubscription,
  CreatePushData
} from './types/pushbullet';

function App() {
  const [user, setUser] = useState<PushbulletUser | null>(null);
  const [authError, setAuthError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pushes');
  const [pushes, setPushes] = useState<PushbulletPush[]>([]);
  const [devices, setDevices] = useState<PushbulletDevice[]>([]);
  const [contacts, setContacts] = useState<PushbulletContact[]>([]);
  const [channels, setChannels] = useState<PushbulletChannel[]>([]);
  const [subscriptions, setSubscriptions] = useState<PushbulletSubscription[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = pushbulletAPI.getApiToken();
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
      setupWebSocket();
    }
  }, [user]);

  const verifyToken = async (token: string) => {
    try {
      pushbulletAPI.setApiToken(token);
      const userData = await pushbulletAPI.verifyToken();
      setUser(userData);
      setAuthError('');
    } catch (error) {
      setAuthError('Invalid API token. Please check your token and try again.');
      pushbulletAPI.clearApiToken();
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [pushesData, devicesData, contactsData, subscriptionsData] = await Promise.all([
        pushbulletAPI.getPushes(),
        pushbulletAPI.getDevices(),
        pushbulletAPI.getContacts(),
        pushbulletAPI.getSubscriptions()
      ]);
      
      setPushes(pushesData.pushes);
      setDevices(devicesData.filter(d => d.active));
      setContacts(contactsData.filter(c => c.active));
      setSubscriptions(subscriptionsData.filter(s => s.active));
      
      // Count unread pushes
      const unread = pushesData.pushes.filter(p => !p.dismissed).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const setupWebSocket = () => {
    pushbulletAPI.on('push', (push: PushbulletPush) => {
      setPushes(prev => [push, ...prev]);
      if (!push.dismissed) {
        setUnreadCount(prev => prev + 1);
      }
    });

    pushbulletAPI.on('tickle', (subtype: string) => {
      if (subtype === 'push') {
        loadData();
      }
    });

    pushbulletAPI.connect();
  };

  const handleEnableNotifications = async () => {
    const enabled = await pushbulletAPI.enableNotifications();
    if (enabled) {
      console.log('Notifications enabled');
    } else {
      console.log('Notifications denied or not supported');
    }
  };

  const handleLogout = () => {
    pushbulletAPI.clearApiToken();
    setUser(null);
    setPushes([]);
    setDevices([]);
    setContacts([]);
    setUnreadCount(0);
  };

  const handleSendPush = async (data: CreatePushData) => {
    try {
      await pushbulletAPI.createPush(data);
      // Refresh pushes
      const pushesData = await pushbulletAPI.getPushes();
      setPushes(pushesData.pushes);
    } catch (error) {
      console.error('Error sending push:', error);
    }
  };

  const handleDismissPush = async (iden: string) => {
    try {
      await pushbulletAPI.dismissPush(iden);
      setPushes(prev => prev.map(p => 
        p.iden === iden ? { ...p, dismissed: true } : p
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      // If push is already dismissed/deleted on server, sync local state
      if (error instanceof Error && error.message.includes('Object not found')) {
        setPushes(prev => prev.map(p => 
          p.iden === iden ? { ...p, dismissed: true } : p
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        console.error('Error dismissing push:', error);
      }
    }
  };

  const handleDeletePush = async (iden: string) => {
    try {
      await pushbulletAPI.deletePush(iden);
      setPushes(prev => prev.filter(p => p.iden !== iden));
      setUnreadCount(prev => {
        const push = pushes.find(p => p.iden === iden);
        return push && !push.dismissed ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      // If push is already deleted on server, sync local state
      if (error instanceof Error && error.message.includes('Object not found')) {
        setPushes(prev => prev.filter(p => p.iden !== iden));
        setUnreadCount(prev => {
          const push = pushes.find(p => p.iden === iden);
          return push && !push.dismissed ? Math.max(0, prev - 1) : prev;
        });
      } else {
        console.error('Error deleting push:', error);
      }
    }
  };

  const handleCreateDevice = async (nickname: string) => {
    try {
      const device = await pushbulletAPI.createDevice(nickname);
      setDevices(prev => [...prev, device]);
    } catch (error) {
      console.error('Error creating device:', error);
    }
  };

  const handleUpdateDevice = async (iden: string, data: Partial<PushbulletDevice>) => {
    try {
      const device = await pushbulletAPI.updateDevice(iden, data);
      setDevices(prev => prev.map(d => d.iden === iden ? device : d));
    } catch (error) {
      console.error('Error updating device:', error);
    }
  };

  const handleDeleteDevice = async (iden: string) => {
    try {
      await pushbulletAPI.deleteDevice(iden);
      setDevices(prev => prev.filter(d => d.iden !== iden));
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };

  const handleCreateContact = async (name: string, email: string) => {
    try {
      const contact = await pushbulletAPI.createContact(name, email);
      setContacts(prev => [...prev, contact]);
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  };

  const handleUpdateContact = async (iden: string, data: Partial<PushbulletContact>) => {
    try {
      const contact = await pushbulletAPI.updateContact(iden, data);
      setContacts(prev => prev.map(c => c.iden === iden ? contact : c));
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDeleteContact = async (iden: string) => {
    try {
      await pushbulletAPI.deleteContact(iden);
      setContacts(prev => prev.filter(c => c.iden !== iden));
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    return await pushbulletAPI.uploadFile(file);
  };

  const handleLoadSmsThreads = async (deviceIden: string) => {
    return await pushbulletAPI.getSmsThreads(deviceIden);
  };

  const handleSendSms = async (deviceIden: string, addresses: string[], message: string) => {
    return await pushbulletAPI.sendSms(deviceIden, addresses, message);
  };

  const handleGetChannels = async () => {
    const channelsData = await pushbulletAPI.getChannels();
    setChannels(channelsData);
    return channelsData;
  };

  const handleGetSubscriptions = async () => {
    const subscriptionsData = await pushbulletAPI.getSubscriptions();
    setSubscriptions(subscriptionsData.filter(s => s.active));
    return subscriptionsData.filter(s => s.active);
  };

  const handleSubscribeToChannel = async (channelTag: string) => {
    await pushbulletAPI.subscribeToChannel(channelTag);
    await handleGetSubscriptions();
  };

  const handleUnsubscribeFromChannel = async (iden: string) => {
    await pushbulletAPI.unsubscribeFromChannel(iden);
    await handleGetSubscriptions();
  };

  const handleGetChannelInfo = async (tag: string) => {
    return await pushbulletAPI.getChannelInfo(tag);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuth={verifyToken} error={authError} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'pushes':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Pushes</h2>
              <button
                onClick={() => setActiveTab('compose')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Compose
              </button>
            </div>
            <div className="space-y-4">
              {pushes.map((push) => (
                <PushCard
                  key={push.iden}
                  push={push}
                  onDismiss={handleDismissPush}
                  onDelete={handleDeletePush}
                />
              ))}
            </div>
            {pushes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No pushes yet. Start by composing your first push!</p>
              </div>
            )}
          </div>
        );
      
      case 'compose':
        return (
          <ComposeForm
            devices={devices}
            contacts={contacts}
            onSendPush={handleSendPush}
            onUploadFile={handleFileUpload}
          />
        );
      
      case 'devices':
        return (
          <DevicesList
            devices={devices}
            onCreateDevice={handleCreateDevice}
            onUpdateDevice={handleUpdateDevice}
            onDeleteDevice={handleDeleteDevice}
          />
        );
      
      case 'contacts':
        return (
          <ContactsList
            contacts={contacts}
            onCreateContact={handleCreateContact}
            onUpdateContact={handleUpdateContact}
            onDeleteContact={handleDeleteContact}
          />
        );
      
      case 'channels':
        return (
          <ChannelsList
            onGetChannels={handleGetChannels}
            onGetSubscriptions={handleGetSubscriptions}
            onSubscribeToChannel={handleSubscribeToChannel}
            onUnsubscribeFromChannel={handleUnsubscribeFromChannel}
            onGetChannelInfo={handleGetChannelInfo}
          />
        );
      
      case 'sms':
        return (
          <SmsInterface
            devices={devices}
            onSendSms={handleSendSms}
            onLoadSmsThreads={handleLoadSmsThreads}
          />
        );
      
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{user.name}</p>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      Enable desktop notifications to receive push notifications even when the app is in the background.
                    </p>
                    <button
                      onClick={handleEnableNotifications}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Enable Notifications
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        unreadCount={unreadCount}
      />
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;