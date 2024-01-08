import React, { useCallback, useRef, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  SelectionMode,
  Panel,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import SelectionDisplay from "./SelectionDisplay";
import CustomNode from "./CustomNode";
import ControlPanel from "./ControlPanel";
import BackgroundPanel from "./BackgroundSettingPanel";
import EdgeTypeSelect from "./EdgeTypeSelector"; // 새로운 EdgeTypeSelect 컴포넌트 추가

const initialNodes = [];

const initialEdges = [];
const nodeTypes = {
  CustomNode,
};

export default function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  // 노드의 전체 개수
  const [nodeIdCounter, setNodeIdCounter] = useState(initialNodes.length);

  const connectingNodeId = useRef(null);

  const [variant, setVariant] = useState("cross");

  const [gap, setGap] = useState(12);

  const { screenToFlowPosition } = useReactFlow();

  // 선택한 엘리먼트 상태값
  const [selectedElements, setSelectedElements] = useState([]);
  // 이전에 선택된 엘리먼트
  const [lastSelectedElements, setLastSelectedElements] = useState([]);
  const [selectedEdgeType, setSelectedEdgeType] = useState("default");

  const onSelectionChange = useCallback(
    (elements) => {
      if (!elements || (!elements.nodes && !elements.edges)) {
        setSelectedElements([]);
        setLastSelectedElements([]);
        return;
      }

      const currentSelectedElementId = selectedElements.length > 0 ? selectedElements[0].id : null;
      const newSelectedElementId =
        elements.nodes?.length > 0
          ? elements.nodes[0].id
          : elements.edges?.length > 0
          ? elements.edges[0].id
          : null;

      if (currentSelectedElementId !== newSelectedElementId) {
        console.log(elements);

        const resetEdges = lastSelectedElements.map((element) => ({
          ...element,
          animated: false,
          style: { ...element.style, stroke: "#b1b1b7" },
        }));
        setEdges((eds) =>
          eds.map((element) => resetEdges.find((re) => re.id === element.id) || element)
        );

        const selectedId =
          elements.nodes?.length > 0
            ? elements.nodes[0].id
            : elements.edges?.length > 0
            ? elements.edges[0].id
            : null;

        const connectedEdges = edges.filter(
          (edge) => edge.source === selectedId || edge.target === selectedId
        );

        const updatedEdges = connectedEdges.map((edge) => ({
          ...edge,
          animated: true,
          style: { ...edge.style, stroke: "red" },
        }));

        setEdges((eds) => eds.map((edge) => updatedEdges.find((ue) => ue.id === edge.id) || edge));
        setLastSelectedElements(updatedEdges);
        setSelectedElements(elements.nodes?.length > 0 ? elements.nodes : elements.edges);
      }
    },
    [edges, setEdges, setLastSelectedElements, selectedElements, lastSelectedElements]
  );
  // 노드 정보 수정
  const updateNodeData = useCallback(
    (nodeId, newData) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const updatedNode = { ...node, data: { ...node.data, ...newData } };
            return updatedNode;
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // 노드 추가 함수
  const addNode = useCallback(() => {
    setNodeIdCounter(nodeIdCounter + 1);

    // 마지막 노드의 위치를 찾음
    const lastNode = nodes[nodes.length - 1];
    let newPosition;
    if (lastNode) {
      // 마지막 노드가 존재하는 경우, 그 위치를 기준으로 새 위치 계산
      newPosition = {
        x: lastNode.position.x + 50, // 예: X축으로 100만큼 이동
        y: lastNode.position.y + 50, // 예: Y축으로 100만큼 이동
      };
    } else {
      // 마지막 노드가 없는 경우, 기본 위치 설정
      newPosition = { x: 0, y: 0 };
    }

    const newNode = {
      id: nodeIdCounter.toString(),
      type: "CustomNode",
      data: { label: `Node ${nodeIdCounter}` },
      position: newPosition,
      style: { background: "#fff", border: "1px solid black", borderRadius: 15, fontSize: 12 },
    };

    setNodes((nds) => nds.concat(newNode));
  }, [nodeIdCounter, setNodes, nodes]);

  // 노드 삭제 함수
  const deleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    },
    [setNodes]
  );

  // 노드 복제 함수
  const copyNode = useCallback(
    (nodeId) => {
      setNodeIdCounter((prev) => prev + 1);
      setNodes((nds) => {
        const nodeToCopy = nds.find((n) => n.id === nodeId);
        if (!nodeToCopy) {
          return nds;
        }
        const copiedNode = {
          ...nodeToCopy,
          id: `${nodeIdCounter}`,
          data: { ...nodeToCopy.data, label: `Copy of ${nodeToCopy.data.label}` },
          position: { x: nodeToCopy.position.x + 30, y: nodeToCopy.position.y + 30 }, // 새 위치를 지정
        };
        return nds.concat(copiedNode);
      });
    },
    [setNodes, nodeIdCounter]
  );

  // 엣지(노드 연결선) 추가 함수
  const onConnect = useCallback(
    (params) => {
      connectingNodeId.current = null;

      // 선택된 선의 타입을 사용하여 엣지 추가
      const edgeStyle =
        selectedEdgeType === "smoothstep"
          ? { type: "smoothstep" }
          : selectedEdgeType === "step"
          ? { type: "step" }
          : selectedEdgeType === "straight"
          ? { type: "straight" }
          : {}; // 기본값은 빈 객체

      const newEdge = {
        ...params,
        style: {
          ...params.style,
          ...edgeStyle, // 선택된 선의 스타일을 엣지의 스타일로 설정
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [selectedEdgeType, setEdges]
  );
  const onConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback(
    (event) => {
      if (!connectingNodeId.current) return;

      const targetIsPane = event.target.classList.contains("react-flow__pane");

      if (targetIsPane) {
        const newNodeId = `${nodeIdCounter}`;

        const newNode = {
          id: newNodeId,
          position: screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          }),
          type: "CustomNode",
          data: { label: `Node ${newNodeId}` },
          origin: [0.5, 0.0],
          style: { background: "#fff", border: "1px solid black", borderRadius: 15, fontSize: 12 },
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({
            id: `e${newNodeId}-${connectingNodeId.current}`,
            source: connectingNodeId.current,
            target: newNodeId,
          })
        );
        setNodeIdCounter(nodeIdCounter + 1);
      }
    },
    [nodeIdCounter, setNodes, setEdges, screenToFlowPosition]
  );

  // 노드 및 엣지 삭제 함수
  const deleteElement = () => {
    const elementsToDelete = selectedElements.map((element) => element.id);
    setNodes((nds) => nds.filter((node) => !elementsToDelete.includes(node.id)));
    setEdges((eds) => eds.filter((edge) => !elementsToDelete.includes(edge.id)));
  };

  // 노드 및 엣지 복제 함수
  const copyElement = () => {
    const elementsToCopy = selectedElements.map((element) => {
      if (element.type === "node") {
        const nodeToCopy = nodes.find((n) => n.id === element.id);
        if (nodeToCopy) {
          return {
            ...nodeToCopy,
            id: `${nodeIdCounter}`,
            data: { ...nodeToCopy.data, label: `Copy of ${nodeToCopy.data.label}` },
            position: { x: nodeToCopy.position.x + 30, y: nodeToCopy.position.y + 30 }, // 새 위치를 지정
          };
        }
      } else if (element.type === "edge") {
        const edgeToCopy = edges.find((e) => e.id === element.id);
        if (edgeToCopy) {
          return {
            ...edgeToCopy,
            id: `e${nodeIdCounter}-${edgeToCopy.source}`,
            source: nodeIdCounter.toString(),
            target:
              edgeToCopy.target === connectingNodeId.current
                ? nodeIdCounter.toString()
                : edgeToCopy.target,
          };
        }
      }
      return null;
    });

    const newNodes = elementsToCopy.filter((element) => element && element.type === "node");
    const newEdges = elementsToCopy.filter((element) => element && element.type === "edge");

    setNodes((nds) => nds.concat(newNodes));
    setEdges((eds) => eds.concat(newEdges));
    setNodeIdCounter(nodeIdCounter + 1);
  };

  const handleEdgeTypeChange = (event) => {
    const newEdgeType = event.target.value;
    setSelectedEdgeType(newEdgeType); // 엣지 타입 상태 업데이트

    // 엣지 타입 변경
    setEdges((edges) =>
      edges.map((edge) => {
        if (selectedElements.find((element) => element.id === edge.id)) {
          return {
            ...edge,
            type: newEdgeType,
          };
        }
        return edge;
      })
    );
  };

  const SelectionPanel = () => {
    console.log(selectedElements);
    const hasEdges = selectedElements.some((element) => element.style.stroke);

    return (
      <Panel position="top-right">
        {selectedElements.map((element) => (
          <div key={element.id}>
            <h4>ID: {element.id}</h4>
            <p>Type: {element.type}</p>
            <button onClick={() => deleteElement(element.id)}>Delete</button>
            <button onClick={() => copyElement(element.id)}>Copy</button>
            <hr />
            {hasEdges && (
              <>
                <label>Select Edge Type:</label>
                <EdgeTypeSelect value={selectedEdgeType} onChange={handleEdgeTypeChange} />
              </>
            )}
          </div>
        ))}
      </Panel>
    );
  };

  const nodesWithProps = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onDelete: () => deleteNode(node.id),
      onCopy: () => copyNode(node.id),
    },
  }));

  return (
    <div style={{ width: "100vw", height: "100vh" }} className="reactflow-wrapper">
      <ReactFlow
        nodes={nodesWithProps}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onSelectionChange={onSelectionChange}
        panOnScroll
        selectionOnDrag
        panOnDrag={[1, 2]}
        selectionMode={SelectionMode.Partial}
        fitView
        nodeTypes={nodeTypes}
        nodeOrigin={[0.5, 0]}
      >
        <MiniMap />
        <Controls />
        <Background color="#ccc" variant={variant} gap={gap} />
        <BackgroundPanel addNode={addNode} gap={gap} setGap={setGap} setVariant={setVariant} />
        <ControlPanel />
        {selectedElements.length > 0 && <SelectionPanel />}
      </ReactFlow>
    </div>
  );
}
