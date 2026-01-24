import React from 'react';
import type { NodeProps } from 'reactflow';

const MessageNode: React.FC<NodeProps> = ({ data }) => {
    return (
        <div className="p-4 bg-white rounded shadow border">
            <strong>{data.label}</strong>
            <div>{data.content}</div>
        </div>
    );
};

export default MessageNode;