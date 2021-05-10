# AuthService Settings

A Mapping can pass these settings along to an [AuthService](../../running/services/auth-service).  This is helpful to allow these specific configurations to apply only to certain Mappings and not globally.

## Bypass Authentication

An AuthService can be disabled for a specific Mapping with the `bypass_auth` attribute. This will tell Ambassador to allow all requests for that Mapping through without interacting with the external auth service.  This could be helpful, for example, for a public API.

```yaml
bypass_auth: true
```

## Context Extensions

The `auth_context_extensions` attribute will pass the given values along to the AuthService when authentication happens.  The values are arbitrary key value pairs formatted as strings.

```yaml
auth_context_extensions:
  foo: bar
  baz: zing
```

More information is available on [the Envoy documentation on external authentication](https://www.envoyproxy.io/docs/envoy/latest/api-v3/extensions/filters/http/ext_authz/v3/ext_authz.proto.html#extensions-filters-http-ext-authz-v3-checksettings).
