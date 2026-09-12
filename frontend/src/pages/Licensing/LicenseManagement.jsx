import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import licenseService from "../../services/licensing/licenseService";

const LicenseManagement = () => {
  const token = useSelector((state) => state.auth?.token) || localStorage.getItem("accessToken");
  const user = useSelector((state) => state.auth?.user) || (() => { try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; } })();
  const tenantId = user?.pharmacy_id || user?.pharmacyId || "";
  const [licenseKey, setLicenseKey] = useState("");
  const [status, setStatus] = useState(null);
  const [provisioned, setProvisioned] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [a, b] = await Promise.all([licenseService.status(token, tenantId), licenseService.provisioned(token, tenantId)]);
      setStatus(a.data); setProvisioned(b.data); setMessage("");
    } catch (e) { setMessage(e.response?.data?.detail || "Unable to read license status"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [token, tenantId]);

  const bootstrap = async () => {
    setLoading(true); setMessage("");
    try { const r = await licenseService.bootstrap(token, tenantId); setStatus(r.data.license); setProvisioned(null); setMessage("License verified and this device was activated."); }
    catch (e) { setMessage(e.response?.data?.detail || "Automatic activation failed"); }
    finally { setLoading(false); }
  };

  const activateByKey = async () => {
    if (!licenseKey.trim()) return;
    setLoading(true); setMessage("");
    try { const r = await licenseService.activateByKey(token, licenseKey, tenantId); setStatus(r.data.license); setLicenseKey(""); setProvisioned(null); setMessage("License activated successfully."); }
    catch (e) { setMessage(e.response?.data?.detail || "License activation failed"); }
    finally { setLoading(false); }
  };

  const deactivate = async () => {
    setLoading(true); setMessage("");
    try { const r = await licenseService.deactivate(token, tenantId); setStatus(r.data.license); setMessage("This device has been deactivated."); }
    catch (e) { setMessage(e.response?.data?.detail || "Deactivation failed"); }
    finally { setLoading(false); }
  };

  const active = status?.status === "active";
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div><h1 className="text-2xl font-bold">MEDORAX ERP License</h1><p className="text-sm opacity-70">Secure license activation and device management.</p></div>
      {active ? (
        <div className="rounded-2xl border p-6 space-y-5">
          <div className="flex items-center justify-between gap-4"><div><div className="text-xs opacity-60">License status</div><div className="text-xl font-semibold capitalize">{status.status}</div></div><div className="rounded-full px-4 py-2 border text-sm">Device activated</div></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><div className="text-xs opacity-60">License key</div><div className="font-mono text-sm break-all">{status.license_id || "—"}</div></div>
            <div><div className="text-xs opacity-60">Plan</div><div>{status.plan || "—"}</div></div>
            <div><div className="text-xs opacity-60">Expires</div><div>{status.expires_at ? new Date(status.expires_at).toLocaleString() : "—"}</div></div>
            <div><div className="text-xs opacity-60">Devices</div><div>{status.max_devices ? `1 / ${status.max_devices}` : "—"}</div></div>
          </div>
          <div><div className="text-xs opacity-60">Enabled modules</div><div className="mt-1">{status.modules?.length ? status.modules.join(", ") : "—"}</div></div>
          <button disabled={loading} onClick={deactivate} className="rounded-xl border px-5 py-3 disabled:opacity-50">Deactivate this device</button>
        </div>
      ) : (
        <>
          {provisioned?.status === "provisioned" && <div className="rounded-2xl border p-6 space-y-4"><div><h2 className="text-lg font-semibold">License ready</h2><p className="text-sm opacity-70">Your organization was provisioned by MEDORAX. Activate this device to continue.</p></div><div className="grid gap-4 sm:grid-cols-2"><div><div className="text-xs opacity-60">License key</div><div className="font-mono text-sm break-all">{provisioned.license_id}</div></div><div><div className="text-xs opacity-60">Plan</div><div>{provisioned.plan || "—"}</div></div></div><button disabled={loading} onClick={bootstrap} className="rounded-xl px-5 py-3 bg-primary text-white disabled:opacity-50">Activate this device</button></div>}
          <div className="rounded-2xl border p-6 space-y-4"><div><h2 className="text-lg font-semibold">Enter license key</h2><p className="text-sm opacity-70">Enter the MEDORAX license key supplied by MEDORAX. The signed license is retrieved securely and verified before activation.</p></div><input className="w-full rounded-xl border p-3 font-mono uppercase" value={licenseKey} onChange={(e) => setLicenseKey(e.target.value.toUpperCase())} onKeyDown={(e) => { if (e.key === "Enter") activateByKey(); }} placeholder="MEDX-XXXXXXXXXXXXXXXXXXXX" autoComplete="off" spellCheck="false"/><button disabled={loading || !token || licenseKey.trim().length < 4} onClick={activateByKey} className="rounded-xl px-5 py-3 bg-primary text-white disabled:opacity-50">Activate license</button></div>
        </>
      )}
      <button disabled={loading} onClick={load} className="rounded-xl border px-5 py-3 disabled:opacity-50">Refresh status</button>
      {message && <div className="rounded-xl border p-4 text-sm">{message}</div>}
    </div>
  );
};
export default LicenseManagement;
