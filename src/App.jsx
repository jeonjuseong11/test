import { ReactFlowProvider } from "reactflow";
import "./App.css";
import Flow from "./components/Flow";

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
