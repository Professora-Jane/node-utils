/**
 * @class
 * @abstract
 * @template T
 */
class BaseWorkerService {
    constructor({ topic }) {
        if (this.constructor == BaseWorkerService) {
            throw new Error("Não é possível instanciar uma classe abstrata");
        }
      
        if (!topic)
            throw new Error("Tópico não informado")

        this.topic = topic

        /**
         * @type { T }
         */
        this.conn = undefined
    }

    /**
     * Executa a lógica negocial com base na mensagem (JSON) recebida
     * @abstract
     * @async
     * @param { object } msg 
     */
    execute() {
        throw new Error("Not implemented")
    }

    /**
     * Lógica que o worker deve executar caso ocorra uma falha no processamento da mensagem original.
     * @abstract
     * @async
     * @param { Error } err
     * @param { object } originalMsg
     */
    doOnError() {
        throw new Error("Not implemented")
    }
}

module.exports = BaseWorkerService