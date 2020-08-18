import { RestClient } from '../../src/rest/rest-client';
import { Graph } from '../../src/domain/graph';
import helpers from "../setupTests";
import { Schema } from '../../src/domain/schema';

beforeEach(() => {
  fetchMock.resetMocks();
});

describe('get graph data', () => {

  it('Successfuly get graphs', async () => {
    const mockSuccessResponse = [ {
      graphId: "roadTraffic",
      currentState: "DEPLOYED"
    }, {
      graphId: "basicGraph",
      currentState: "DELETION_QUEUED"
    }];
    fetchMock.mockResponseOnce(JSON.stringify(mockSuccessResponse));
      
    const actual: Graph[] = await RestClient.getAllGraphs();

    const expected = [
      new Graph("roadTraffic","DEPLOYED"),
      new Graph("basicGraph","DELETION_QUEUED"),
    ];
    expect(actual).toEqual(expected);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/graphs');
  });

  it('Handle error', async() => {
    fetchMock.mockReject(() => Promise.reject('http://bad.url'));

    const outcome = await helpers.syncify(async () => {
      return await RestClient.getAllGraphs();
    });

    expect(outcome).toThrow();
  });
});

describe('get graph data by ID', () => {
  
  it('Successfuly get graph ID', async () => {
    const mockSuccessResponse = {
        currentState : "DEPLOYED",
        graphId: "10",
    };
    fetchMock.mockResponseOnce(JSON.stringify(mockSuccessResponse));

    const actual: Graph = await RestClient.getGraphById(10);

    expect(actual).toEqual(new Graph('10', 'DEPLOYED'));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/graphs/10');
  });

  it('Handle error', async() => {
    fetchMock.mockReject(() => Promise.reject('http://bad.url'));

    const outcome = await helpers.syncify(async () => {
      return await RestClient.getGraphById(10);
    });

    expect(outcome).toThrow();
  });
});

describe('Delete graph by ID', () => {
  
  const mockSuccessResponse = [{
    currentState: "DELETION_IN_PROGRESS",
    graphId: ":10",
  }];
 
  it('Successfuly delete graph', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockSuccessResponse));

    const actual = await RestClient.deleteGraphById(10);
    
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/graphs/10', {"method": "delete"});
  });

  it('Handle error', async() => {
    fetchMock.mockReject(() => Promise.reject('http://bad.url'));

    const outcome = await helpers.syncify(async () => {
      return await RestClient.deleteGraphById(10);
    });

    expect(outcome).toThrow();
  });

});
describe('Create a new Graph', () => {
  it('should called with ', async() =>{
    const schema= new Schema(JSON.stringify({ elements: {}, types: {} }));

    fetchMock.mockResponse("", {status: 201});

    await RestClient.createNewGraph('id', [], schema)

    await expect(RestClient.createNewGraph('id', [], schema)).resolves.toEqual(undefined);
  })
  it('should throw unexpected response error, when response status is not 201 ', async() =>{
    const schema= new Schema(JSON.stringify({ elements: {}, types: {} }));


    fetchMock.mockResponse("", {status: 500});

    await expect(RestClient.createNewGraph('id', [], schema)).rejects.toEqual(Error('Graph was not created.'));
  })
  // it ('should respond with a 201 status, when a new graph is created', ())
})
