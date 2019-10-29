exports.getAll = async function(event, context) {
    try {
        body = [
            "graph1",
            "graph2"
        ]

        return {
            statusCode: 200,
            headers: {},
            body: JSON.stringify(body)
        }
    } catch (error) {
        var body = error.stack || JSON.stringify(error, null, 2);

        return {
        statusCode: 400,
            headers: {},
            body: JSON.stringify(body)
        }
    }
}

exports.delete = async function(event, context) {
    try {
        const pathParams = event.pathParameters
    
        if (pathParams.graphUrl == null || pathParams.graphUrl == "") {
            return {
                statusCode: 400,
                headers: {},
                body: JSON.stringify("Unable to process request as the graph url was null")
            }
        }
    
        return {
            statusCode: 200,
            headers: {},
            body: JSON.stringify("Deleted graph with URL: \"" + pathParams.graphUrl + "\"")
        }
    } catch (error) {
        var body = error.stack || JSON.stringify(error, null, 2);

        return {
          statusCode: 400,
            headers: {},
            body: JSON.stringify(body)
        }
    }
}

exports.add = async function(event, context) {
    try {
        const requestBody = event.body != null ? JSON.parse(event.body) : null;

        if (requestBody == null || requestBody.name == null) {
            return {
                statusCode: 400,
                headers: {},
                body: JSON.stringify("Request body was malformed. Should be object containing field: name")
            }
        }

        return {
            statusCode: 201,
            headers: {},
            body: JSON.stringify("Added graph: " + requestBody.name)
        }
    } catch (error) {
        var body = error.stack || JSON.stringify(error, null, 2);

        return {
        statusCode: 400,
            headers: {},
            body: JSON.stringify(body)
        }
    }
}