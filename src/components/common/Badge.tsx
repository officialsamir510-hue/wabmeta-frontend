// Common Badge component
import React from 'react';

type BadgeProps = {
  text: string;
  color?: string;
};

const Badge: React.FC<BadgeProps> = ({ text, color = 'gray' }) => (
  <span style={{ backgroundColor: color, padding: '2px 8px', borderRadius: '8px', color: '#fff' }}>{text}</span>
);

export default Badge;
