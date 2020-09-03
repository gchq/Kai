export interface ICreateGraphRequestBody {
    graphName: string;
    administrators: Array<string>;
    schema: {
        elements: object;
        types: object;
    };
}
