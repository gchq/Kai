export interface ICreateGraphRequestBody {
    graphId: string;
    administrators: Array<string>;
    schema: {
        elements: object;
        types: object;
    };
}
