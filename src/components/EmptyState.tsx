import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex items-center flex-grow bg-gradient-to-r from-[#6877e8] to-[#7c3aed] overflow-y-scroll rounded-[10px] text-center justify-center">
        <h2 className="text-white text-xs md:text-5xl font-light">
          Ask anything about blockchain, cryptocurrency
        </h2>
    </div>
  );
};

export default EmptyState;
