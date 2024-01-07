import React from "react";
import { Panel } from "reactflow";

const BackgroundPanel = ({ addNode, gap, setGap, setVariant }) => {
  return (
    <Panel position="top-left">
      <button onClick={addNode}>Add Node</button>
      <div>
        gap: <input type="number" value={gap} onChange={(e) => setGap(e.target.value)} />
      </div>
      <button onClick={() => setVariant("dots")}>dots</button>
      <button onClick={() => setVariant("lines")}>lines</button>
      <button onClick={() => setVariant("cross")}>cross</button>
    </Panel>
  );
};

export default BackgroundPanel;
