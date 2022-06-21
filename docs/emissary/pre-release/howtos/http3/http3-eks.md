---
description: "How to configure HTTP/3 support for Amazon Elastic Kubernetes Service (EKS). This guide shows how to setup the LoadBalancer service for EKS to support both TCP and UDP communications."
---

# Amazon Elastic Kubernetes Service HTTP/3 configuration

TThis guide shows how to setup HTTP/3 support for Amazon Elastic Kubernetes Service (EKS) The instructions provided in this page are a continuation of the [HTTP/3 in $productName$](../../../topics/running/http3) documentation.

## Create a network load balancer (NLB)

 The virtual private cloud (VPC) for your load balancer needs one public subnet in each availability zone where you have targets. 

   ```shell
   SUBNET_IDS=(<your-subnet1-id> <your-subnet2-id> <your-subnet3-id>)

   aws elbv2 create-load-balancer \
     --name ${CLUSTER_NAME}-nlb \
     --type network \
     --subnets ${SUBNET_IDS}
   ```

## Create a NodePort service 

Now create a `NodePort` service for $productName$ installation with two entries. Use `port: 443` to include support for both TCP and UDP traffic.
   ```yaml
   # Selectors and labels removed for clarity.
   apiVersion: v1
   kind: Service
   metadata:
     name: $productDeploymentName$-http3
     namespace: $productNamespace$
   spec:
     type: NodePort
     ports:
     - name: http
       port: 80
       targetPort: 8080
       protocol: TCP
       nodePort: 30080
     - name: https
       port: 443
       targetPort: 8443
       protocol: TCP
       nodePort: 30443
     - name: http3
       port: 443
       targetPort: 8443
       protocol: UDP
       nodePort: 30443
   ```

## Create target groups

Run the following command with the variables for your VPC ID and cluster name:

   ```shell
   VPC_ID=<your-vpc-id>
   CLUSTER_NAME=<your-cluster-name>

   aws elbv2 create-target-group --name ${CLUSTER_NAME}-tcp-tg \
     --protocol TCP --port 30080 --vpc-id ${VPC_ID} \
     --health-check-protocol TCP \
     --health-check-port 30080 \
     --target-type instance

   aws elbv2 create-target-group --name ${CLUSTER_NAME}-tcp-udp-tg \
     --protocol TCP_UDP --port 30443 --vpc-id ${VPC_ID} \
     --health-check-protocol TCP \
     --health-check-port 30443 \
     --target-type instance
   ```

## Register your instances

Next, register your cluster's instance with the the instance IDs and Amazon Resource Names (ARN). 

To get your cluster's instance IDs, enter the following command:
   ```shell
   aws ec2 describe-instances \
     --filters Name=tag:eks:cluster-name,Values=${CLUSTER_NAME} \
     --output text
     --query 'Reservations[*].Instances[*].InstanceId' \
   ```

To get your ARNs, enter the following command:
   ```shell
   TCP_TG_NAME=${CLUSTER_NAME}-tcp-tg-name
   TCP_UDP_TG_NAME=${CLUSTER_NAME}-tcp-udp-tg-name

   aws elbv2 describe-target-groups \
       --query 'TargetGroups[?TargetGroupName==`'${TCP_TG_NAME}'`].TargetGroupArn' \
       --output text
   aws elbv2 describe-target-groups \
    --query 'TargetGroups[?TargetGroupName==`'${TCP_UDP_TG_NAME}'`].   TargetGroupArn' \
       --output text
   ```

Register the instances with the target groups and load balancer using the instance IDs and ARNs you retrieved.
   ```shell
   # from Step - 4
   INSTANCE_IDS=(<Id=i-07826...> <Id=i-082fd...>)
   # from Step - 5
   REGION=<your-region>
   TG_NAME=<your-tg-name>
   TCP_TG_ARN=arn:aws:elasticloadbalancing:${REGION}:079.....:targetgroup/${TG_NAME}/...
   TCP_UDP_TG_ARN=arn:aws:elasticloadbalancing:${REGION}:079.....:targetgroup/${TG_NAME}/...

   aws elbv2 register-targets --target-group-arn ${TCP_TG_ARN} --targets ${INSTANCE_IDS}
   aws elbv2 register-targets --target-group-arn ${TCP_UDP_TG_ARN} --targets ${INSTANCE_IDS}
   ```

## Create listeners in AWS.

Register your cluster's instance with the the instance IDs and ARNs. 

To get the load balancer's ARN, enter the following command:
   ```shell
   aws elbv2 describe-load-balancers --name ${CLUSTER_NAME}-nlb \
     --query 'LoadBalancers[0].LoadBalancerArn' \
     --output text
   ```

