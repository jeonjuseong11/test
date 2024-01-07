import { memo } from "react";
import { Handle, Position, NodeToolbar, NodeResizer } from "reactflow";

const CustomNode = ({ data, selected }) => {
  return (
    <>
      <NodeResizer minWidth={100} minHeight={30} isVisible={selected} />
      <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
        <button onClick={data.onDelete}>삭제</button>
        <button onClick={data.onCopy}>복사</button>
      </NodeToolbar>
      <div
        style={{
          minWidth: "100px",
          minHeight: "30px",
          padding: "10px",
          display: "flex",
          alignItems: "center",
          height: "100%",
          boxSizing: "border-box",
          justifyContent: "center",
        }}
      >
        {data.label}
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  );
};

export default memo(CustomNode);
