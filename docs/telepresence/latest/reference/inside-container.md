# Running Telepresence inside a container

All Telepresence commands now have the global option `--docker`. This option tells telepresence to start the Telepresence daemon in a
docker container.

Running the daemon in a container brings many advantages. The daemon will no longer make modifications to the host's network or DNS, and
it will not mount files in the host's filesystem. Consequently, it will not need admin privileges to run, nor will it need special software
like macFUSE or WinFSP to mount the remote file systems.

The intercept handler (the process that will receive the intercepted traffic) must also be a docker container, because that is the only
way to access the cluster network that the daemon makes available, and to mount the docker volumes needed.

It's highly recommended that you use the new [Intercept Specification](../intercepts/specs) to set things up. That way, Telepresence can do
all the plumbing needed to start the intercept handler with the correct environment and volume mounts. 
Otherwise, doing a fully container based intercept manually with all bells and whistles is a complicated process that involves:
-  Capturing the details of an intercept
-  Ensuring that the [Telemount](https://github.com/datawire/docker-volume-telemount#readme) Docker volume plugin is installed
-  Creating volumes for all remotely exposed directories
-  Starting the intercept handler container using the same network as the daemon.
