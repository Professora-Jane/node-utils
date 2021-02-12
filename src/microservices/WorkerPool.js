const BaseWorkerService = require("./abstracts/BaseWorkerService");
const DefaultProvider = require("./abstracts/DefaultProvider");

class WorkerPool {
    constructor() {
        /**
         * @type { Object.<string, DefaultProvider> }
         */
        this.providers = {}
    }

    /**
     * Método responsável por adicionar uma estratégia . As estratégias devem, necessariamente, 
     * herdar da classe Default Provider. 
     * 
     * O método espera o handler da estratégia (somente referência, não uma classe instanciada),
     * o nome da estratégia e um objeto de configurações que será passado diretamente à provider.
     * @param { DefaultProvider } providerHandler - Handler da estratégia
     * @param { string } providerName - Nome da estratégia que será adicionada
     * @param { object } providerConfig - Objeto de configuração da estratégia
     */
    addProvider(providerHandler, providerName, providerConfig) {
        if (this.providers[providerName])
            throw new Error("Estratégia já adicionada")
        
        this.providers[providerName] = new providerHandler()
        this.providers[providerName].configProvider(providerConfig)
        
        return this;
    }

    /**
     * Método responsável por adicionar um worker. O worker não é adicionado diretamente ao workerPool, e sim 
     * à estratégia selecionada. Logo, é de suma importância que a estratégia seja sempre adicionada ANTES do 
     * worker, e nunca depois. 
     * 
     * O Worker deve, necessariamente, herdar da classe BaseWorkerService.
     * @param { BaseWorkerService } worker 
     * @param { object } opts 
     * @param { string | Array<string> } opts.providerName - Nome da estratégia que o worker irá utilizar
     * @param { workerTypes  } opts.workerType - Tipo de worker que será usado. Recomenda-se utilizar o objecto exportado 'workerTypes'
     */
    addWorker(worker, { providerName, workerType }) {

        if (Array.isArray(providerName)) {
            providerName.map(provider => {
                if (!this.providers[provider])
                    throw new Error("Estratégia inválida")

                this.providers[provider].addWorker(worker, { workerType })
            })
        }
        else {
            if (!this.providers[providerName])
                throw new Error("Estratégia inválida")

            this.providers[providerName].addWorker(worker, { workerType })
        }

        return this;
    }

    /**
     * Método responsável por iniciar os workers de cada estratégia.
     */
    async init() {
        Object.keys(this.providers).forEach(async provider => {
            await this.providers[provider].configureWorkers()
        })
    }

    /**
     * @param { object } opts 
     * @param { string } opts.provider - Estratégia pelo qual o envio será realizado
     * @param { string } opts.type - Tipo de mensagem a ser publicada. Atualmente suporta "PubSub"
     * @param { string } opts.topic - Tópico ao qual a mensagem será publicada
     * @param { object } opts.content - conteúdo da mensagem a ser enviado
     */
    async publish({ provider, type, topic, content }) {
        this.providers[provider][`publish${type}`] && await this.providers[provider][`publish${type}`](topic, content)
    }

}

const instance = new WorkerPool();
const workerTypes = Object.freeze({
    pubsub: "pubsub",
    queueWorker: "queueWorker"
})

const publishTypes = Object.freeze({
    PubSub: "PubSub",
})

module.exports = {
    workerPoolInstance: (() => instance)(),
    workerTypes,
    publishTypes
}