export class RestClient {

    public static async getAllGraphs(): Promise<Array<Object>> {
        const response = await fetch('/graph');
        const body = await response.json();
    
        if (response.status !== 200) {
          throw Error(body.message) 
        }
        return body;
    }

    public static async getGraphById(graphId: number): Promise<Object> {
        const response = await fetch('/graph/' + graphId);
        const body = await response.json();
    
        if (response.status !== 200) {
          throw Error(body.message) 
        }
        return body;
    }

}