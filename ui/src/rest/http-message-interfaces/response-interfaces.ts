export interface IGraphByIdResponse {
    graphId: string;
    currentState: string;
}

export interface IAllGraphsResponse extends Array<IGraphByIdResponse> {}
