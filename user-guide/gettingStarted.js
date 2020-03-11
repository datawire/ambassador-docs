import React from 'react'


function GettingStarted() {
    return (
        <details>
            <summary>### Install on MacOS</summary>

            1. Download the `edgectl` file [here](https://metriton.datawire.io/downloads/darwin/edgectl) or download it with a curl command:

                ```shell
                sudo curl -fL https://metriton.datawire.io/downloads/darwin/edgectl -o /usr/local/bin/edgectl && sudo chmod a+X /usr/local/bin/edgectl
                ```

                If you decide to download the file, you may encounter a security block. To change this:
                * Go to **System Preferences > Security & Privacy > General**.
                * Click the **Open Anyway** button.
                * On the new dialog, click the **Open** button.

            2. Run the installer with `./edgectl install`
        </details>
    )
}

export default GettingStarted