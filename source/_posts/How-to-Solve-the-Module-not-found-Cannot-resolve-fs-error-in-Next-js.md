---
title: "How to Solve the Module not found: Cannot resolve 'fs' error in Next.js"
date: 2023-04-19 13:58:21
tags:
  - Next.js
  - Web
categories:
---

## Webpack 4 version

To resolve the error with Webpack 4, you need to tell webpack to set the module to 'empty' on the client-side (!isServer).

This is also a solution when you are working with older Next.js versions.

The configuration essentially tells Webpack to create an empty module for fs, which effectively suppresses the error.

Update your `next.config.js` with the following:

```js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // set 'fs' to an empty module on the client to prevent this error on build --> Error: Can't resolve 'fs'
      config.node = {
        fs: "empty",
      };
    }

    return config;
  },
};
```

## Webpack 5 version

To resolve the error with Webpack 5, you need to tell webpack not to resolve the module on the client-side (!isServer).

Update your `next.config.js` with the following:

```js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // don't resolve 'fs' module on the client to prevent this error on build --> Error: Can't resolve 'fs'
      config.resolve.fallback = {
        fs: false,
      };
    }

    return config;
  },
};
```
