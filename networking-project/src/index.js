import React from "react";
import ReactDOM from "react-dom";
import { Model } from "react-axiom";
import { Button, Spinner } from "react-bootstrap";
import "./index.css";
import vis from "vis";

import $ from "jquery";

import App from "./App";
import * as serviceWorker from "./serviceWorker";
import Router from "./Router.js";

class Graph extends React.Component {
    render() {
        return <div className="graph" id="mynetwork" />;
    }
}

class DeleteEdgeButton extends React.Component {
    render(){
        return(
            <Button onClick={this.props.onClickFunction}>Delete Selected Edge</Button>
        );
    }
}

class SetStartButton extends React.Component {
    render() {
        return (
            <Button onClick={this.props.onClickFunction}>Set Start Node</Button>
        );
    }
}
class SetEndButton extends React.Component {
    render() {
        return (
            <Button onClick={this.props.onClickFunction}>Set End Node</Button>
        );
    }
}
class EditEdgeWeight extends React.Component {
    render() {
        return (
            <div id="EditEdgeWeightInputWrapper">
                <Button onClick={this.props.onClickFunction}>
                    Edit Edge Weight
                </Button>
                <label htmlFor="editEdgeWeightInput">New Edge Weight</label>
                <input id="editEdgeWeightInput" />
            </div>
        );
    }
}


class CalculateButton extends React.Component {
    render() {
        return (
            <Button onClick={this.props.onClickFunction}>Calculate Path</Button>
        );
    }
}

class Main extends React.Component {
    componentDidMount() {
        this.resetNetwork();
    }

    resetNetwork() {
        var nodes = new vis.DataSet(this.state.nodes);

        // create an array with edges
        var edges = new vis.DataSet(this.state.edges);

        // create a network
        var container = document.getElementById("mynetwork");

        // provide the data in the vis format
        var data = {
            nodes: nodes,
            edges: edges
        };
        var options = {
            edges: {
                color: {
                    inherit: false
                }
            },
            autoResize: true,
            height: "400px",
            width: "800px",
            locale: "en",
            clickToUse: false,
            interaction: {
                dragNodes: false,
                dragView: false,

                multiselect: false,
                navigationButtons: false,
                selectable: true,
                selectConnectedEdges: false,
                tooltipDelay: 300,
                zoomView: false
            },
            layout: {
                randomSeed: 3
            }
        };

        // initialize your network!
        var visNetwork = new vis.Network(container, data, options);
        this.setState(() => {
            console.log("loaded network");
            return { network: visNetwork };
        });
    }

    setStartNode() {
        var network = this.state.network;
        var nodes = network.getSelectedNodes();
        if (nodes[0] == undefined) {
            alert("No nodes selected");
        } else if (nodes.length > 1) {
            alert("Please Select 1 node only");
        } else {
            this.state.startNode = nodes[0];
            $("#StartingNodeSpan").prop("innerHTML", this.state.startNode);
        }
        return null;
    }
    editEdgeWeight() {
        var network = this.state.network;
        var edges = network.getSelectedEdges();
        var value = $("#editEdgeWeightInput").val();
        if (edges[0] == undefined) {
            alert("No edges selected");
        } else if (isNaN(value)) {
            alert("Please enter valid weight");
        } else if (edges.length > 1) {
            alert("Please Select 1 edge only");
        } else {
            var newEdges = this.state.edges;
            for (var i = 0; i < this.state.edges.length; i++) {
                if (this.state.edges[i].id == edges[0]) {
                    newEdges[i].label = value;
                }
            }
            this.setState({
                edges: newEdges
            });
            this.resetNetwork();
        }
        return null;
    }
    removeEdge(){
        var network = this.state.network;
        var edges = network.getSelectedEdges();
        if (edges[0] == undefined) {
            alert("No edges selected");
        } else if (edges.length > 1) {
            alert("Please Select 1 edge only");
        } else {
            console.log("Got something, checking it out");
            console.log(edges[0].from, edges[0].to);
            var newEdges = this.state.edges;
            var index = 0;
            for (var i = 0; i < newEdges.length; i++){
                if (this.state.edges[i].id == edges[0]){
                    newEdges.splice(i, 1);
                }
            }
            this.setState({
                edges: newEdges
            });
            this.resetNetwork();
        }
        return null;
    }

