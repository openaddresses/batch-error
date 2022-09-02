<h1 align=center>Batch-Error</h1>

<p align=center>Errors for the HTTP Serving World</p>

## Installation

```sh
npm i @openaddresses/batch-error
```

## Example Usage

```js
const Err = require('@openaddresses/batch-error');

throw new Err(statusCode, originalErr_orNull, message);
```
