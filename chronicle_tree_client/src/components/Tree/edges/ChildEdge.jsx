import { Line } from '@visx/shape';

const ChildEdge = ({ sourceX, sourceY, targetX, targetY, style = {}, ...props }) => (
  <Line
    from={{ x: sourceX, y: sourceY }}
    to={{ x: targetX, y: targetY }}
    stroke="#27AE60"
    strokeWidth={3}
    strokeDasharray="4 2"
    {...style}
    {...props}
  />
);

export default ChildEdge;