    setEndNode() {
        var network = this.state.network;
        var nodes = network.getSelectedNodes();
        if (nodes[0] == undefined) {
            alert("No nodes selected");
        } else if (nodes.length > 1) {
            alert("Please Select 1 node only");
        } else {
            this.state.endNode = nodes[0];
            $("#EndingNodeSpan").prop("innerHTML", this.state.endNode);
        }
        return null;
    }

    hasBeenSelected(S, node) {
        for (var i = 0; i < S.length; i++) {
            if (S[i][0] == node) {
                return true;
            }
        }
        return false;
    }

    dumbstra() {
        if (this.state.startNode == null || this.state.endNode == null) {
            return;
        }
        console.log(this.state.startNode);
        console.log(typeof this.state.startNode);
        var S = [[this.state.startNode, null]];
        var All = [];
        var matrix = {};
        for (var i = 0; i < this.state.nodes.length; i++) {
            if (i !== this.state.startNode) {
                All.push(i);
                matrix[i] = [];
            }
        }
        // Initializing matrix, such that all nodes are initialized with a node in S
        // that they came from (ie, nodes which are connected with startNode)
        for (var i = 0; i < All.length; i++) {
            var node = All[i];
            for (var j = 0; j < this.state.edges.length; j++) {
                var link = this.state.edges[j];
                if (link.from == this.state.startNode && link.to == node) {
                    matrix[node].push(this.state.startNode);
                } else if (
                    link.from == node &&
                    link.to == this.state.startNode
                ) {
                    matrix[node].push(this.state.startNode);
                }
            }
        }
        // While we haven't hit all nodes,
        while (All.length != 0) {
            // Select a random node whcih we haven't chosen yet
            /** THIS WORKS I THINK */
            var chosen = All[Math.floor(Math.random() * All.length)];
            while (
                this.hasBeenSelected(S, chosen) ||
                matrix[chosen].length == 0
            ) {
                const rand = Math.floor(Math.random() * All.length);
                chosen = All[rand];
            }
            // Select a random way we could've gotten to our selected node (necessary since we could have
            // multiple routes to this node, and we need it to be random)
            var predacessor =
                matrix[chosen][
                    Math.floor(Math.random() * matrix[chosen].length)
                ];
            // Add the node-predacessor bit to S
            S.push([chosen, predacessor]);
            // Get the index of the chosen element and remove it from All
            var indexOfChosen = All.indexOf(chosen);
            if (indexOfChosen != -1) {
                All.splice(indexOfChosen, 1);
            }

            if (All.length > 0) {
                // Recalculate what paths are valid after adding Chosen to S
                // For each possible source node,
                for (var i = 0; i < S.length; i++) {
                    var source = parseInt(S[i][0], 10);
                    // For each possible node in the network that can't be a source,
                    for (var j = 0; j < All.length; j++) {
                        var dest = parseInt(All[j], 10);
                        // Loop over all nodes in the network
                        for (var k = 0; k < this.state.edges.length; k++) {
                            // And determine whether or not there are any new possible links we can use
                            var link = this.state.edges[k];
                            console.log(source, dest, link.from, link.to);
                            console.log(
                                typeof source,
                                typeof dest,
                                typeof link.from,
                                typeof link.to
                            );
                            if (
                                parseInt(link.from, 10) == source &&
                                parseInt(link.to, 10) == dest &&
                                matrix[node].indexOf(source) == -1
                            ) {
                                console.log("GOT ONE");
                                matrix[dest].push(source);
                            } else if (
                                parseInt(link.from, 10) == dest &&
                                parseInt(link.to, 10) == source &&
                                matrix[node].indexOf(source) == -1
                            ) {
                                console.log("GOT ONE");
                                matrix[dest].push(source);
                            }
                        }
                    }
                }
            }
        }

        var route = [];
        console.log(route);
        // Loop over all selected nodes (when we're here, it should be all nodes)
        for (var i = 0; i < S.length; i++) {
            var testNode = S[i];
            // If we've hit our desired destination node,
            if (testNode[0] == this.state.endNode) {
                var currNode = testNode;
                // Loop until we hit our startNode
                while (currNode[1] != null) {
                    // Push currNode, find the next node in the chain, repeat
                    route.push(currNode);
                    var index = 0;
                    while (S[index][0] != currNode[1]) {
                        index++;
                    }
                    currNode = S[index];
                }
            }
        }
        console.log(route);

        /** NOTE: THIS SECTION DOESN'T REALLY WORK YET. STILL DEBUGGING */

        var copyEdges = this.state.edges;
        for(var k = 0; k < copyEdges.length; k++){
            copyEdges[k].color = { color: "blue" };
        }
        // For each of our calculated routes,
        for (var i = 0; i < route.length; i++) {
            var routeEdge = route[i];
            for (var j = 0; j < copyEdges.length; j++) {
                var currEdge = copyEdges[j];
                // If we get a match in one direction, add it with red color
                if (
                    currEdge.from == routeEdge[0] &&
                    currEdge.to == routeEdge[1]
                ) {
                    copyEdges[j].color = { color: "red" };
                }
                // If we get a match in the other direction, add it with red color
                else if (
                    currEdge.from == routeEdge[1] &&
                    currEdge.to == routeEdge[0]
                ) {
                    copyEdges[j].color = { color: "red" };
                }
            }
        }

        this.setState({
            edges: copyEdges
        });
        console.log(copyEdges);
        console.log(this.state.edges);
        this.resetNetwork();
    }

