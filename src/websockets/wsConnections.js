const ws = require("ws");
const { workerPoolInstance, publishTypes } = require("@prof_jane/node-utils");

class WsConnections {

    /**
     * @typedef {{sockets: Array<ws>}} socketDescription
     * @type {Map<string, socketDescription>}
     */
    #CONNECTED_SOCKETS = new Map();
    

    /**
     * @description Função responsável por adicionar sockets no Map CONNECTED_SOCKETS, que gerencia todos os sockets conectados
     * @param { ws } ws - Socket que será adicionado
     * @returns { boolean }
     */
    addSocket(ws) {
        if (!ws.id) return false

        const clientSockets = this.#CONNECTED_SOCKETS.get(ws.id);

        if (clientSockets)
            clientSockets.sockets.push(ws)
        else {
            this.#CONNECTED_SOCKETS.set(ws.id, {
                sockets: [ws]
            })
        }

        return true
    }

    /**
     * @description Função responsável por remover sockets no Map CONNECTED_SOCKETS, que gerencia todos os sockets conectados.
     * Caso o haja apenas um socket a ser removido do CONNECTED_SOCKETS[id].sockets, a chave também será removida do map.
     * @param { ws } ws - Socket que será removido
     * @returns { boolean }
     */
    removeSocket(ws) {
        if (!ws.id) return false

        const clientSockets = this.#CONNECTED_SOCKETS.get(ws.id);

        if (clientSockets) {
            const indexToRemove = clientSockets.sockets.findIndex(socket => socket.id === ws.id);

            if (indexToRemove > -1) 
                clientSockets.sockets.splice(indexToRemove, 1);

            if (clientSockets.sockets.length === 0)
                this.#CONNECTED_SOCKETS.delete(ws.id)

            return true
        }
        
        return false
    }

    /**
     * @description Função responsável por obter um array de sockets a partir de um id fornecido.
     * @param { string } id - id do client
     * @returns { Array<ws> | undefined }
     */
    getSockets(id) {
        const clientSockets = this.#CONNECTED_SOCKETS.get(id);

        if (clientSockets)
            return clientSockets.sockets

        return undefined
    }
}

const instance = new WsConnections();

module.exports = {
    wsConnectionsInstance: (() => instance)()
}