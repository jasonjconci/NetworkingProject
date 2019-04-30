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

class RouteTable extends React.Component {
    render() {
        return (
            <tr>
                <td>{this.props.index}</td>
                <td>{this.props.edge}</td>
            </tr>
        );
    }
}

class DeleteEdgeButton extends React.Component {
    render() {
        return (
            <Button onClick={this.props.onClickFunction}>Delete Edge</Button>
        );
    }
}

class SetStartButton extends React.Component {
    render() {
        return <Button onClick={this.props.onClickFunction}>Start Node</Button>;
    }
}
class SetEndButton extends React.Component {
    render() {
        return <Button onClick={this.props.onClickFunction}>End Node</Button>;
    }
}
class EditEdgeWeight extends React.Component {
    render() {
        return (
            <div id="EditEdgeWeightInputWrapper">
                <Button onClick={this.props.onClickFunction}>Edit Edge</Button>
                <label htmlFor="editEdgeWeightInput">Weight: </label>
                <input id="editEdgeWeightInput" />
            </div>
        );
    }
}

class CalculateButton extends React.Component {
    render() {
        return <Button onClick={this.props.onClickFunction}>Run</Button>;
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
    removeEdge() {
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
            for (var i = 0; i < newEdges.length; i++) {
                if (this.state.edges[i].id == edges[0]) {
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

        var edges = this.state.edges;

        var list = [];

        /** NOTE: THIS SECTION DOESN'T REALLY WORK YET. STILL DEBUGGING */

        var copyEdges = this.state.edges;
        for (var k = 0; k < copyEdges.length; k++) {
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
                    list.push({
                        edge: currEdge.id,
                        trafficSize: 7,
                        isBackward: true
                    });
                }
                // If we get a match in the other direction, add it with red color
                else if (
                    currEdge.from == routeEdge[1] &&
                    currEdge.to == routeEdge[0]
                ) {
                    copyEdges[j].color = { color: "red" };
                    list.push({
                        edge: currEdge.id,
                        trafficSize: 7,
                        isBackward: false
                    });
                }
            }
        }
        list = list.reverse();
        this.setState({
            edges: copyEdges
        });
        console.log(copyEdges);
        console.log(this.state.edges);

        var self = this;
        const frameLength = 333;

        console.log(list);

        if (list.length !== 0) {
            for (let i = 0; i < list.length; i++) {
                setTimeout(() => {
                    console.log("Frame: ", i);
                    self.state.network.animateTraffic(list[i]);
                }, frameLength * i);
            }
            setTimeout(() => {
                self.resetNetwork();
            }, frameLength * list.length);
        }
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
                {
                    id: 0,
                    label: "A",
                    color: {
                        highlight: "#00b4ff"
                    }
                },
                {
                    id: 1,
                    label: "B",
                    color: {
                        highlight: "#00b4ff"
                    }
                },
                {
                    id: 2,
                    label: "C",
                    color: {
                        highlight: "#00b4ff"
                    }
                },
                {
                    id: 3,
                    label: "D",
                    color: {
                        highlight: "#00b4ff"
                    }
                },
                {
                    id: 4,
                    label: "E",
                    color: {
                        highlight: "#00b4ff"
                    }
                },
                {
                    id: 5,
                    label: "F",
                    color: {
                        highlight: "#00b4ff"
                    }
                },
                {
                    id: 6,
                    label: "G",
                    color: {
                        highlight: "#00b4ff"
                    }
                },
                {
                    id: 7,
                    label: "H",
                    color: {
                        highlight: "#00b4ff"
                    }
                },
                {
                    id: 8,
                    label: "I",
                    color: {
                        highlight: "#00b4ff"
                    }
                }
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
                        <SetStartButton
                            className="SetStartButton"
                            onClickFunction={this.setStartNode}
                        />
                        <SetEndButton
                            className="SetEndButton"
                            onClickFunction={this.setEndNode}
                        />
                        <CalculateButton
                            className="CalculateButton"
                            onClickFunction={this.dumbstra}
                        />
                    </div>
                    <div className="row">&nbsp;</div>
                    <div>
                        <EditEdgeWeight onClickFunction={this.editEdgeWeight} />
                    </div>
                    <div className="row">&nbsp;</div>
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

// Author: Edvin Eshagh
//
// Date: 6/22/2015
//
// Purpose:  animate traffic from one node to another.
//

vis.Network.prototype.animateTraffic = function(
    edgesTrafficList,
    onPreAnimationHandler,
    onPreAnimateFrameHandler,
    onPostAnimateFrameHandler,
    onPostAnimationHandler
) {
    var thisAnimator = this;

    var trafficAnimator = {
        thisNetwork: this,

        trafficCanvas: null,
        trafficCanvasCtx: null,
        trafficCanvasWidth: null,
        trafficCanvasHeight: null,

        reportedErrors: {}, // Helps to avoid reporting the same error in multiple setTimeout events

        edgesTrafficList: edgesTrafficList,

        onPreAnimateFrame: onPreAnimateFrameHandler,
        ontPostAnimateFrame: onPostAnimateFrameHandler,
        onPreAnimation: onPreAnimationHandler,
        onPostAnimation: onPostAnimationHandler,

        //////////////////////////////////////////////////////////////
        //
        // return object {edge, trafficSize, isBackward}
        parseEdgeTraffic: function(edgeTraffic) {
            var edge;
            if (edgeTraffic.edge) {
                edge = edgeTraffic.edge.edgeType
                    ? edgeTraffic.edge
                    : this.thisNetwork.body.edges[edgeTraffic.edge.id] ||
                      this.thisNetwork.body.edges[edgeTraffic.edge];
            } else {
                edge = this.thisNetwork.body.edges[edgeTraffic];
            }

            return {
                edge: edge,
                trafficSize: edgeTraffic.trafficSize || 1,
                isBackward: edge && edgeTraffic.isBackward
            };
        },

        //////////////////////////////////////////////////////////////
        //
        clearAnimationCanvas: function() {
            this.trafficCanvasCtx.save();
            this.trafficCanvasCtx.setTransform(1, 0, 0, 1, 0, 0);
            this.trafficCanvasCtx.clearRect(
                0,
                0,
                this.trafficCanvasWidth,
                this.trafficCanvasHeight
            );
            this.trafficCanvasCtx.restore();
        },

        //////////////////////////////////////////////////////////////
        //
        getNetworkTrafficCanvas: function() {
            this.trafficCanvas = this.thisNetwork.body.container.getElementsByClassName(
                "networkTrafficCanvas"
            )[0];

            if (this.trafficCanvas == undefined) {
                var frame = this.thisNetwork.canvas.frame;
                this.trafficCanvas = document.createElement("canvas");
                this.trafficCanvas.className = "networkTrafficCanvas";
                this.trafficCanvas.style.position = "absolute";
                this.trafficCanvas.style.top = this.trafficCanvas.style.left = 0;
                this.trafficCanvas.style.zIndex = 1;
                this.trafficCanvas.style.pointerEvents = "none";
                this.trafficCanvas.style.width = frame.style.width;
                this.trafficCanvas.style.height = frame.style.height;

                this.trafficCanvas.width = frame.canvas.clientWidth;
                this.trafficCanvas.height = frame.canvas.clientHeight;

                frame.appendChild(this.trafficCanvas);
            }

            return this.trafficCanvas;
        },

        //////////////////////////////////////////////////////////////
        //
        animateFrame: function(offset, frameCounter) {
            this.clearAnimationCanvas();

            var maxOffset = 0.9;

            var reportedError = {};

            if (offset > maxOffset) {
                if (this.onPostAnimation)
                    this.onPostAnimation(this.edgesTrafficList);
                return;
            }
            for (var i in this.edgesTrafficList) {
                var edgeTraffic = this.parseEdgeTraffic(
                    this.edgesTrafficList[i]
                );

                if (!edgeTraffic.edge) {
                    if (!this.reportedErrors[this.edgesTrafficList[i]]) {
                        console.error(
                            "No edge path defined: ",
                            this.edgesTrafficList[i]
                        );
                        this.reportedErrors[this.edgesTrafficList[i]] = true;
                    }
                    continue;
                }

                if (
                    this.onPreAnimateFrameHandler &&
                    this.onPreAnimateFrameHandler(edgeTraffic, frameCounter) ===
                        false
                ) {
                    continue;
                }

                //              var s = edgeTraffic.edge.body.view.scale;
                //              var t = edgeTraffic.edge.body.view.translation;
                var p = edgeTraffic.edge.edgeType.getPoint(
                    edgeTraffic.isBackward ? maxOffset - offset : offset
                );

                //              this.trafficCanvasCtx.beginPath();
                //                  this.trafficCanvasCtx.arc(p.x, p.y, parseInt(edgeTraffic.trafficSize)+1 || 2, 0, Math.PI*2, false);
                //                  this.trafficCanvasCtx.lineWidth=1;
                //                  this.trafficCanvasCtx.strokeStyle="#000";
                //                  this.trafficCanvasCtx.fillStyle = "red";
                //                  this.trafficCanvasCtx.fill();
                //                  this.trafficCanvasCtx.stroke();
                //              this.trafficCanvasCtx.closePath();

                this.trafficCanvasCtx.beginPath();
                this.trafficCanvasCtx.arc(
                    p.x,
                    p.y,
                    parseInt(edgeTraffic.trafficSize) || 1,
                    0,
                    Math.PI * 2,
                    false
                );
                this.trafficCanvasCtx.lineWidth = 1;
                this.trafficCanvasCtx.strokeWidth = 4;
                this.trafficCanvasCtx.strokeStyle = "rgba(57,138,255,0.1)";
                this.trafficCanvasCtx.fillStyle = "#ff0010";
                this.trafficCanvasCtx.fill();
                this.trafficCanvasCtx.stroke();
                this.trafficCanvasCtx.closePath();

                if (
                    this.onPostAnimateFrame &&
                    this.onPostAnimateFrame(edgeTraffic, frameCounter) === false
                ) {
                    if (this.onPostAnimation)
                        this.onPostAnimation(this.edgesTrafficList);
                    return;
                }
            }

            setTimeout(
                this.animateFrame.bind(this),
                10,
                offset + 0.03333,
                frameCounter++
            );
        },

        initalizeCanvasForEdgeAnimation: function() {
            this.reportedErrors = {};

            if (
                Object.prototype.toString.call(this.edgesTrafficList) !==
                "[object Array]"
            ) {
                this.edgesTrafficList = [this.edgesTrafficList];
            }

            this.trafficCanvas = this.getNetworkTrafficCanvas();

            this.trafficCanvasCtx = this.trafficCanvas.getContext("2d");
            this.trafficCanvasWidth = this.trafficCanvasCtx.canvas.width;
            this.trafficCanvasHeight = this.trafficCanvasCtx.canvas.height;

            var edgeTraffic = this.parseEdgeTraffic(this.edgesTrafficList[0]);

            var s = this.thisNetwork.getScale(); // edgeTraffic.edge.body.view.scale;
            var t = this.thisNetwork.body.view.translation; //edgeTraffic.edge.body.view.translation;

            this.trafficCanvasCtx.setTransform(1, 0, 0, 1, 0, 0);
            this.trafficCanvasCtx.translate(t.x, t.y);
            this.trafficCanvasCtx.scale(s, s);
        }
    };

    trafficAnimator.initalizeCanvasForEdgeAnimation();

    if (
        trafficAnimator.onPreAnimation &&
        trafficAnimator.onPreAnimation(trafficAnimator.edgesTrafficList) ===
            false
    )
        return;

    trafficAnimator.animateFrame(0.15 /*animationStartOffset*/, 0 /*frame*/);
};

vis.Network.prototype.animateTrafficOnPostAnimation = function(
    edgesTrafficList
) {
    // add the value from the source traffic to target
    for (var i in edgesTrafficList) {
        edgeTraffic = this.parseEdgeTraffic(edgesTrafficList[i]);
        if (!edgeTraffic.edge) {
            continue;
        }
        var toValue = edgeTraffic.edge.to.getValue();
        if (parseFloat(toValue)) {
            var newValue =
                (toValue || 0) +
                (edgeTraffic.isBackward ? -1 : 1) * edgeTraffic.trafficSize;

            this.thisNetwork.body.data.nodes.update({
                id: edgeTraffic.edge.toId,
                value: newValue
            });
        }
    }
};

vis.Network.prototype.animateTrafficOnPreAnimation = function(
    edgesTrafficList
) {
    // remove the value from the source traffic
    for (var i in edgesTrafficList) {
        edgeTraffic = this.parseEdgeTraffic(edgesTrafficList[i]);
        if (!edgeTraffic.edge) {
            continue;
        }
        var fromValue = edgeTraffic.edge.from.getValue();
        if (parseFloat(fromValue)) {
            var newValue =
                fromValue +
                (edgeTraffic.isBackward ? -1 : 1) * -edgeTraffic.trafficSize;
            S;
            this.thisNetwork.body.data.nodes.update({
                id: edgeTraffic.edge.fromId,
                value: Math.max(0, newValue)
            });
        }
    }
};
