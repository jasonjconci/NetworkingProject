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

class RouterGroup extends Model {
    static defaultState() {
        return {
            routers: {}
        };
    }

    setup() {
        var routerList = [];
        for (var i = 0; i < 10; i++) {
            var r = new RouterObject({
                id: i
            });
            routerList.push(r);
        }
        this.setRouters(routerList);
    }
}

class RouterObject extends Model {
    static defaultState() {
        return {
            id: 0
        };
    }
}

class Graph extends React.Component {
    render() {
        return <div className="graph" id="mynetwork" />;
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

class Main extends React.Component {
    componentDidMount() {
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
            }
        };

        // initialize your network!
        var visNetwork = new vis.Network(container, data, options);
        this.setState(() => {
            console.log("loaded network");
            return { network: visNetwork };
        });
        this.forceUpdate();
    }
    setStartNode() {
        var network = this.state.network;
        var nodes = network.getSelectedNodes();
        if (nodes[0] == undefined) {
            alert("No nodes selected");
        } else if (nodes.length > 1) {
            alert("Please Selected 1 node only");
        } else {
            this.state.startNode = nodes[0];
            $("#StartingNodeSpan").prop("innerHTML", this.state.startNode);
        }
        return null;
    }
    setEndNode() {
        var network = this.state.network;
        var nodes = network.getSelectedNodes();
        if (nodes[0] == undefined) {
            alert("No nodes selected");
        } else if (nodes.length > 1) {
            alert("Please Selected 1 node only");
        } else {
            this.state.endNode = nodes[0];
            $("#EndingNodeSpan").prop("innerHTML", this.state.endNode);
        }
        return null;
    }

    hasBeenSelected(S, node){
        for(var i in S){
            if(i[0] == node){
                return true;
            }
        }
        return false;
    }


    dumbstra() {
        S = [[this.state.startNode, null]];
        All = [];
        matrix = {};
        for(var i = 0; i < this.state.nodes.length; i++){
            if (i !== this.state.startNode){
                All.push(i);
                matrix[i] = [];
            }
        }
        // Initializing matrix, such that all nodes are initialized with a node in S
        // that they came from (ie, nodes which are connected with startNode)
        for (var node in All){
            for (var link in this.state.edges){
                if (link.from == this.state.startNode && link.to == node){
                    matrix[node].push(this.state.startNode);
                } else if (link.rom == node && link.to == this.state.startNode){
                    matrix[node].push(this.state.startNode);
                }
            }
        }
        // While we haven't hit all nodes,
        while (All.length != 0){
            // Select a random node whcih we haven't chosen yet
            var chosen = All[Math.floor(Math.random()*All.length)];
            while(hasBeenSelected(S, chosen) || matrix[chosen].length == 0){
                chosen = All[Math.floor(Math.random()*All.length)];
            }
            // Select a random way we could've gotten to our selected node (necessary since we could have
            // multiple routes to this node, and we need it to be random)
            var predacessor = matrix[chosen][Math.floor(Math.random()*matrix[chosen].length)];
            // Add the node-predacessor bit to S
            S.push([chosen, predacessor]);
            // Get the index of the chosen element and remove it from All
            var indexOfChosen = All.indexOf(chosen);
            if(indexOfChosen != -1){
                All.splice(indexOfChosen, 1);
            }
            // Recalculate what paths are valid after adding Chosen to S
            // For each possible source node,
            for(var node in S){
                source = node[0];
                // For each possible node in the network that can't be a source,
                for (var dest in All){
                    // Loop over all nodes in the network
                    for (var link in this.state.edges){
                        // And determine whether or not there are any new possible links we can use
                        if (link.from == this.state.startNode && link.to == node && matrix[dest].indexOf(source) == -1){
                            matrix[dest].push(source);
                        } else if (link.rom == node && link.to == this.state.startNode && matrix[dest].indexOf(source) == -1){
                            matrix[dest].push(source);
                        }
                    }
                }
            }
        }
        var route = []
        // Loop over all selected nodes (when we're here, it should be all nodes)
        for(var i in S){
            // If we've hit our desired destination node,
            if (i[0] == this.state.endNode){
                var currNode = i;
                // Loop until we hit our startNode
                while(currNode[1] != null){
                    // Push currNode, find the next node in the chain, repeat
                    route.push(currNode);
                    var index = 0;
                    while(S[index][0] != currNode[1]){
                        index++;
                    }
                    currNode = S[index];
                }
            }
        }
        console.log(route);        
    }



    constructor() {
        super();
        this.setStartNode = this.setStartNode.bind(this);
        this.setEndNode = this.setEndNode.bind(this);
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
                { from: 0, to: 2, label: "5" },
                { from: 0, to: 3, label: "2" },
                { from: 1, to: 2, label: "6" },
                { from: 1, to: 4, label: "2" },
                { from: 1, to: 5, label: "1" },
                { from: 2, to: 4, label: "1" },
                { from: 3, to: 4, label: "4" },
                { from: 3, to: 6, label: "7" },
                { from: 4, to: 6, label: "3" },
                { from: 4, to: 7, label: "3" },
                { from: 5, to: 7, label: "4" },
                { from: 6, to: 8, label: "2" }
            ]
        };
    }
    render() {
        console.log(this.state.network);
        var network = this.state.network;
        const routerGroup = new RouterGroup();
        routerGroup.setup();
        if (network) {
            return (
                <div className="wrapper">
                    <Graph />
                    <SetStartButton onClickFunction={this.setStartNode} />
                    <SetEndButton onClickFunction={this.setEndNode} />
                    <div id="StartEndingNode">
                        <div id="StartNode">
                            <h4>Starting Node: </h4>
                            <span id="StartingNodeSpan">None</span>
                        </div>
                        <div id="EndingNode">
                            <h4>Ending Node: </h4>
                            <span id="EndingNodeSpan">None</span>
                        </div>
                        <span>{routerGroup.getRouters()[3].getId()}</span>
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
