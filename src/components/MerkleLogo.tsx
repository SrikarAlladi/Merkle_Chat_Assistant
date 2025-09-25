import React from 'react';

interface MerkleLogoProps {
  className?: string;
  width?: number;
  height?: number;
  fontSize?: string;
}

const MerkleLogo: React.FC<MerkleLogoProps> = ({ fontSize = "1.5rem", className = "", width = 140, height = 22 }) => {
  return (
    <div className='flex gap-2 items-center'>
      <img style={{mixBlendMode: "multiply", filter: "sepia(1) hue-rotate(190deg) saturate(500%)"
}} src="https://media.licdn.com/dms/image/v2/C4D0BAQHFxutEiRHN_A/company-logo_200_200/company-logo_200_200/0/1630574259475/merklescience_logo?e=2147483647&v=beta&t=h4KZWGr8jl58Qm5CywaiEOiBGgG1s7hxWvrIpZRV9sA" alt="Merkle Logo" className={className} width={width} height={height} />
      <span className={`text-white text-[${fontSize}]`}>MERKLE SCIENCE</span>
    </div>
  )
}

export default MerkleLogo;