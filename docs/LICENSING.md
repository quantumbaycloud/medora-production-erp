# MEDORAX Commercial Licensing

This repository contains the working licensing control plane and ERP-side enforcement. It is separate from onboarding/admin.

## Components

- `licensing-issuer/`: internal license authority. Issues, renews, revokes and validates signed licenses.
- `backend/app/licensing/`: tenant-scoped ERP API for activation, deactivation, status and module entitlements.
- `frontend/src/services/licensing/`: authenticated client for the ERP licensing API.
- `frontend/src/pages/Licensing/LicenseManagement.jsx`: operational license management screen.
- `scripts/generate-license-keys.py`: development-only Ed25519 key generation.

## License lifecycle

`ISSUED -> ACTIVATED -> ACTIVE -> EXPIRED/REVOKED/DEACTIVATED`

The issuer signs canonical JSON with Ed25519. The ERP backend contains only the public verification key. A license is bound to a tenant and a device. The backend stores activation state and periodically asks the issuer for current status.

## API

ERP API:

- `POST /api/licensing/activate`
- `POST /api/licensing/deactivate`
- `POST /api/licensing/validate`
- `POST /api/licensing/refresh`
- `GET /api/licensing/status`
- `GET /api/licensing/modules`

Issuer API (internal/admin):

- `POST /v1/licenses`
- `GET /v1/licenses/{license_id}`
- `POST /v1/licenses/{license_id}/revoke`
- `POST /v1/licenses/{license_id}/renew`
- `POST /v1/activations`
- `POST /v1/activations/deactivate`
- `POST /v1/validate`

Issuer administration endpoints require `X-Issuer-Token`.

## Production requirements

Never commit `private.pem`, issuer tokens, or production credentials. Store the private key in a secret manager/HSM/KMS and mount it read-only. The issuer uses PostgreSQL for persistent state. Keep the issuer on the internal Docker/network segment and do not publish its port through public Nginx.
