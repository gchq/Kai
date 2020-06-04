import { Worker } from './worker';


export class AddGraphWorker extends Worker {
    get handler(): string {
        return 'add_graph.handler';
    }

    get workerId(): string {
        return 'AddGraphHandler';
    }
}