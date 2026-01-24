// Common Dropdown component
import React from 'react';

type DropdownProps = {
  options: string[];
  onSelect: (value: string) => void;
};

const Dropdown: React.FC<DropdownProps> = ({ options, onSelect }) => (
  <select onChange={e => onSelect(e.target.value)}>
    {options.map(option => (
      <option key={option} value={option}>{option}</option>
    ))}
  </select>
);

export default Dropdown;
