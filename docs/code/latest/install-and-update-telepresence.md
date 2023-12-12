---
title: "Telepresence installation and updates"
description: "Learn how to install and update Telepresence."
---

# Basic Telepresence Installation

Install Telepresence by running the commands below for your OS. If you are not the administrator of your cluster, you will need administrative RBAC permissions to install and use Telepresence in your cluster.

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

# 1. Download the latest windows zip file
# This contains telepresence.exe and its dependencies (~50 MB):
Invoke-WebRequest https://app.getambassador.io/download/tel2/windows/amd64/$dlVersion$/telepresence.zip -OutFile telepresence.zip

# 2. Extract the zip file to your desired directory, then delete the zip file:
Expand-Archive -Path telepresence.zip -DestinationPath telepresenceInstaller/telepresence
Remove-Item 'telepresence.zip'
cd telepresenceInstaller/telepresence

# 3. Run install-telepresence.ps1 to install telepresence's dependencies:
powershell.exe -ExecutionPolicy bypass -c " . '.\install-telepresence.ps1';"

# 4. Remove the unzipped directory:
cd ../..
Remove-Item telepresenceInstaller -Recurse -Confirm:$false -Force

# 5. Telepresence is now installed and you can use telepresence commands in PowerShell.
```

</Platform.WindowsTab>
</Platform.TabGroup>

## Nightly Telepresence upgrades

New builds of Telepresence are publish nightly, Monday through Friday, for macOS (Intel and Apple silicon), Linux, and Windows. The current builds are located on the [release/v2 page](https://github.com/telepresenceio/telepresence).

The tags are formatted as: `vX.Y.Z-nightly-$gitShortHash`.

`vX.Y.Z` is the most recent release of Telepresence with the patch version (Z) bumped one higher.
For example, if the last release was 2.3.4, nightly builds would start with v2.3.5, until a new
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


## Upgrade Process
The Telepresence CLI will periodically check for new versions and notify you when an upgrade is available. Run the same commands used for installation to replace your current binary with the latest version.

<Platform.TabGroup>
<Platform.MacOSTab>

```shell
# Intel Macs

# Upgrade via brew:
brew upgrade datawire/blackbird/telepresence

# OR upgrade manually:
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

# 4. Remove the unzipped directory
cd ../..
Remove-Item telepresenceInstaller -Recurse -Confirm:$false -Force

# 5. Telepresence is now installed and you can use telepresence commands in PowerShell.
```

</Platform.WindowsTab>
</Platform.TabGroup>

After you've completed an upgrade, you need to stop any live Telepresence processes by issuing `telepresence quit` command, then run `telepresence connect` to upgrade the Traffic Manager.

