import React from "react";

const edgeTypeOptions = [
  {
    value: "smoothstep",
    label: "Smoothstep",
  },
  {
    value: "step",
    label: "Step",
  },
  {
    value: "default",
    label: "Bezier (default)",
  },
  {
    value: "straight",
    label: "Straight",
  },
];

function EdgeTypeSelect({ value, onChange }) {
  return (
    <div className="custom-node__select">
      <div>Edge Type</div>
      <select className="nodrag" onChange={onChange} value={value}>
        {edgeTypeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
export default EdgeTypeSelect;
