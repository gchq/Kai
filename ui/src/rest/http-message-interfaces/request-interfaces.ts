import {ISchema} from "../../domain/schema";

export interface ICreateGraphRequestBody {
    graphName: string;
    administrators: Array<string>;
    schema: ISchema
}
