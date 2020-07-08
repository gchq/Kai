export class RestClient {

    private static hostLocation: string;

    public constructor(hostLocation: string) {
        this.hostLocation = hostLocation;
    }

    public static async getAllGraphs(): Promise<Array<Object>> {
        const url: string = this.hostLocation + '/graphs';

        const httpResponse = await fetch(url);

        return [{
            graphId: 'id',
            status: 'STATUS',
        }];
    }

    public static async getGraphById(graphId: number): Promise<Object> {
        const url: string = this.hostLocation + '/graphs/' + graphId;

        return await fetch(url);
    }

}