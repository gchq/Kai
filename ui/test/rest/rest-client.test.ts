import { RestClient } from '../../src/rest/rest-client';
require("../setupTests");
import helpers from "../setupTests";


beforeEach(() => {
  fetchMock.resetMocks();
});
const rest = new RestClient();

describe('get graph data', () => {

  it('Successfuly get graphs', async () => {
      const mockSuccessResponse = [
        {
            graphId: "roadTraffic",
            currentState: "DEPLOYED"
        },
        {
            graphId: "basicGraph",
            currentState: "DELETION_QUEUED"
        }
    ];
      fetchMock.mockResponseOnce(JSON.stringify(mockSuccessResponse));
      
    const actual = await rest.getAllGraphs('https://localhost:5000/graphs');

    expect(actual).toEqual(mockSuccessResponse);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('https://localhost:5000/graphs');

  });

  it('Handle error', async() => {
    fetchMock.mockReject(() => Promise.reject('http://bad.url'));

    const outcome = await helpers.syncify(async () => {
      return await rest.getAllGraphs('http://bad.url');
    });

    expect(outcome).toThrow();

  });
});

describe('get graph data by ID', () => {
  
  it('Successfuly get graph ID', async () => {
    const mockSuccessResponse = [
      {
        currentState : "DEPLOYED",
        graphId: ":10",
      }
  ];
    fetchMock.mockResponseOnce(JSON.stringify(mockSuccessResponse));

    const actual = await rest.getGraphById('https://localhost:5000/graphs/:', 10);

    expect(actual).toEqual(mockSuccessResponse);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('https://localhost:5000/graphs/:10');

  });

  it('Handle error', async() => {
    fetchMock.mockReject(() => Promise.reject('http://bad.url'));

    const outcome = await helpers.syncify(async () => {
      return await rest.getGraphById('http://bad.url', 10);
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

    const actual = await rest.deleteGraphById('https://localhost:5000/graphs/:', 10);
    
    expect(actual).toEqual(mockSuccessResponse);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('https://localhost:5000/graphs/:10', {"method": "delete"});
  });
  it('Handle error', async() => {
    fetchMock.mockReject(() => Promise.reject('http://bad.url'));

    const outcome = await helpers.syncify(async () => {
      return await rest.deleteGraphById('http://bad.url', 10);
    });

    expect(outcome).toThrow();

  });
});
