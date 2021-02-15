const zmq = require("zeromq");
const DefaultProvider = require("../abstracts/DefaultProvider");
const { workerTypes } = require("../microServicesCore");
const BaseWorkerService = require("../abstracts/BaseWorkerService");

class ZeroMqProvider extends DefaultProvider {
    constructor() {
        super()
        this.pubSock = new zmq.Publisher


        /**
         * @type { Array<Workers>}
         */
        this.workers = []
        this.config = undefined
        this.publisher = undefined
    }

    /**
     * 
     * @param { object } config 
     * @param { string } config.subHost 
     * @param { string } config.pubHost 
     */
    async configProvider(config) {
        this.config = config
        this.publisher = new zmq.Publisher()

        await this.bindPublisher()
    }

    async bindPublisher() {
        
    
        await this.publisher.bind(this.config.pubHost)
    }

    addWorker(worker, { workerType }) {
        this.workers.push({ worker, workerType})
    }

    async configureWorkers() {
        this.workers.map(async ({ worker, workerType }) => {
            if (workerType === workerTypes.pubsub) {

                worker.conn = new zmq.Subscriber()

                worker.conn.connect(this.config.subHost)
        
                worker.conn.subscribe(worker.topic)
    
                for await (const [_, content] of worker.conn) {
                    try {
                        await worker.execute(this.convertMessage(content))
                    }
                    catch(error) {
                        worker.doOnError(error, this.convertMessage(content))
                    }
                }
            }
        })
    }

    async publishPubSub(topic, content) {

        if (typeof content === "object") 
            content = JSON.stringify(content)
        
        await this.publisher.send([topic, content])
    }

    convertMessage(msg) {
        return JSON.parse(new TextDecoder("utf-8").decode(msg));
    }
}

/**
 * @typedef { object } Workers
 * @property { BaseWorkerService<zmq.Subscriber> } worker
 * @property { string } workerType
 */
module.exports = ZeroMqProvider
