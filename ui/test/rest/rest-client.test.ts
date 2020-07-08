import {RestClient} from '../../src/rest/rest-client';

describe('Rest Client', () => {

    const restClient = new RestClient('testhost:8080');

    mock(fetch());

    it('get graphs', ()=>{
        // Given

        // When
        const actual = restClient.getAllGraphs();

        // Then
        expect()
    })

    it('get graph by id', ()=>{
        // Given
        mockReturn =

        // When
        const actual = restClient.getGraphById(1);

        // Then
        expect()
    })

});