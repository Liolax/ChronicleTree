import { Line } from '@visx/shape';

const ParentEdge = ({ sourceX, sourceY, targetX, targetY, style = {}, ...props }) => (
  <Line
    from={{ x: sourceX, y: sourceY }}
    to={{ x: targetX, y: targetY }}
    stroke="#2D9CDB"
    strokeWidth={3}
    {...style}
    {...props}
  />
);

export default ParentEdge;
