import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import OtpVerify from "./pages/OtpVerify";
import Upload from "./pages/Upload";
import SendSuccess from "./pages/SendSuccess";
import Download from "./pages/Download";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTransfers from "./pages/AdminTransfers";
import AdminTransferDetail from "./pages/AdminTransferDetail";
import AdminAuditLog from "./pages/AdminAuditLog";
import AdminSettings from "./pages/AdminSettings";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/verify" element={<OtpVerify />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/sent" element={<SendSuccess />} />
      <Route path="/d/:token" element={<Download />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="transfers" element={<AdminTransfers />} />
        <Route path="transfers/:id" element={<AdminTransferDetail />} />
        <Route path="audit-log" element={<AdminAuditLog />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
