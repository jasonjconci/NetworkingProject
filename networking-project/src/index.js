import React from "react";
import ReactDOM from "react-dom";
import { Button, Spinner } from "react-bootstrap";
import "./index.css";
import vis from "vis";

import $ from "jquery";

import App from "./App";
import * as serviceWorker from "./serviceWorker";

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
        var nodes = new vis.DataSet([
            { id: 1, label: "A" },
            { id: 2, label: "B" },
            { id: 3, label: "C" },
            { id: 4, label: "D" },
            { id: 5, label: "E" },
            { id: 6, label: "F" },
            { id: 7, label: "G" },
            { id: 8, label: "H" },
            { id: 9, label: "I" }
        ]);

        // create an array with edges
        var edges = new vis.DataSet([
            { from: 1, to: 3, label: "5" },
            { from: 1, to: 4, label: "2" },
            { from: 2, to: 3, label: "6" },
            { from: 2, to: 5, label: "2" },
            { from: 2, to: 6, label: "1" },
            { from: 3, to: 5, label: "1" },
            { from: 4, to: 5, label: "4" },
            { from: 4, to: 7, label: "7" },
            { from: 5, to: 7, label: "3" },
            { from: 5, to: 8, label: "3" },
            { from: 6, to: 8, label: "4" },
            { from: 7, to: 9, label: "2" }
        ]);

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
            $("#StartingNodeSpan").prop("innerHTML", nodes[0]);
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
            $("#EndingNodeSpan").prop("innerHTML", nodes[0]);
        }
        return null;
    }
    constructor() {
        super();
        this.setStartNode = this.setStartNode.bind(this);
        this.setEndNode = this.setEndNode.bind(this);
        this.state = { network: null };
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
