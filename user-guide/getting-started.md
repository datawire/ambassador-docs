---
   description: In this guide, we'll walk through the process of deploying Ambassador Edge Stack in Kubernetes for ingress routing.
---
# Quick Start Installation Guide

In just four minutes, your cluster will be routing HTTPS requests from the
Internet to a backend service.

The Ambassador Edge Stack is deployed to Kubernetes via YAML for MacOS, Linux, and
Windows. For other options, such as Docker, click [here](/user-guide/install).

<div>

<style>
.accordion {
  background-color: #eee;
  color: #444;
  cursor: pointer;
  padding: 18px;
  width: 100%;
  border: none;
  text-align: left;
  outline: none;
  font-size: 15px;
  transition: 0.4s;
}

.active, .accordion:hover {
  background-color: #ccc; 
}

.panel {
  padding: 0 18px;
  display: none;
  background-color: white;
  overflow: hidden;
}
</style>

<button class="accordion">Install on MacOS</button>
<div class="panel">
<p><ol><li><p>Download the <code>edgectl</code> file <a href="https://metriton.datawire.io/downloads/darwin/edgectl" target="_blank" rel="nofollow noopener noreferrer">here</a> or download it with a curl command:</p><div class="styles-module--CodeBlock--1UB4s"><pre class="language-shell"><button class="styles-module--CopyButton--3-6vF">Copy</button><div class="token-line"><span class="token function">sudo</span><span class="token plain"> </span><span class="token function">curl</span><span class="token plain"> -fL https://metriton.datawire.io/downloads/darwin/edgectl -o /usr/local/bin/edgectl </span><span class="token operator">&amp;&amp;</span><span class="token plain"> </span><span class="token function">sudo</span><span class="token plain"> </span><span class="token function">chmod</span><span class="token plain"> a+X /usr/local/bin/edgectl</span></div></pre></div><p>If you decide to download the file, you may encounter a security block. To change this:</p><ul><li>Go to <strong>System Preferences &gt; Security &amp; Privacy &gt; General</strong>.</li><li>Click the <strong>Open Anyway</strong> button.</li><li>On the new dialog, click the <strong>Open</strong> button.</li></ul></li><li><p>Run the installer with <code>./edgectl install</code></p></li></ol></p>
</div>

<button class="accordion">Install on Linux</button>
<div class="panel">
<p><ol><li><p>Download the <code>edgectl</code> file <a href="https://metriton.datawire.io/downloads/linux/edgectl" target="_blank" rel="nofollow noopener noreferrer">here</a> or download it with a curl command:</p><div class="styles-module--CodeBlock--1UB4s"><pre class="language-shell"><button class="styles-module--CopyButton--3-6vF">Copy</button><div class="token-line"><span class="token function">sudo</span><span class="token plain"> </span><span class="token function">curl</span><span class="token plain"> -fL https://metriton.datawire.io/downloads/linux/edgectl -o /usr/local/bin/edgectl </span><span class="token operator">&amp;&amp;</span><span class="token plain"> </span><span class="token function">sudo</span><span class="token plain"> </span><span class="token function">chmod</span><span class="token plain"> a+x /usr/local/bin/edgectl</span></div></pre></div></li><li><p>Run the installer with <code>./edgectl install</code></p></li></ol></p>
</div>

<button class="accordion">Install on Windows</button>
<div class="panel">
<p><ol><li>Download the <code>edgectl</code> file <a href="https://metriton.datawire.io/downloads/windows/edgectl.exe" target="_blank" rel="nofollow noopener noreferrer">here</a>.</li><li>Run the installer with <code>edgectl.exe install</code></li></ol></p>
</div>

<script>
var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}
</script>

</div>

## Installation

Your terminal will print something similar to the following as it provisions a load balancer, configures TLS, and provides you with an `edgestack.me` subdomain:

```
$ edgectl install
-> Installing the Ambassador Edge Stack $version$.
-> Remote Kubernetes cluster detected.
-> Provisioning a cloud load balancer. (This may take 
a minute, depending on your cloud provider.)
-> Automatically configuring TLS.
Please enter an email address. We’ll use this email 
address to notify you prior to domain and certification 
expiration [None]: john@example.com.
```

Provide an email address as required by the ACME TLS certificate provider, Let's
Encrypt. Then your terminal will print something similar to the following:

```
-> Obtaining a TLS certificate from Let’s Encrypt.
Congratulations, you’ve successfully installed the 
Ambassador Edge Stack in your Kubernetes cluster. 
Visit https://random-word-3421.edgestack.me to access
your Edge Stack installation and for additional configuration
```

The `random-word-1234.edgestack.me` is a provided subdomain that allows the
Ambassador Edge Stack to automatically provision TLS and HTTPS for a domain
name, so you can get started right away.

Your new [Edge Policy Console](/about/edge-policy-console) will open
automatically in your browser at the provided URL or IP address. **Note that the provided `random-word.edgestack.me` domain name will expire after 90 days**.

![AES success](/../../doc-images/aes-success.png)

### Minikube

Minikube users will see something similar to the following:

```
$ edgectl install
-> Installing the Ambassador Edge Stack $version$.
-> Automatically configuring TLS.
-> Cluster is not publicly accessible. Please ensure 
your cluster is publicly accessible if you would like to 
use automatic TLS.
Congratulations, you’ve successfully installed the
 Ambassador Edge Stack in your Kubernetes cluster. 
 Visit http://192.168.64.2:31334 to access your Edge 
 Stack installation and for additional configuration.
 ```

## Installation Success

Congratulations, you've installed the Ambassador Edge Stack! Take advantage of
the quick start demo by [creating a mapping](/user-guide/quickstart-demo) on
your cluster using the Ambassador Edge Stack.

### What’s Next?

The Ambassador Edge Stack has a comprehensive range of [features](/features/) to
support the requirements of any edge microservice. To learn more about how the
Ambassador Edge Stack works, along with use cases, best practices, and more,
check out the [Welcome page](/docs/) or read the [Ambassador
Story](/about/why-ambassador).

For a custom configuration, you can install the Ambassador Edge Stack [manually](/user-guide/manual-install).
