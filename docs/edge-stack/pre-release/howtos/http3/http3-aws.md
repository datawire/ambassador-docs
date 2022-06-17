
# HTTP/3 in $productName$ 3.x with AWS

This guide outlines the steps required to configure Amazon Elastic Kubernetes Service for HTTP/3 using an existing installation of $productName$.
For an overview of HTTP/3 support in $productName$ and requirements, see [HTTP/3 Overview in $productName$](../../../topics/running/http3)


1. Create a network load balancer (NLB).
   The virtual private cloud (VPC) for your load balancer needs one public subnet in each availability zone where you have targets. You need the public subnets for where you want to add the network load balancer.
   ```shell
   SUBNET_IDS={your-subnet1-id} {your-subnet2-id} {your-subnet3-id}

   aws elbv2 create-load-balancer \
     --name ${CLUSTER_NAME}-nlb \
     --type network \
     --subnets ${SUBNET_IDS}
   ```

2. Create a new `NodePort` service for your $productName$ installation with two entries using `port: 443` in order to support TCP and UDP traffic.
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

3. Run the following command, making sure to set the variables for your VPC ID and cluster name.
   ```shell
   VPC_ID={your-vpc-id}
   CLUSTER_NAME={your-cluster-name}

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

4. Get the cluster's instance IDs.
   ```shell
   aws ec2 describe-instances \
     --filters Name=tag:eks:cluster-name,Values=${CLUSTER_NAME} \
     --output text
     --query 'Reservations[*].Instances[*].InstanceId' \
   ```

5. Get the new target groups' ARNs.
   ```shell
   TCP_TG_NAME=${CLUSTER_NAME}-tcp-tg-name
   TCP_UDP_TG_NAME=${CLUSTER_NAME}-tcp-udp-tg-name

   aws elbv2 describe-target-groups \
       --query 'TargetGroups[?TargetGroupName==`${TCP_TG_NAME}`].TargetGroupArn' \
       --output text
   aws elbv2 describe-target-groups \
       --query 'TargetGroups[?TargetGroupName==`${TCP_UDP_TG_NAME}`].TargetGroupArn' \
       --output text
   ```

6. Register the instances with the target groups and load balancer using the instance IDs and ARNs from the previous steps.
   ```shell
   # from Step - 4
   INSTANCE_IDS={Id=i-07826.....} {Id=i-082fd....}
   # from Step - 5
   TCP_TG_ARN=arn:aws:elasticloadbalancing:{region}:079.....:targetgroup/{tg-name}/...
   TCP_UDP_TG_ARN=arn:aws:elasticloadbalancing:{region}:079.....:targetgroup/{tg-name}/...

   aws elbv2 register-targets --target-group-arn ${TCP_TG_ARN} --targets ${INSTANCE_IDS}
   aws elbv2 register-targets --target-group-arn ${TCP_UDP_TG_ARN} --targets ${INSTANCE_IDS}
   ```

7. Create listeners in AWS.

   Get the load balancer's arn:
   ```shell
   aws elbv2 describe-load-balancers --name ${CLUSTER_NAME}-nlb \
     --query 'LoadBalancers[0].LoadBalancerArn' \
     --output text
   ```

   Create a TCP listener on port 80 that will forward to the TargetGroup {tcp-target-group}:
   ```shell
   aws elbv2 create-listener --load-balancer-arn ${LB_ARN} \
     --protocol TCP --port 80 \
     --default-actions Type=forward,TargetGroupArn=${TCP_TG_ARN}
   ```

   Create a TCP_UDP listener on port 443 that will forward to the TargetGroup {tcp-udp-target-group}:
   ```shell
   aws elbv2 create-listener --load-balancer-arn ${LB_ARN} \
     --protocol TCP_UDP --port 443 \
     --default-actions Type=forward,TargetGroupArn=${TCP_UDP_TG_ARN}
   ```

8. Update the security groups to receive traffic.
   this security group is created by eksctl and covers all the node groups attached to the eks cluster.
   ```shell
   aws eks describe-cluster --name ${CLUSTER_NAME} | grep clusterSecurityGroupId
   ```

   Use the cluster security group in this step to allow internet traffic:
   ```shell
   for x in ${CLUSTER_SG}; do \
     aws ec2 authorize-security-group-ingress --group-id $$x --protocol tcp --port 30080 --cidr 0.0.0.0/0; \
     aws ec2 authorize-security-group-ingress --group-id $$x --protocol tcp --port 30443 --cidr 0.0.0.0/0; \
     aws ec2 authorize-security-group-ingress --group-id $$x --protocol udp --port 30443 --cidr 0.0.0.0/0; \
   done
   ```

9. Get the DNS name for the load balancers and create a CNAME record at your domain provider.
   ```shell
   aws elbv2 describe-load-balancers --name ${CLUSTER_NAME}-nlb \
     --query 'LoadBalancers[0].DNSName' \
     --output text
   ```

10. Create `Listeners` for $productName$.
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

11. Create a `Host` for your domain name.
   ```yaml
   kubectl apply -f - <<EOF
   apiVersion: getambassador.io/v3alpha1
   kind: Host
   metadata:
     name: $productDeploymentName$-aws-host
     namespace: $productNamespace$
   spec:
     hostname: "your-hostname"
     acmeProvider:
       email: "your-email@example.com"
       authority: https://acme-v02.api.letsencrypt.org/directory
     tls:
       min_tls_version: v1.3
       max_tls_version: v1.3
       alpn_protocols: h2,http/1.1
   EOF
   ```

12. Apply the quote service and a `Mapping` to test the HTTP/3 configuration.
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

13. Verify the connection to the quote of the moment service.
   ```shell
   $ curl -i http://{your-hostname}/backend/
   ```

   Your domain now shows that it is being served with HTTP/3.
