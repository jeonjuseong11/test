import React, { useState } from "react";

function SelectionDisplay({ node, updateNodeData }) {
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState(node.data);
  const [propsEditMode, setPropsEditMode] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  if (!node) {
    return null;
  }

  const handleEdit = () => {
    setEditMode(true);
  };
  const handlePropsEdit = () => {
    setPropsEditMode(!propsEditMode);
  };
  const handleSave = () => {
    updateNodeData(node.id, editedData);
    setEditMode(false);
  };

  const handleChange = (key, value) => {
    if (typeof value === "function") {
      return null;
    }
    setEditedData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleAddProperty = () => {
    handleChange(newKey, newValue);
    const updatedData = { ...editedData, [newKey]: newValue };
    setEditedData(updatedData);
    updateNodeData(node.id, updatedData);
    setNewKey("");
    setNewValue("");
  };

  return (
    <div className="slide-panel">
      <h3>Node Information</h3>
      <p>ID: {node.id}</p>
      <p>Type: {node.type}</p>
      <ul>
        <ul>
          {Object.entries(editMode ? editedData : node.data).map(([key, value], index) => {
            // 함수 타입의 값은 렌더링하지 않음
            if (typeof value === "function") {
              return null;
            }

            return (
              <li key={index}>
                {editMode ? (
                  <>
                    <strong>{key}:</strong>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  </>
                ) : (
                  <>
                    <strong>{key}:</strong> {JSON.stringify(value)}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </ul>
      {propsEditMode && (
        <>
          <input
            type="text"
            placeholder="New key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <input
            type="text"
            placeholder="New value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <button onClick={handleAddProperty}>속성 추가</button>
          <button onClick={handlePropsEdit}>속성 추가 취소</button>
        </>
      )}
      {editMode ? (
        <>
          <button onClick={handleSave}>저장</button>
          <button onClick={handleEdit}>취소</button>
          {propsEditMode ? <></> : <button onClick={handlePropsEdit}>속성 추가</button>}
        </>
      ) : (
        <>
          <button onClick={handleEdit}>정보 수정</button>
        </>
      )}
    </div>
  );
}

export default SelectionDisplay;
