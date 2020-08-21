import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { RestClient } from '../../src/rest/rest-client';
import { ApiError } from '../../src/domain/errors/api-error';

const mock = new MockAdapter(axios);

describe('RestClient 2** Responses', () => {
    beforeAll(() =>
        mock
            .onGet('/graphs')
            .reply(200, [{ graphId: 'any-graph', currentStatus: 'DEPLOYED' }])
            .onGet('/graphs/graph-1')
            .reply(200, { graphId: 'graph-1', currentStatus: 'DELETED' })
            .onPost('/graphs', { post: 'this' })
            .reply(201)
            .onDelete('/graphs/redundant-graph')
            .reply(202)
    );
    afterAll(() => mock.resetHandlers());

    it('should return status/data when GET is successful', async () => {
        const actual = await RestClient.get();

        expect(actual).toEqual({
            status: 200,
            data: [
                {
                    graphId: 'any-graph',
                    currentStatus: 'DEPLOYED',
                },
            ],
        });
    });
    it('should return status/data when GET with a path variable is successful', async () => {
        const actual = await RestClient.get('graph-1');

        expect(actual).toEqual({
            status: 200,
            data: {
                graphId: 'graph-1',
                currentStatus: 'DELETED',
            },
        });
    });
    it('should return status when POST with request body is successful', async () => {
        const actual = await RestClient.post({ post: 'this' });

        expect(actual).toEqual({
            status: 201,
        });
    });
    it('should return status when DELETE with path variable is successful', async () => {
        const actual = await RestClient.delete('redundant-graph');

        expect(actual).toEqual({
            status: 202,
        });
    });
});

describe('RestClient 4** Responses', () => {
    beforeAll(() =>
        mock
            .onGet('/graphs')
            .reply(404)
            .onGet('/graphs/unfindable-graph')
            .reply(404)
            .onPost('/graphs', { request: 'not-found' })
            .reply(404)
            .onDelete('/graphs/already-deleted')
            .reply(404)
    );
    afterAll(() => mock.resetHandlers());

    it('should throw 404 Error Message when api returns 404', async () => {
        await expect(RestClient.get()).rejects.toThrow(new ApiError(404, 'Request failed with status code 404'));
    });
    it('should throw 404 Error Message when api returns 404', async () => {
        await expect(RestClient.get('unfindable-graph')).rejects.toThrow(
            new ApiError(404, 'Request failed with status code 404')
        );
    });
    it('should throw 404 Error Message when api returns 404', async () => {
        await expect(RestClient.post({ request: 'not-found' })).rejects.toThrow(
            new ApiError(404, 'Request failed with status code 404')
        );
    });
    it('should throw 404 Error Message when api returns 404', async () => {
        await expect(RestClient.delete('unfindable-graph')).rejects.toThrow(
            new ApiError(404, 'Request failed with status code 404')
        );
    });
});
