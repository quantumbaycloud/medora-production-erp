# MEDORAX ERP Production Update Manifest

This package is an updated full-source build based on the supplied ERP project.

## Integration contract

Onboarding remains the control plane. The ERP accepts the existing `POST /internal/erp/provision`
contract using `ERP_PROVISION_TOKEN`. Provisioning stores the onboarding ERP username and Argon2
password hash and installs the exact signed Ed25519 license envelope.

At login:
1. ERP resolves the onboarding-provisioned ERP username, email, or mobile.
2. Credentials are checked against the Argon2 hash.
3. The tenant/pharmacy and provisioned signed license are required.
4. The client installation UUID is activated against `https://api.medorax.in/licensing`.
5. Subsequent requests require the authenticated session's device to have a valid central license.
6. Central issuer outages are allowed only within `LICENSE_OFFLINE_GRACE_HOURS`.
7. Revoked/expired/invalid licenses fail closed.

## Important

- Do not copy a licensing issuer private key into the ERP server.
- Do not put the licensing issuer administration token in the ERP environment.
- Keep `ERP_PROVISION_TOKEN` identical between onboarding Admin API and ERP API.
- Keep the Ed25519 public key identical to the central issuer's signing key.
- Production CORS must explicitly list `https://erp.medorax.in`.
- Review the target database's Alembic state before production rollout; do not destroy an existing database.
