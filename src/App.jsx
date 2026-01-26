import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Features from "./pages/Features";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/features" element={<Features />} />
    </Routes>
  );
}
