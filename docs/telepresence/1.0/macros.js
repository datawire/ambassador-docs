import React from 'react';

import CodeBlock from '../../../../src/components/CodeBlock/CodeBlock';

export function Install({ install, command, cluster, location }) {
  return (
    <details>
      <summary>Install Telepresence with Homebrew/apt/dnf</summary>

      <p>You will need the following available on your machine:</p>
      <ul>
        <li><code>{command}</code> command line tool (here's the <a target="_blank" rel="noopener noreferrer" href={install}>installation instructions</a>).</li>
        <li>Access to your {cluster} cluster, with local credentials on your machine. You can test this by running <code>{command} get pod</code> - if this works you're all set.</li>
      </ul>

      <InstallSpecific location={location} />

    </details>
  );
}

export function InstallSpecific({ location }) {
  return (
    <>
      <h4>OS X</h4>
      <p>
        On OS X you can install Telepresence by running the following:
      </p>
      <CodeBlock>
        {
          'brew install --cask osxfuse\n' +
          'brew install datawire/blackbird/telepresence-legacy'
        }
      </CodeBlock>
      <h4>Ubuntu 16.04 or later</h4>
      <p>Run the following to install Telepresence:</p>
      <CodeBlock>
        {
          'curl -s https://packagecloud.io/install/repositories/datawireio/telepresence/script.deb.sh | sudo bash\n' +
          'sudo apt install --no-install-recommends telepresence'
        }
      </CodeBlock>
      <p>
        If you are running another Debian-based distribution that has Python 3.5 installable as  <code>python3</code>, you may be able to use the Ubuntu 16.04 (Xenial) packages. The following works on Linux Mint 18.2 (Sonya) and Debian 9 (Stretch) by forcing the PackageCloud installer to access Xenial packages.
      </p>
      <CodeBlock>
        {
          'curl -sO https://packagecloud.io/install/repositories/datawireio/telepresence/script.deb.sh\n' +
          'sudo env os=ubuntu dist=xenial bash script.deb.sh\n' +
          'sudo apt install --no-install-recommends telepresence\n' +
          'rm script.deb.sh'
        }
      </CodeBlock>
      <p>
        A similar approach may work on Debian-based distributions with Python 3.6 by using the Ubuntu 17.10 (Artful) packages.
      </p>
      <h4>Fedora 26 or later</h4>
      <p>Run the following:</p>
      <CodeBlock>
        {
          'curl -s https://packagecloud.io/install/repositories/datawireio/telepresence/script.rpm.sh | sudo bash\n' +
          'sudo dnf install telepresence'
        }
      </CodeBlock>
      <p>
        If you are running a Fedora-based distribution that has Python 3.6 installable as \`python3\`, you may be able to use Fedora packages. See the Ubuntu section above for information on how to invoke the PackageCloud installer script to force OS and distribution.
      </p>
      <h4>Arch Linux</h4>
      <p>
        Until we have a *correct and working* AUR package, please install from source. See <a href="https://github.com/telepresenceio/telepresence/issues/135">issue #135</a> for the latest information.
      </p>
      <h4>Windows</h4>
      <p>
        See the <a href="/reference/windows.html">Windows support documentation.</a>
      </p>
      <h4>Install from source</h4>
      <p>
        On systems with Python 3.5 or newer, install into \`/usr/local/share/telepresence\` and \`/usr/local/bin\` by running:
      </p>
      <CodeBlock>
        {
          'sudo env PREFIX=/usr/local ./install.sh'
        }
      </CodeBlock>
      <p>
        Install the software from the <a href="/reference/install.html#dependencies">list of dependencies</a> to finish.
      </p>
      <p>
        Install into arbitrary locations by setting other environment variables before calling the install script. <a href="https://github.com/telepresenceio/telepresence/blob/master/install.sh">See the install script</a> for more information. After installation you can safely delete the source code.
      </p>
      <h4>Other platforms</h4>
      <p>
        Don't see your favorite platform? <a href="https://github.com/telepresenceio/telepresence/issues/new">Let us know</a> and we'll try to add it. Also try installing from source.
      </p>
    </>
  );
}

export function GettingStartedPart1({ cluster }) {
  return (
    <>
      <h4>Debugging a service locally with Telepresence</h4>
      <p>
        Imagine you have a service running in a staging cluster, and someone reports a bug against it.
      </p>
      <p>
        In order to figure out the problem you want to run the service locally... but the service depends on other services in the cluster, and perhaps on cloud resources like a database.
      </p>
      <p>
        In this tutorial you'll see how Telepresence allows you to debug your service locally.
      </p>
      <p>
        We'll use the <code>telepresence</code> command line tool to swap out the version running in the staging cluster for a debug version under your control running on your local machine.
      </p>
      <p>
        Telepresence will then forward traffic from {cluster} to the local process.
      </p>
    </>
  );
}

export function GettingStartedPart2({ deployment, command, cluster }) {
  return (
    <>
      <p>
        Once you know the address you can store its value (don't forget to replace this with the real address!):
      </p>
      <CodeBlock>
        {
          '$ export HELLOWORLD=http://104.197.103.13:8000'
        }
      </CodeBlock>
      <p>
        And you send it a query and it will be served by the code running in your cluster:
      </p>
      <CodeBlock>
        {
          '$ curl $HELLOWORLD/' +
          'Hello, world!'
        }
      </CodeBlock>
      <h4>Swapping your deployment with Telepresence</h4>
      <p>
        <b>Important</b> Starting <code>telepresence</code> the first time may take a little while, since ${cluster} needs to download the server-side image.
      </p>
      <p>
        At this point you want to switch to developing the service locally, replace the version running on your cluster with a custom version running on your laptop.
      </p>
      <p>
        To simplify the example we'll just use a simple HTTP server that will run locally on your laptop:
      </p>
      <CodeBlock>
        {
          '$ mkdir /tmp/telepresence-test\n' +
          '$ cd /tmp/telepresence-test\n' +
          '$ echo "hello from your laptop" > file.txt\n' +
          '$ python3 -m http.server 8001 &\n' +
          '[1] 2324\n' +
          '$ curl http://localhost:8001/file.txt\n' +
          'hello from your laptop\n' +
          '$ kill %1'
        }
      </CodeBlock>
      <p>
        We want to expose this local process so that it gets traffic from ${cluster}, replacing the existing \`hello-world\` deployment.
      </p>
      <p>
        <b>Important:</b> you're about to expose a web server on your laptop to the Internet.
      </p>
      <p>
        This is pretty cool, but also pretty dangerous!
      </p>
      <p>
        Make sure there are no files in the current directory that you don't want shared with the whole world.
      </p>
      <p>
        Here's how you should run <code>telepresence</code> (you should make sure you're still in the <code>/tmp/telepresence-test</code> directory you created above):
      </p>
      <CodeBlock>
        {
          '$ cd /tmp/telepresence-test' +
          '$ telepresence --swap-deployment hello-world --expose 8000' +
          '--run python3 -m http.server 8000 &'
        }
      </CodeBlock>
      <p>
        This does three things:
      </p>
      <p>
        * Starts a VPN-like process that sends queries to the appropriate DNS and IP ranges to the cluster.
      </p>
      <p>
        * <code>--swap-deployment</code> tells Telepresence to replace the existing <code>hello-world</code> pod with one running the Telepresence proxy. On exit, the old pod will be restored.
      </p>
      <p>
        * <code>--run</code> tells Telepresence to run the local web server and hook it up to the networking proxy.
      </p>
      <p>
        As long as you leave the HTTP server running inside <code>telepresence</code> it will be accessible from inside the ${cluster} cluster.
      </p>
      <p>
        You've gone from this...
      </p>
      <CodeBlock className="mermaid">
        {
          'graph RL' +
          'subgraph ${cluster} in Cloud' +
          'server["datawire/hello-world server on port 8000"]' +
          'end'
        }
      </CodeBlock>
      <p>...to this:</p>
      <CodeBlock className="mermaid">
        {
          'graph RL' +
          'subgraph Laptop' +
          'code["python HTTP server on port 8000"]---client[Telepresence client' +
          'end' +
          'subgraph ${cluster} in Cloud' +
          'end' +
          'client-.-proxy["Telepresence proxy, listening on port 8000"]' +
          'end'
        }
      </CodeBlock>
      <p>
        We can now send queries via the public address of the \`Service\` we created, and they'll hit the web server running on your laptop instead of the original code that was running there before.
      </p>
      <p>
        Wait a few seconds for the Telepresence proxy to startup; you can check its status by doing:
      </p>
      <CodeBlock className="console">
        {
          '$ ${command} get pod | grep hello-world' +
          'hello-world-2169952455-874dd   1/1       Running       0          1m' +
          'hello-world-3842688117-0bzzv   1/1       Terminating   0          4m'
        }
      </CodeBlock>
      <p>
        Once you see that the new pod is in \`Running\` state you can use the new proxy to connect to the web server on your laptop:
      </p>
      <CodeBlock>
        {
          '$ curl $HELLOWORLD/file.txt' +
          'hello from your laptop'
        }
      </CodeBlock>
      <p>
        Finally, let's kill Telepresence locally so you don't have to worry about other people accessing your local web server by bringing it to the foreground and hitting Ctrl-C:
      </p>
      <CodeBlock>
        {
          '$ fg' +
          'telepresence --swap-deployment hello-world --expose 8000 --run python3 -m http.server 8000' +
          '^C' +
          'Keyboard interrupt received, exiting.'
        }
      </CodeBlock>
      <p>
        Now if we wait a few seconds the old code will be swapped back in.
      </p>
      <p>
        Again, you can check status of swap back by running:
      </p>
      <CodeBlock>
        {
          '$ ${command} get pod | grep hello-world'
        }
      </CodeBlock>
      <p>
        When the new pod is back to \`Running\` state you can see that everything is back to normal:
      </p>
      <CodeBlock>
        {
          '$ curl $HELLOWORLD/file.txt' +
          'Hello, world!'
        }
      </CodeBlock>
      <p>
        > <b>What you've learned:</b> Telepresence lets you replace an existing deployment with a proxy that reroutes traffic to a local process on your machine.

      </p>
      <p>
       > This allows you to easily debug issues by running your code locally, while still giving your local process full access to your staging or testing cluster.
      </p>
      <p>
        Now it's time to clean up the service:
      </p>
    </>
  );
}

export function TutorialFooter({ title, path, baseUrl }) {
  return (
    <p>
      Still have questions? Ask in our <a href="https://a8r.io/slack">Slack chatroom</a> or  <a href="https://github.com/telepresenceio/telepresence/issues/new">file an issue on GitHub</a>
    </p>
  );
}
