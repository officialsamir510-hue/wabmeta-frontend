import React from 'react';
import { Panel } from 'reactflow';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Save, 
  Play,
  RotateCcw
} from 'lucide-react';

interface FlowControlsProps {
  onSave: () => void;
  onTest: () => void;
  onReset: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitView: () => void;
}

const FlowControls: React.FC<FlowControlsProps> = ({
  onSave,
  onTest,
  onReset,
  zoomIn,
  zoomOut,
  fitView
}) => {
  return (
    <>
      <Panel position="top-right" className="bg-white p-2 rounded-xl shadow-lg border border-gray-100 flex space-x-2">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
        <button
          onClick={onTest}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>Test</span>
        </button>
        <button
          onClick={onSave}
          className="flex items-center space-x-2 px-4 py-1.5 text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Flow</span>
        </button>
      </Panel>

      <Panel position="bottom-right" className="bg-white p-1.5 rounded-xl shadow-lg border border-gray-100 flex flex-col space-y-1">
        <button
          onClick={zoomIn}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={zoomOut}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={fitView}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Fit View"
        >
          <Maximize className="w-5 h-5" />
        </button>
      </Panel>
    </>
  );
};

export default FlowControls;