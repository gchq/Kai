import { RestClient } from '../../src/rest/rest-client';
import { Graph } from '../../src/domain/graph';
import helpers from "../setupTests";
import { Schema } from '../../src/domain/schema';

beforeEach(() => {
  fetchMock.resetMocks();
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

