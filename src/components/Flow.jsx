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

const initialNodes = [];

const initialEdges = [];
const nodeTypes = {
  CustomNode,
};

export default function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  //노드의 전체 개수
  const [nodeIdCounter, setNodeIdCounter] = useState(initialNodes.length);

  const connectingNodeId = useRef(null);

  const [variant, setVariant] = useState("cross");

  const [gap, setGap] = useState(12);

  const { screenToFlowPosition } = useReactFlow();

  //선택한 노드 상태값
  const [selectedNode, setSelectedNode] = useState(null);
  //이전에 선택된 노드
  const [lastSelectedNodeEdges, setLastSelectedNodeEdges] = useState([]);

  const onSelectionChange = useCallback(
    (elements) => {
      console.log(selectedNode);
      // 이전에 animated 속성이 true로 설정된 엣지들을 원래대로 되돌림
      const currentSelectedNodeId = selectedNode ? selectedNode.id : null;
      const newSelectedNodeId = elements.nodes.length > 0 ? elements.nodes[0].id : null;

      if (currentSelectedNodeId !== newSelectedNodeId) {
        console.log(elements); // 새로운 선택이 있을 때만 로그 출력

        // 이전에 animated 속성이 true로 설정된 엣지들을 원래대로 되돌림
        const resetEdges = lastSelectedNodeEdges.map((edge) => ({
          ...edge,
          animated: false,
          style: { ...edge.style, stroke: "#b1b1b7" },
        }));
        setEdges((eds) => eds.map((edge) => resetEdges.find((re) => re.id === edge.id) || edge));

        if (elements.nodes.length === 0) {
          setSelectedNode(null);
          setLastSelectedNodeEdges([]);
        } else {
          const selected = elements.nodes[0];
          setSelectedNode(selected);

          // 선택된 노드에 연결된 엣지들 찾기
          const connectedEdges = edges.filter(
            (edge) => edge.source === selected.id || edge.target === selected.id
          );

          // 연결된 엣지들의 animated 속성을 true로 설정
          const updatedEdges = connectedEdges.map((edge) => ({
            ...edge,
            animated: true,
            style: { ...edge.style, stroke: "red" }, // 선택된 엣지의 색상 변경
          }));

          setEdges((eds) =>
            eds.map((edge) => updatedEdges.find((ue) => ue.id === edge.id) || edge)
          );
          setLastSelectedNodeEdges(updatedEdges);
        }
      }
    },
    [setSelectedNode, edges, setEdges, lastSelectedNodeEdges, selectedNode]
  );

  //노드 정보 수정
  const updateNodeData = useCallback(
    (nodeId, newData) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const updatedNode = { ...node, data: { ...node.data, ...newData } };
            if (selectedNode && selectedNode.id === nodeId) {
              setSelectedNode(updatedNode);
            }
            return updatedNode;
          }
          return node;
        })
      );
    },
    [setNodes, selectedNode, setSelectedNode]
  );
  //노드 추가 함수
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

  //노드 삭제 함수
  const deleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    },
    [setNodes]
  );
  //노드 복제 함수
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

  //엣지(노드 연결선) 추가 함수
  const onConnect = useCallback((params) => {
    connectingNodeId.current = null;
    setEdges((eds) => addEdge(params, eds));
  }, []);
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

  //node 내부의 삭제, 복제 함수를 전달하기 위한 함수
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
        <Background color="#ccc" variant={variant} gap={gap} />
        <BackgroundPanel addNode={addNode} gap={gap} setGap={setGap} setVariant={setVariant} />
        <ControlPanel />
        {selectedNode !== null && (
          <Panel position="top-right">
            <SelectionDisplay node={selectedNode} updateNodeData={updateNodeData} />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
