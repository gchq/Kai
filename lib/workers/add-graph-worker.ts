import { Worker } from "./worker";


export class AddGraphWorker extends Worker {
    get handler() {
        return "add_graph.handler"
    }

    get workerId {
        return "AddGraphHandler"
    }
}