# Developing Plugin Filters

The Plugin filter type allows you to plug in your own custom code. This code is compiled to a `.so` file, which you load into the Edge Stack container at `/etc/ambassador-plugins/${NAME}.so`. The [Filter Development Guide](../../../../howtos/filter-dev-guide) contains a tutorial on developing filters.

<br />

See the [Plugin Filter API reference][] for an overview of all the supported fields.

## The Plugin interface

This code is written in the Go programming language and must be compiled with the exact same compiler settings as Edge Stack (any overlapping libraries used must have their versions match exactly). This information is documented in the `/ambassador/aes-abi.txt` file in the AES docker image.

Plugins are compiled with `go build -buildmode=plugin -trimpath` and must have a `main.PluginMain` function with the signature `PluginMain(w http.ResponseWriter, r *http.Request)`:

```go
package main

import (
  "net/http"
)

func PluginMain(w http.ResponseWriter, r *http.Request) { … }
```

`*http.Request` is the incoming HTTP request that can be mutated or intercepted, which is done by `http.ResponseWriter`.

Headers can be mutated by calling `w.Header().Set(HEADERNAME, VALUE)`.
Finalize changes by calling `w.WriteHeader(http.StatusOK)`.

If you call `w.WriteHeader()` with any value other than 200 (`http.StatusOK`) instead of modifying the request, the plugin has
taken over the request, and the request will not be sent to your backend service.  You can call `w.Write()` to write the body of an error page.

[Plugin Filter API reference]: ../../../../custom-resources/getambassador/v3alpha1/filter-plugin