import type { Vial } from '@/types';
import { getColorHex } from '@/utils';
import React from 'react';

interface VialVisualizerProps {
  vial: Vial;
  onLayerClick?: (position: number) => void;
  interactive?: boolean;
  highlight?: boolean | null;
}

const MAX_VIAL_CAPACITY = 4;

const VialVisualizer: React.FC<VialVisualizerProps> = ({ 
  vial, 
  onLayerClick, 
  interactive = false,
  highlight = false
}) => {
  // Calculate empty layers
  const emptyCount = MAX_VIAL_CAPACITY - vial.length;
  
  // Handle click on a layer
  const handleLayerClick = (position: number) => {
    if (interactive && onLayerClick) {
      onLayerClick(position);
    }
  };

  return (
    <div 
      className={`vial relative flex flex-col-reverse ${highlight ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
      style={{ cursor: interactive ? 'pointer' : 'default' }}
    >
      {/* Color layers at the bottom */}
      {vial.map((color, index) => (
        <div 
          key={`color-${index}`}
          className="color-layer"
          style={{ backgroundColor: getColorHex(color) }}
          onClick={() => handleLayerClick(index)}
        />
      ))}

      {/* Empty layers on top */}
      {Array.from({ length: emptyCount }).map((_, index) => (
        <div 
          key={`empty-${index}`} 
          className="empty-layer border-t border-gray-200"
          onClick={() => handleLayerClick(vial.length + index)}
        />
      ))}
    </div>
  );
};

export default VialVisualizer;