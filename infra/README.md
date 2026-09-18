# StudManager — Kubernetes Deployment

Deploys StudManager as a single container to an existing Kubernetes cluster using Kustomize.

## Prerequisites

| Requirement | Notes |
|---|---|
| `kubectl` + cluster access | Any distribution (k3s, EKS, GKE, …) |
| `kustomize` ≥ 5 or `kubectl` ≥ 1.27 | `kubectl apply -k` includes kustomize |
| Ingress-NGINX controller | `ingressClassName: nginx` used |
| (Optional) cert-manager | For automatic TLS certificates |
| GitHub Container Registry access | Image published via CI pipeline |

---

## Step 1 — Configure secrets

```bash
cp infra/secrets.env.example infra/secrets.env
```

Edit `infra/secrets.env` with real values:

```env
PASSWORD_HASH=<base64-sha256 of your password>
JWT_SECRET=<long random string>
```

Generate the values:

```bash
# PASSWORD_HASH — run from project root:
python3 set_password.py
# then copy the resulting PASSWORD_HASH value from backend/.env

# JWT_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`secrets.env` is gitignored and never committed.

---

## Step 2 — Set your image name

Edit `infra/kustomization.yaml` and replace `OWNER` with your GitHub username or organisation:

```yaml
images:
  - name: studmanager
    newName: ghcr.io/OWNER/studmanager   # <-- your GitHub user/org
    newTag: main
```

Or pin a specific release tag:

```bash
cd infra && kustomize edit set image studmanager=ghcr.io/OWNER/studmanager:v1.2.0
```

---

## Step 3 — Set your hostname

Edit `infra/ingress.yaml` and replace both occurrences of `studmanager.example.com` with your actual domain.

---

## Step 4 — (Optional) TLS with cert-manager

If cert-manager is installed, add the issuer annotation to `infra/ingress.yaml`:

```yaml
metadata:
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod   # or your issuer name
```

cert-manager will then automatically provision the certificate into the `studmanager-tls` secret referenced in the `tls:` block.

Without cert-manager, either remove the `tls:` section from `ingress.yaml` (HTTP only) or create the TLS secret manually:

```bash
kubectl create secret tls studmanager-tls \
  --cert=fullchain.pem \
  --key=privkey.pem \
  -n studmanager
```

---

## Step 5 — Apply

```bash
kubectl apply -k infra/
```

Kustomize will create in order:
1. `Namespace` — `studmanager`
2. `PersistentVolumeClaim` — 1 Gi volume for `tasks.json` / `events.json`
3. `Secret` — generated from `secrets.env`
4. `Deployment` — single replica, mounts the PVC at `/app/backend/data`
5. `Service` — ClusterIP, port 80 → 3001
6. `Ingress` — routes your hostname to the service

---

## Step 6 — Verify

```bash
# Watch rollout
kubectl rollout status deployment/studmanager -n studmanager

# Check all resources
kubectl get all,ingress,pvc,secret -n studmanager

# View logs
kubectl logs -n studmanager -l app=studmanager -f
```

Navigate to your configured hostname — you should land on the login page.

---

## Updating to a new image

```bash
# Point to a new tag
cd infra && kustomize edit set image studmanager=ghcr.io/OWNER/studmanager:v1.2.0

# Re-apply
kubectl apply -k infra/

# Watch rollout
kubectl rollout status deployment/studmanager -n studmanager
```

---

## Teardown

```bash
kubectl delete -k infra/
```

The PVC (and its data) is **not** deleted by this command. To also remove the data volume:

```bash
kubectl delete pvc studmanager-data -n studmanager
```
