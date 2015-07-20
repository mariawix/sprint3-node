# eslint-config-coding-standard

```bash
npm i git+ssh://git@github.com:wix/eslint-config-coding-standard.git#v1.0.1 --save-dev
```

.eslintrc

```json
{
    "extends": "./node_modules/eslint-config-coding-standard/config.eslintrc",
    "rules": {
        "global-strict": [2, "always"]
    },
    "env": {
        "browser": false,
        "node": true,
        "amd": true,
        "jasmine": true
    },
    "globals": {
    }
}
```