// Common Card component
import React from 'react';

type CardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

const Card: React.FC<CardProps> = ({ children, style }) => (
  <div style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '8px', padding: '16px', ...style }}>{children}</div>
);

export default Card;
