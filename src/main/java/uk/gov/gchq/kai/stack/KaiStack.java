/*
 * Copyright 2019 Crown Copyright
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
package uk.gov.gchq.kai;

import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.Stack;
import software.amazon.awscdk.core.StackProps;
import software.amazon.awscdk.services.apigateway.Resource;
import software.amazon.awscdk.services.apigateway.RestApi;
import software.amazon.awscdk.services.s3.HttpMethods;

public class KaiStack extends Stack {

    public KaiStack(final Construct parent, final String id) {
        this(parent, id, null);
    }

    public KaiStack(final Construct parent, final String id, final StackProps props) {
        super(parent, id, props);

        final RestApi kaiRestAPI = new RestApi(this, "KaiRestAPI");

        final Resource graphs = kaiRestAPI.getRoot().addResource("graphs");
        graphs.addMethod(HttpMethods.GET.name());
        graphs.addMethod(HttpMethods.POST.name());

        final Resource graph = graphs.addResource("{graph}");
        graph.addMethod(HttpMethods.DELETE.name());

    }
}
