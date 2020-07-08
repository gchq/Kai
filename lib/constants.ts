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

import { Duration } from "@aws-cdk/core";

export const LAMBDA_LAYER_ARN = "arn:aws:serverlessrepo:us-east-1:903779448426:applications/lambda-layer-kubectl"; 
export const LAMBDA_LAYER_VERSION = "2.0.0-beta3";

// worker batch size
export const ADD_GRAPH_WORKER_BATCH_SIZE = 3; // can only be one of 3, 2, or 1 as Max timeout for visibility is 15 minutes
export const DELETE_GRAPH_WORKER_BATCH_SIZE = 5; // can go up to 7
// timeouts
const TIMEOUT_FOR_ADDING_GRAPH_IN_MINUTES = 5; // how long it should take for one graph to be added
const TIMEOUT_FOR_DELETING_GRAPH_IN_MINUTES = 2; // how long it should take for one graph to be deleted

export const DELETE_GRAPH_TIMEOUT = Duration.minutes(TIMEOUT_FOR_DELETING_GRAPH_IN_MINUTES * DELETE_GRAPH_WORKER_BATCH_SIZE);
export const ADD_GRAPH_TIMEOUT = Duration.minutes(TIMEOUT_FOR_ADDING_GRAPH_IN_MINUTES * ADD_GRAPH_WORKER_BATCH_SIZE);
export const DELETE_VOLUMES_TIMEOUT = Duration.minutes(1);