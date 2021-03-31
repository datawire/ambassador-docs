# Rollouts CRD

Example YAML:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: example-rollout
spec:
  selector:
    matchLabels:
      app: example
  template:
    metadata:
      labels:
        app: example
    spec:
      containers:
        - image: <your-image-repo>/example-image
          imagePullPolicy: Always
          name: example-v1
          ports:
            - containerPort: 8080
  strategy:
    canary:
      stableService: example-stable  # must match your service name
      canaryService: example-canary  # must match your service name
      trafficRouting:  #required to use Edge Stack for routing
        ambassador:
          mappings:
            - example
      steps:    # describes the strategy for sending traffic to the canary
      - setWeight: 10   # 10% of the traffic will go to the canary until manually promoted
      - pause: {}
      - setWeight: 30   # 30% of the traffic will go to the canary for 30 seconds
      - pause: {duration: 30}
      - setWeight: 60   # 60% of the traffic will go to the canary for 45 seconds   
      - pause: {duration: 45}
      - setWeight: 100  # 100% of the traffic will go to the canary for 10 seconds 
      - pause: {duration: 10}
```