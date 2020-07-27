export class RestClient {

    public async getAllGraphs(url:string): Promise<Array<Object>> {
        const response = await fetch(url);
        const body = await response.json();
    
        if (response.status !== 200) {
          throw Error(body.message) 
        }
        return body;
    }

    public async getGraphById(url:string, graphId: number): Promise<Object> {
        const response = await fetch(url + graphId);
        const body = await response.json();
    
        if (response.status !== 200) {
          throw Error(body.message) 
        }
        return body;
        
    }

    public async deleteGraphById(url:string, graphId: number): Promise<Object> {
      const response = await fetch(url + graphId, {
        method: 'delete',
      });
      const body = await response.json();
      if (response.status !== 200) {
        throw Error(body.message) 
      }
      return body;
    }

}