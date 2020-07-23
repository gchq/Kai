//import { RestClient } from '../../src/rest/rest-client';

const RestClient = require('../../src/rest/rest-client');

beforeEach(() => {
  fetch.resetMocks();
});

describe('get graph data', () => {
  const rest = new RestClient();

  it('Successfuly get graphs', async () => {
      const mockSuccessResponse = {
          graphId: "test",
          currentState: "TEST"
      };
  fetch.mockResponseOnce(JSON.stringify(mockSuccessResponse));

    const actual = await rest.getAllGraphs();

    expect(actual).toEqual(mockSuccessResponse);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/graph');

  });

  it('catches errors', async() => {
    fetch.mockReject(() => "API failure");

    const actual = await rest.getAllGraphs();
    const error = () => {
      throw new TypeError();
    }
    expect(actual).toEqual(error);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/graph');
  });
});

describe('get graph data by ID', () => {
  const rest = new RestClient();
  const mockGraphId = 10;
  it('Successfuly get graph ID', async () => {
  
  fetch.mockResponseOnce(JSON.stringify({
    graphId: mockGraphId
  }));

    const actual = await rest.getGraphById(mockGraphId);

    expect(actual).toEqual("test");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/graph/' + 10);

  });

  it('catches errors', async() => {
    fetch.mockReject(() => "API failure");

    const actual = await rest.getGraphById();
    const error = () => {
      throw new TypeError();
    }
    expect(actual).toEqual(error);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/graph' + 10);
  });
});