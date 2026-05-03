import { Routes, Route } from "react-router-dom";
import { MainLayout } from "./component/layout/MainLayout";
import MocSessions from "./pages/MocSessions";
import Home from "./pages/Home";
// import JobMatch from "./pages/JobMatch";

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/moc-sessions" element={<MocSessions />} />
        {/* <Route path="/job-match" element={<JobMatch />} /> */}
      </Routes>
    </MainLayout>
  );
}

export default App;