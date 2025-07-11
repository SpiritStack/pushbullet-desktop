import React, { useState, useEffect } from 'react';
import { Radio, Plus, Search, Bell, BellOff, ExternalLink, Users } from 'lucide-react';
import { PushbulletChannel, PushbulletSubscription } from '../types/pushbullet';

interface ChannelsListProps {
  onGetChannels: () => Promise<PushbulletChannel[]>;
  onGetSubscriptions: () => Promise<PushbulletSubscription[]>;
  onSubscribeToChannel: (channelTag: string) => Promise<void>;
  onUnsubscribeFromChannel: (iden: string) => Promise<void>;
  onGetChannelInfo: (tag: string) => Promise<PushbulletChannel>;
}

const ChannelsList: React.FC<ChannelsListProps> = ({
  onGetChannels,
  onGetSubscriptions,
  onSubscribeToChannel,
  onUnsubscribeFromChannel,
  onGetChannelInfo
}) => {
  const [channels, setChannels] = useState<PushbulletChannel[]>([]);
  const [subscriptions, setSubscriptions] = useState<PushbulletSubscription[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newChannelTag, setNewChannelTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'subscribed' | 'discover'>('subscribed');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [channelsData, subscriptionsData] = await Promise.all([
        onGetChannels(),
        onGetSubscriptions()
      ]);
      setChannels(channelsData);
      setSubscriptions(subscriptionsData);
    } catch (error) {
      console.error('Error loading channels data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (channelTag: string) => {
    try {
      await onSubscribeToChannel(channelTag);
      await loadData();
    } catch (error) {
      console.error('Error subscribing to channel:', error);
    }
  };

  const handleUnsubscribe = async (iden: string) => {
    try {
      await onUnsubscribeFromChannel(iden);
      await loadData();
    } catch (error) {
      console.error('Error unsubscribing from channel:', error);
    }
  };

  const handleAddChannel = async () => {
    if (!newChannelTag.trim()) return;
    
    try {
      const channelInfo = await onGetChannelInfo(newChannelTag.trim());
      await handleSubscribe(channelInfo.tag);
      setNewChannelTag('');
    } catch (error) {
      console.error('Error adding channel:', error);
    }
  };

  const isSubscribed = (channelTag: string) => {
    return subscriptions.some(sub => sub.channel.tag === channelTag);
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.channel.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.channel.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Channels</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('subscribed')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'subscribed'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Subscribed ({subscriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'discover'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Discover
        </button>
      </div>

      {/* Add Channel Form */}
      {activeTab === 'discover' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Subscribe to Channel</h3>
          <div className="flex space-x-4">
            <input
              type="text"
              value={newChannelTag}
              onChange={(e) => setNewChannelTag(e.target.value)}
              placeholder="Enter channel tag (e.g., 'techcrunch')"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddChannel}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Subscribe</span>
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {activeTab === 'subscribed' ? (
            filteredSubscriptions.length > 0 ? (
              filteredSubscriptions.map((subscription) => (
                <div
                  key={subscription.iden}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        {subscription.channel.image_url ? (
                          <img
                            src={subscription.channel.image_url}
                            alt={subscription.channel.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <Radio className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {subscription.channel.name}
                          </h3>
                          <span className="text-sm text-gray-500">
                            @{subscription.channel.tag}
                          </span>
                          {subscription.muted && (
                            <BellOff className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">
                          {subscription.channel.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            Subscribed {new Date(subscription.created * 1000).toLocaleDateString()}
                          </span>
                          {subscription.channel.website_url && (
                            <a
                              href={subscription.channel.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-500"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Website</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUnsubscribe(subscription.iden)}
                        className="px-4 py-2 text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                      >
                        Unsubscribe
                      </button>
                    </div>
                  </div>
                  
                  {/* Recent Pushes */}
                  {subscription.channel.recent_pushes && subscription.channel.recent_pushes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Updates</h4>
                      <div className="space-y-2">
                        {subscription.channel.recent_pushes.slice(0, 3).map((push, index) => (
                          <div key={index} className="text-sm text-gray-600 truncate">
                            {push.title || push.body}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Radio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions yet</h3>
                <p className="text-gray-500 mb-4">
                  Subscribe to channels to receive updates from your favorite sources
                </p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Discover Channels
                </button>
              </div>
            )
          ) : (
            // Discover tab content
            <div className="text-center py-12">
              <Radio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Discover Channels</h3>
              <p className="text-gray-500 mb-4">
                Enter a channel tag above to subscribe to new channels
              </p>
              <div className="text-sm text-gray-500">
                <p>Popular channels to try:</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {['techcrunch', 'reddit-programming', 'hacker-news', 'github-trending'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setNewChannelTag(tag)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChannelsList;