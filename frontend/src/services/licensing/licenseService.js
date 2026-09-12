import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || window.location.origin,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

const auth = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const getDeviceId = () => {
  const key = "medorax.erp.device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `${crypto.randomUUID()}-${Date.now().toString(36)}`;
    localStorage.setItem(key, id);
  }
  return id;
};

const licenseService = {
  status(token, tenantId) { return api.get("/api/licensing/status", { ...auth(token), params: { tenant_id: tenantId, device_id: getDeviceId() } }); },
  provisioned(token, tenantId) { return api.get("/api/licensing/provisioned", { ...auth(token), params: { tenant_id: tenantId } }); },
  activateByKey(token, licenseKey, tenantId) { return api.post("/api/licensing/activate-key", { license_key: licenseKey.trim() }, { ...auth(token), params: { tenant_id: tenantId } }); },
  bootstrap(token, tenantId, deviceName = navigator.userAgent) { return api.post("/api/licensing/bootstrap-device", { device_id: getDeviceId(), device_name: deviceName }, { ...auth(token), params: { tenant_id: tenantId } }); },
  activate(token, envelope, tenantId, deviceName = navigator.userAgent) { return api.post("/api/licensing/activate", { ...envelope, device_id: getDeviceId(), device_name: deviceName }, { ...auth(token), params: { tenant_id: tenantId } }); },
  deactivate(token, tenantId) { return api.post("/api/licensing/deactivate", { device_id: getDeviceId() }, { ...auth(token), params: { tenant_id: tenantId } }); },
  refresh(token, tenantId) { return api.post("/api/licensing/refresh", null, { ...auth(token), params: { tenant_id: tenantId, device_id: getDeviceId() } }); },
};

export default licenseService;
