import React from "react";
import { Panel, useReactFlow } from "reactflow";

const ControlPanel = () => {
  const { zoomIn, zoomOut } = useReactFlow();
  return (
    <Panel position="bottom-left">
      <button onClick={() => zoomIn({ duration: 800 })}>zoom in</button>
      <button onClick={() => zoomOut({ duration: 800 })}>zoom out</button>
    </Panel>
  );
};

export default ControlPanel;
