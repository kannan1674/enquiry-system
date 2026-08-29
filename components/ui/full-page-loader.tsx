import React from 'react';
import Loader from './loader';

interface FullPageLoaderProps {
  isVisible: boolean;
  message?: string;
}

const FullPageLoader: React.FC<FullPageLoaderProps> = ({ isVisible, message = 'Loading...' }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-lg">
        <Loader size="lg" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default FullPageLoader;
