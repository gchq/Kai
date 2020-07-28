export class Graph {

    private graphId: string;
    private status: string;

    constructor(graphId: string, status: string){
        this.graphId = graphId;
        this.status = status;
    }

    public getId(): string {
        return this.graphId;
    }

    public getStatus() : string {
        return this.status;
    }
}
