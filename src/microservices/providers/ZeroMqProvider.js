const zmq = require("zeromq");
const DefaultProvider = require("../abstracts/DefaultProvider");
const { workerTypes } = require("../WorkerPool");
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

    async configProvider(config) {
        this.config = config

        this.publisher = new zmq.Publisher()
    
        await this.publisher.bind(this.config.host)
    }

    async addWorker(worker, { workerType }) {
        this.workers.push({ worker, workerType})
    }

    convertMessage(msg) {
        return JSON.parse(new TextDecoder("utf-8").decode(msg));

    }

    async configureWorkers() {
        this.workers.map(async ({worker, workerType}) => {
            if (workerType === workerTypes.pubsub) {

                worker.conn = new zmq.Subscriber()

                worker.conn.connect(this.config.host)
        
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
}

/**
 * @typedef { object } Workers
 * @property { BaseWorkerService<zmq.Subscriber> } worker
 * @property { string } workerType
 */
module.exports = ZeroMqProvider
