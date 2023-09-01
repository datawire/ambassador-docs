# WebSocket connections

$productName$ makes it easy to access your services from outside your
application, and this includes services that use WebSockets.  Only a
small amount of additional configuration is required, which is as
simple as telling the Mapping to allow "upgrading" from the HTTP protocol to
the "websocket" protocol:

```yaml
allow_upgrade:
- websocket
```

## Example WebSocket service

The example configuration below demonstrates the addition of the `allow_upgrade:` attribute to support websockets. The use of `use_websocket` is now deprecated.

```yaml
---
apiVersion: getambassador.io/v3alpha1
kind: Mapping
metadata:
  name: my-service-mapping
spec:
  hostname: "*"
  prefix: /my-service/
  service: my-service
  allow_upgrade:
  - websocket

---
kind: Service
apiVersion: v1
metadata:
  name: my-service
spec:
  selector:
    app: MyApp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 9376
```
