const BaseWorkerService = require("./BaseWorkerService")

/**
 * @class
 * @abstract
 */
class DefaultProvider {
    constructor() {
        if (this.constructor == DefaultProvider) {
            throw new Error("Não é possível instanciar uma classe abstrata");
        }
    }

    /**
     * @abstract
     */
    configProvider() {
        throw new Error("Not implemented")
    }

    /**
     * @abstract
     * @param { BaseWorkerService } worker - Instância da classe do worker 
     * @param { object } opts - Objeto de configurações 
     * @param { string } opts.workerType - Tipo de worker
     */
    addWorker() {
        throw new Error("Not implemented")
    }

    /**
     * @abstract
     */
    publishPubSub() {
        throw new Error("Not implemented")
    }

    /**
     * @abstract
     */
    configureWorkers() {
        throw new Error("Not implemented")
    }
}

/**
 * @typedef { DefaultProvider } DefaultProvider
 */
module.exports = DefaultProvider
