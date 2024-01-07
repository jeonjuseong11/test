import React from "react";

export default function LightningEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
}) {
  // 번개 모양을 위한 SVG 패스
  // 번개의 각 선분을 정의합니다.
  const lightningPath = `M ${sourceX} ${sourceY} L ${sourceX + 20} ${sourceY + 30} L ${
    sourceX + 10
  } ${sourceY + 30} L ${sourceX + 30} ${sourceY + 60} L ${targetX} ${targetY}`;

  return (
    <g className="react-flow__edge react-flow__edge-path">
      <path id={id} d={lightningPath} style={style} markerEnd={markerEnd} />
      {/* 필요한 경우, 라벨 및 기타 요소를 여기에 추가합니다. */}
    </g>
  );
}
