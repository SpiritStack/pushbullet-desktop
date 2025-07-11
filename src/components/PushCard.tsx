import React from 'react';
import { 
  FileText, 
  Link, 
  File, 
  MapPin, 
  Clock,
  X,
  Eye,
  ExternalLink
} from 'lucide-react';
import { PushbulletPush } from '../types/pushbullet';

interface PushCardProps {
  push: PushbulletPush;
  onDismiss: (iden: string) => void;
  onDelete: (iden: string) => void;
}

const PushCard: React.FC<PushCardProps> = ({ push, onDismiss, onDelete }) => {
  const getIcon = () => {
    switch (push.type) {
      case 'note':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'link':
        return <Link className="w-5 h-5 text-green-500" />;
      case 'file':
        return <File className="w-5 h-5 text-purple-500" />;
      case 'address':
        return <MapPin className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp || isNaN(timestamp)) {
      return 'Unknown time';
    }
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) {
      return 'Unknown time';
    }
    return date.toLocaleString();
  };

  const handleLinkClick = () => {
    if (push.url) {
      window.open(push.url, '_blank');
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${
      push.dismissed ? 'opacity-60' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            {push.title && (
              <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                {push.title}
              </h3>
            )}
            {push.body && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                {push.body}
              </p>
            )}
            {push.url && (
              <button
                onClick={handleLinkClick}
                className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-500 mb-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="truncate max-w-xs">{push.url}</span>
              </button>
            )}
            {push.file_name && (
              <div className="flex items-center space-x-2 mb-2">
                <File className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{push.file_name}</span>
                {push.file_url && (
                  <a
                    href={push.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
            {push.name && push.address && (
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{push.name}</div>
                  <div className="text-sm text-gray-600">{push.address}</div>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatTime(push.created)}</span>
              {push.sender_name && (
                <span>• from {push.sender_name}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {!push.dismissed && (
            <button
              onClick={() => onDismiss(push.iden)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Dismiss"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(push.iden)}
            className="p-1 text-gray-400 hover:text-red-600 rounded"
            title="Delete"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PushCard;