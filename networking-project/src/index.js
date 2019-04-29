import React from "react";
import ReactDOM from "react-dom";
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
