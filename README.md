# Trello DB

Trello DB is a simple wrapper to retrive data from trello.

*This library is under development. Don't use it on Production.*

## Run examples

before running any example, install the dependencies first:

```
npm install
```

create your own `.env.js` to export the key, token, then run `node <example path>`.

```javascript
module.exports = {
    key: <your key>,
    token <your token>,
    board: <board id>
};
```

## Test

```
npm test
```

## TODO

- more flexible query api
