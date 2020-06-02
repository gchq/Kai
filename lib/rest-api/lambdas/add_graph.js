const AWS = require("aws-sdk");
const { spawn } = require("child_process")

exports.handler = function(event, context) {
    // Log in to the cluster
    const clusterName = process.env["clusterName"];

    const args = [ "eks", "update-kubeconfig", "--name", clusterName ];
    const login = spawn("aws", args)

    login.on("close", function(code, signal) {
        // should actually do code and signal checking here
        // call function to create the graph
        context.succeed("yay")
    }).on("error", function(err) {
        context.fail(err)
    })


}