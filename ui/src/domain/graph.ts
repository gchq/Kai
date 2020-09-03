export class Graph {
    
    private graphName: string;
    private status: string;

    constructor(graphName: string, status: string) {
        this.graphName = graphName;
        this.status = status;
    }

    public getId(): string {
        return this.graphName;
    }

    public getStatus(): string {
        return this.status;
    }
}
