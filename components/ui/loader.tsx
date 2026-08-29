import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-5',
    lg: 'w-16 h-16 border-6'
  };

  return (
    <span 
      className={`loader ${sizeClasses[size]} ${className}`}
      style={{
        border: '5px solid #FFF',
        borderBottomColor: '#FF3D00',
        borderRadius: '50%',
        display: 'inline-block',
        boxSizing: 'border-box',
        animation: 'rotation 1s linear infinite',
        margin: '0 auto'
      }}
    />
  );
};

export default Loader;
