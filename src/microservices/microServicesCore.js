class MicroServicesCore {
    constructor() {
        /**
         * @type { Object.<string, import("./abstracts/DefaultProvider").DefaultProvider> }
         */
        this.providers = {}
    }

    initProviderConfig() {
        return new ProviderPool(this);
    }
}

class ProviderPool {

    /**
     * 
     * @param { MicroServicesCore } msCore 
     */
    constructor(msCore) {
        this.microservicesCore = msCore
    }

    /**
     * Método responsável por adicionar uma estratégia . As estratégias devem, necessariamente, 
     * herdar da classe Default Provider. 
     * 
     * O método espera o handler da estratégia (somente referência, não uma classe instanciada),
     * o nome da estratégia e um objeto de configurações que será passado diretamente à provider.
     * @param { import("./abstracts/DefaultProvider").DefaultProvider } providerHandler - Handler da estratégia
     * @param { string } providerName - Nome da estratégia que será adicionada
     * @param { object } providerConfig - Objeto de configuração da estratégia
     */
    addProvider(providerHandler, providerName, providerConfig) {
        if (this.microservicesCore.providers[providerName])
            throw new Error("Estratégia já adicionada")
        
        this.microservicesCore.providers[providerName] = new providerHandler()
        this.microservicesCore.providers[providerName].configProvider(providerConfig)
        
        return this;
    }

    
    initWorkerPool() {
        return new WorkerPool(this);
    }
}

class WorkerPool {

    /**
     * 
     * @param { MicroServicesCore } msCore 
     */
    constructor(msCore) {
        this.microservicesCore = msCore
    }

    /**
     * Método responsável por adicionar um worker. O worker não é adicionado diretamente ao workerPool, e sim 
     * à estratégia selecionada. Logo, é de suma importância que a estratégia seja sempre adicionada ANTES do 
     * worker, e nunca depois. 
     * 
     * O Worker deve, necessariamente, herdar da classe BaseWorkerService.
     * @param { import("./abstracts/BaseWorkerService").BaseWorkerService } worker 
     * @param { object } opts 
     * @param { string | Array<string> } opts.providerName - Nome da estratégia que o worker irá utilizar
     * @param { workerTypes  } opts.workerType - Tipo de worker que será usado. Recomenda-se utilizar o objecto exportado 'workerTypes'
     */
    addWorker(worker, { providerName, workerType }) {

        if (Array.isArray(providerName)) {
            providerName.map(provider => {
                if (!this.microservicesCore.providers[provider])
                    throw new Error("Estratégia inválida")

                this.microservicesCore.providers[provider].addWorker(worker, { workerType })
            })
        }
        else {
            if (!this.microservicesCore.providers[providerName])
                throw new Error("Estratégia inválida")

            this.microservicesCore.providers[providerName].addWorker(worker, { workerType })
        }

        return this;
    }

    /**
     * Método responsável por iniciar os workers de cada estratégia.
     */
    async initWorkers() {
        Object.keys(this.microservicesCore.providers).forEach(async provider => {
            await this.microservicesCore.providers[provider].configureWorkers()
        })

        return microServicesHandlerInstance.setMicroservicesCore(this)
    }
}

class MicroServicesHandler {
    constructor() {
        this.microservicesCore = undefined
    }

    setMicroservicesCore(msCore) {
        if (this.microservicesCore)
            throw new Error("MsCore already configured!")
        
        this.microservicesCore = msCore;
    }

    /**
     * @param { object } opts 
     * @param { string } opts.provider - Estratégia pelo qual o envio será realizado
     * @param { string } opts.type - Tipo de mensagem a ser publicada. Atualmente suporta "PubSub"
     * @param { string } opts.topic - Tópico ao qual a mensagem será publicada
     * @param { object } opts.content - conteúdo da mensagem a ser enviado
     */
    async publish({ provider, type, topic, content }) {
        if (!this.microservicesCore) 
            throw new Error("Workers and Providers need initialization!")

        if (publishTypes[type] && this.microservicesCore.providers[provider][`publish${publishTypes[type]}`]) {
            await this.microservicesCore.providers[provider][`publish${publishTypes[type]}`](topic, content)
        }
        else
            throw new Error("Invalid message type or no provider")
    }
}


const microServicesHandlerInstance = new MicroServicesHandler()
const microServicesCore = new MicroServicesCore()



const workerTypes = Object.freeze({
    pubsub: "pubsub",
    queueWorker: "queueWorker"
})

const publishTypes = Object.freeze({
    PubSub: "PubSub",
})


module.exports = {
    microServicesHandlerInstance: (() => instance)(),
    microServicesCore: (() => microServicesCore)(),
    workerTypes,
    publishTypes
}