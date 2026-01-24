// Common Avatar component
import React from 'react';

type AvatarProps = {
  src: string;
  alt?: string;
  size?: number;
};

const Avatar: React.FC<AvatarProps> = ({ src, alt = '', size = 40 }) => (
  <img src={src} alt={alt} width={size} height={size} style={{ borderRadius: '50%' }} />
);

export default Avatar;
