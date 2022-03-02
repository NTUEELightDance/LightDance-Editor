import { Dic } from "./type"
class clientList {
    clientList: Dic

    constructor() {
        this.clientList = {}
    }

    addDancerClient = (dancerName: string, dancerSocket: any) => { // dancerSocket is of type DancerSocket
        this.clientList[dancerName] = dancerSocket;
    }
    deleteDancerClient = (dancerName: string) => {
        delete this.clientList[dancerName];
    }
    getDancerClients = () => {
        return this.clientList
    }
    socketReceiveData = (from: string, msg: any, oppositeClient: clientList) => {  // msg type need to be specified later 
        const { type, task, payload } = msg;
        switch (type) {
            case "dancer": {
                Object.values(oppositeClient.getDancerClients).forEach((editor: any) => { // editor is of type editor socket
                    editor.sendDataToClientEditor([
                        task,
                        {
                            from,
                            response: payload,
                        },
                    ]);
                });
                break;
            }
            case "Editor": {
                break;
            }
            default:
                break;
        }

        console.log("dancerClients: ", Object.keys(dancerClients));
        console.log("editorClients: ", Object.keys(editorClients));
    };
}