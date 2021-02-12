import * as WorkerPool from "./WorkerPool"

import BaseWorkerService from "./abstracts/BaseWorkerService"
import DefaultProvider from "./abstracts/DefaultProvider"

import ZeroMqProvider from "./providers/ZeroMqProvider"

exports = {
    BaseWorkerService,
    DefaultProvider,
    ZeroMqProvider,
    ...WorkerPool
}