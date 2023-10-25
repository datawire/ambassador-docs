import Platform from '@src/components/Platform';

# Install

Install Telepresence by running the commands below for your OS. If you are not the administrator of your cluster, you will need [administrative RBAC permissions](../reference/rbac#administrating-telepresence) to install and use Telepresence in your cluster.

<Platform.TabGroup>
<Platform.MacOSTab>

```shell
# Intel Macs

# Install via brew:
brew install datawire/blackbird/telepresence

# OR install manually:
# 1. Download the latest binary (~60 MB):
sudo curl -fL https://app.getambassador.io/download/tel2/darwin/amd64/$dlVersion$/telepresence -o /usr/local/bin/telepresence

# 2. Make the binary executable:
sudo chmod a+x /usr/local/bin/telepresence

# Apple silicon Macs

# Install via brew:
brew install datawire/blackbird/telepresence-arm64

# OR Install manually:
# 1. Download the latest binary (~60 MB):
sudo curl -fL https://app.getambassador.io/download/tel2/darwin/arm64/$dlVersion$/telepresence -o /usr/local/bin/telepresence

# 2. Make the binary executable:
sudo chmod a+x /usr/local/bin/telepresence
```

</Platform.MacOSTab>
<Platform.GNULinuxTab>

```shell
# 1. Download the latest binary (~50 MB):
sudo curl -fL https://app.getambassador.io/download/tel2/linux/amd64/$dlVersion$/telepresence -o /usr/local/bin/telepresence

# 2. Make the binary executable:
sudo chmod a+x /usr/local/bin/telepresence
```

</Platform.GNULinuxTab>
<Platform.WindowsTab>

```powershell
# To install Telepresence, run the following commands
# from PowerShell as Administrator.

# 1. Download the latest windows zip containing telepresence.exe and its dependencies (~50 MB):
Invoke-WebRequest https://app.getambassador.io/download/tel2/windows/amd64/$dlVersion$/telepresence.zip -OutFile telepresence.zip

# 2. Unzip the telepresence.zip file to the desired directory, then remove the zip file:
Expand-Archive -Path telepresence.zip -DestinationPath telepresenceInstaller/telepresence
Remove-Item 'telepresence.zip'
cd telepresenceInstaller/telepresence

# 3. Run the install-telepresence.ps1 to install telepresence's dependencies. It will install telepresence to
# C:\telepresence by default, but you can specify a custom path by passing in -Path C:\my\custom\path
powershell.exe -ExecutionPolicy bypass -c " . '.\install-telepresence.ps1';"

# 4. Remove the unzipped directory:
cd ../..
Remove-Item telepresenceInstaller -Recurse -Confirm:$false -Force

# 5. Telepresence is now installed and you can use telepresence commands in PowerShell.
```

</Platform.WindowsTab>
</Platform.TabGroup>

## <img class="os-logo" src="../images/logo.png" alt="Telepresence logo" /> What's Next?

Follow one of our [quick start guides](../quick-start/) to start using Telepresence, either with our sample app or in your own environment.

## Installing nightly versions of Telepresence

We build and publish the contents of the default branch, [release/v2](https://github.com/telepresenceio/telepresence), of Telepresence
nightly, Monday through Friday, for macOS (Intel and Apple silicon), Linux, and Windows.

The tags are formatted like so: `vX.Y.Z-nightly-$gitShortHash`.

`vX.Y.Z` is the most recent release of Telepresence with the patch version (Z) bumped one higher.
For example, if our last release was 2.3.4, nightly builds would start with v2.3.5, until a new
version of Telepresence is released.

`$gitShortHash` will be the short hash of the git commit of the build.

Use these URLs to download the most recent nightly build.

<Platform.TabGroup>
<Platform.MacOSTab>

```shell
# Intel Macs
https://app.getambassador.io/download/tel2/darwin/amd64/nightly/telepresence

# Apple silicon Macs
https://app.getambassador.io/download/tel2/darwin/arm64/nightly/telepresence
```

</Platform.MacOSTab>
<Platform.GNULinuxTab>

```
https://app.getambassador.io/download/tel2/linux/amd64/nightly/telepresence
```

</Platform.GNULinuxTab>
<Platform.WindowsTab>

```
https://app.getambassador.io/download/tel2/windows/amd64/nightly/telepresence.zip
```

</Platform.WindowsTab>
</Platform.TabGroup>

## Installing older versions of Telepresence

Use these URLs to download an older version for your OS (including older nightly builds), replacing `x.y.z` with the versions you want.

<Platform.TabGroup>
<Platform.MacOSTab>

```shell
# Intel Macs
https://app.getambassador.io/download/tel2/darwin/amd64/x.y.z/telepresence

# Apple silicon Macs
https://app.getambassador.io/download/tel2/darwin/arm64/x.y.z/telepresence
```

</Platform.MacOSTab>
<Platform.GNULinuxTab>

```
https://app.getambassador.io/download/tel2/linux/amd64/x.y.z/telepresence
```

</Platform.GNULinuxTab>
<Platform.WindowsTab>

```
https://app.getambassador.io/download/tel2/windows/amd64/x.y.z/telepresence
```

</Platform.WindowsTab>
</Platform.TabGroup>

<img referrerpolicy="no-referrer-when-downgrade" src="https://static.scarf.sh/a.png?x-pxid=2e9ed427-6726-43c2-be60-2a137998d64d" alt="" style="max-width:1px;"/>