Create a TCP listener on port 80 that that forwards to the TargetGroup {TCP_TG_ARN}.
   ```shell
   aws elbv2 create-listener --load-balancer-arn ${LB_ARN} \
     --protocol TCP --port 80 \
     --default-actions Type=forward,TargetGroupArn=${TCP_TG_ARN}
   ```

   Create a TCP_UDP listener on port 443 that forwards to the TargetGroup {TCP_UDP_TG_ARN}.
   ```shell
   aws elbv2 create-listener --load-balancer-arn ${LB_ARN} \
     --protocol TCP_UDP --port 443 \
     --default-actions Type=forward,TargetGroupArn=${TCP_UDP_TG_ARN}
   ```

## Update the security groups 

Now you need to update your security groups to receive traffic. This security group covers all node groups attached to the EKS cluster:
   ```shell
   aws eks describe-cluster --name ${CLUSTER_NAME} | grep clusterSecurityGroupId
   ```

Now authorize the cluster security group to allow internet traffic:
   ```shell
   for x in ${CLUSTER_SG}; do \
     aws ec2 authorize-security-group-ingress --group-id $$x --protocol tcp --port 30080 --cidr 0.0.0.0/0; \
     aws ec2 authorize-security-group-ingress --group-id $$x --protocol tcp --port 30443 --cidr 0.0.0.0/0; \
     aws ec2 authorize-security-group-ingress --group-id $$x --protocol udp --port 30443 --cidr 0.0.0.0/0; \
   done
   ```

## Get the DNS name for the load balancers

Enter the following command to get the DNS name for your load balancers and create a CNAME record at your domain provider:
   ```shell
   aws elbv2 describe-load-balancers --name ${CLUSTER_NAME}-nlb \
     --query 'LoadBalancers[0].DNSName' \
     --output text
   ```

## Create Listener resources 

Now you need to create the `Listener` resources for $productName$. The first `Listener` in the example below handles traffic for HTTP/1.1 and HTTP/2, while the second listener handles all HTTP/3 traffic.

   ```yaml
   kubectl apply -f - <<EOF
   # This is a standard Listener that leverages TCP to serve HTTP/2 and HTTP/1.1 traffic.
   # It is bound to the same address and port (0.0.0.0:8443) as the UDP listener.
   apiVersion: getambassador.io/v3alpha1
   kind: Listener
   metadata:
     name: $productDeploymentName$-https-listener
     namespace: $productNamespace$
   spec:
     port: 8443
     protocol: HTTPS
     securityModel: XFP
     hostBinding:
       namespace:
         from: ALL
   ---
   # This is a Listener that leverages UDP and HTTP to serve HTTP/3 traffic.
   # NOTE: Raw UDP traffic is not supported. UDP and HTTP must be used together.
   apiVersion: getambassador.io/v3alpha1
   kind: Listener
   metadata:
     name: $productDeploymentName$-https-listener-udp
     namespace: $productNamespace$
   spec:
     port: 8443
     # Order is important here. UDP must be the last item, and HTTP is required.
     protocolStack:
       - TLS
       - HTTP
       - UDP
     securityModel: XFP
     hostBinding:
       namespace:
         from: ALL
   EOF
   ```

## Create a Host resource

Create a `Host` resources for your domain name.
   ```yaml
   kubectl apply -f - <<EOF
   apiVersion: getambassador.io/v3alpha1
   kind: Host
   metadata:
     name: $productDeploymentName$-aws-host
     namespace: $productNamespace$
   spec:
     hostname: <your-hostname>
     acmeProvider:
       authority: none
     tlsSecret:
       name: tls-cert # The QUIC network protocol requires TLS with a valid certificate
     tls:
       min_tls_version: v1.3
       max_tls_version: v1.3
       alpn_protocols: h2,http/1.1
   EOF
   ```

## Apply the quote service and a Mapping to test the HTTP/3 configuration.

Finally, apply the quote service to a $productName$ `Mapping`.

   ```shell
   kubectl apply -f https://app.getambassador.io/yaml/v2-docs/$version$/quickstart/qotm.yaml
   kubectl apply -f - <<EOF
   ---
   apiVersion: getambassador.io/v3alpha1
   kind: Mapping
   metadata:
     name: quote-backend
   spec:
     hostname: "*"
     prefix: /backend/
     service: quote
     docs:
       path: "/.ambassador-internal/openapi-docs"
   EOF
   ```

Now verify the connection:

   ```shell
   $ curl -i http://<your-hostname>/backend/
   ```
Your domain now shows that it is being served with HTTP/3.
