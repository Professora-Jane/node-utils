const microservices = require("./src/microservices")
const websockets = require("./src/websockets")

module.exports = {
    ...microservices,
    ...websockets
}