const pubsub = require("pubsub-js");
const { wsConnectionsInstance } = require("./wsConnections");
const fs = require("fs");
const ws = require("ws");
const { IncomingMessage } = require("http");

class WsHandler {

    /**
     * 
     * @param { ws }  ws - Instância atual do socket
     * @param { IncomingMessage } req 
     * @param { string } msg - mensagem stringficada
     */
    messageHandler(ws, req, msg) {

        const { type, content } = JSON.parse(msg)
        
        if (type === "connection") {
            // TODO alterar para receber o id do usuário via req;
            ws.id = content.id
            ws.type = content.type

            wsConnectionsInstance.addSocket(ws)

            ws.send("connectedToServer")
        }
        else if (ws.id) {
            pubsub.publish(type, [content, ws])
        }
        else {
            ws.close(1008, "Client não efetuou conexão")
        }
    }

    /**
     * @description Método responsável por registrar os handlers (aqui chamados de controllers) websockets.
     * Eles funcionam através de um sistema pub-sub (usando o pubsub-js), e todos os métodos considerados subscribers devem começar com 
     * "<topic>:<type>". A inscrição é feita de forma automática desde que essa convenção seja seguida.
     * @param { object } param 
     * @param { string } param.path - Caminho da pasta onde ficam localizadas as controllers 
     * @param { Array<string> } param.ignoreFiles - Array de arquivos que devem ser ignorados 
     */
    registerSubscribers({ path, ignoreFiles }) {
        fs.readdirSync(path).forEach(file => {
            if (!ignoreFiles.includes(file)) {
                let  tempClass = require(path + file);
    
                let props = [];
                let obj = tempClass;
                do {
                    props = props.concat(Object.getOwnPropertyNames(obj));
                } 
                while (obj = Object.getPrototypeOf(obj));
    
                props
                    .filter(function(e, i, arr) { 
                        if (e!=arr[i+1] && 
                            typeof tempClass[e] == 'function') 
                        return true;
                    })
                    .map(classMethod => {
                        pubsub.subscribe(classMethod, async (_, value) => await tempClass[classMethod](...value))
                    })
            }
        });
    }
}

const instance = new WsHandler();

module.exports = {
    wsHandlerInstance:  (() => instance)()
}