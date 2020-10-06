export interface IGraphByIdResponse {
    graphName: string;
    currentState: string;
}

export interface IAllGraphsResponse extends Array<IGraphByIdResponse> {}