    constructor() {
        super();
        this.setStartNode = this.setStartNode.bind(this);
        this.setEndNode = this.setEndNode.bind(this);
        this.dumbstra = this.dumbstra.bind(this);
        this.editEdgeWeight = this.editEdgeWeight.bind(this);
        this.removeEdge = this.removeEdge.bind(this);
        this.state = {
            network: null,
            startNode: null,
            endNode: null,
            nodes: [
                { id: 0, label: "A" },
                { id: 1, label: "B" },
                { id: 2, label: "C" },
                { id: 3, label: "D" },
                { id: 4, label: "E" },
                { id: 5, label: "F" },
                { id: 6, label: "G" },
                { id: 7, label: "H" },
                { id: 8, label: "I" }
            ],
            edges: [
                { from: 0, to: 2, label: "5", width: 3 },
                { from: 0, to: 3, label: "2", width: 3 },
                { from: 1, to: 2, label: "6", width: 3 },
                { from: 1, to: 4, label: "2", width: 3 },
                { from: 1, to: 5, label: "1", width: 3 },
                { from: 2, to: 4, label: "1", width: 3 },
                { from: 3, to: 4, label: "4", width: 3 },
                { from: 3, to: 6, label: "7", width: 3 },
                { from: 4, to: 6, label: "3", width: 3 },
                { from: 4, to: 7, label: "3", width: 3 },
                { from: 5, to: 7, label: "4", width: 3 },
                { from: 6, to: 8, label: "2", width: 3 }
            ]
        };
    }
    render() {
        console.log(this.state.network);
        var network = this.state.network;
        if (network) {
            return (
                <div className="wrapper">
                    <Graph />
                    <div>
                        <SetStartButton onClickFunction={this.setStartNode} />
                        <SetEndButton onClickFunction={this.setEndNode} />
                        <CalculateButton onClickFunction={this.dumbstra} />
                    </div>
                    <div>
                        <EditEdgeWeight onClickFunction={this.editEdgeWeight} />
                    </div>
                    <DeleteEdgeButton onClickFunction={this.removeEdge} />
                    <div id="StartEndingNode">
                        <div id="StartNode">
                            <h4>Starting Node: </h4>
                            <span id="StartingNodeSpan">None</span>
                        </div>
                        <div id="EndingNode">
                            <h4>Ending Node: </h4>
                            <span id="EndingNodeSpan">None</span>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="wrapper">
                    <Graph />
                    <Spinner animation="border" role="status">
                        <span className="sr-only">Loading...</span>
                    </Spinner>
                </div>
            );
        }
    }
}
ReactDOM.render(<Main />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
