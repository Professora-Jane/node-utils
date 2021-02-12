const WorkerPool = require("./WorkerPool")

const BaseWorkerService = require("./abstracts/BaseWorkerService");
const DefaultProvider = require("./abstracts/DefaultProvider");

const ZeroMqProvider = require("./providers/ZeroMqProvider");

module.exports = {
    BaseWorkerService,
    DefaultProvider,
    ZeroMqProvider,
    ...WorkerPool
}