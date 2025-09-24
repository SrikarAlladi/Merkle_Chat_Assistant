import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex items-center justify-center empty-chat-state">
        <h2 className="text-white text-xs md:text-5xl font-light">
          Ask anything about blockchain, cryptocurrency
        </h2>
    </div>
  );
};

export default EmptyState;
