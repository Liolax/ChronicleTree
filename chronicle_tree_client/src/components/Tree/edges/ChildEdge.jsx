import React from 'react';
import { getStraightPath, BaseEdge, EdgeLabelRenderer } from 'reactflow';

const ChildEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ stroke: '#E67E22', strokeWidth: 2.5, ...style }} />
      {/* Optional: Add a label if you want */}
      {/* <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${sourceX + (targetX - sourceX) / 2}px, ${sourceY + (targetY - sourceY) / 2}px)`,
            background: '#ffe5c2',
            padding: 5,
            borderRadius: 5,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          Child Of
        </div>
      </EdgeLabelRenderer> */}
    </>
  );
};

export default ChildEdge;
