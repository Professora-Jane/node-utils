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
     * Método responsável por receber um objeto de configurações. No geral apenas salva num atributo options, porém a lógica 
     * fica a cargo de quem estiver responsável por de fato implementar o worker.
     * @abstract
     * @param { object } opts - Objeto de configurações
     */
    configProvider() {
        throw new Error("Not implemented")
    }

    /**
     * Método responsável por adicionar um worker. No geral apenas dá um push num array de workers, porém a lógica 
     * fica a cargo de quem estiver responsável por de fato implementar o worker.
     * @abstract
     * @param { BaseWorkerService } worker - Instância da classe do worker 
     * @param { object } opts - Objeto de configurações 
     * @param { string } opts.workerType - Tipo de worker
     */
    addWorker() {
        throw new Error("Not implemented")
    }

    /**
     * Método responsável por inicializar e configurar os workers. Aqui deve-ser iterar sobre todos os workers, 
     * aplicando a lógica de inicialização deles de acordo com o objeto de configurações de cada um.
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
