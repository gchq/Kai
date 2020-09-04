/*
 * Copyright 2020 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface ISchemaData {
    graphName: string,
    administrators?: string[],
    schema?: Record<string, unknown>
}

export class SchemaBuilder {
    static createSchema(schemaData: ISchemaData): Record<string, unknown> {
        const schema: Record<string, unknown> = {};
        schema["graphName"] = schemaData.graphName;
        if (schemaData.administrators) {
            schema["administrators"] = schemaData.administrators;
        }
        if (schemaData.schema) {
            schema["schema"] = schemaData.schema;
        } else {
            schema["schema"] = {};
        }
        return schema;
    }
}