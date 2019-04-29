import React from "react";

class Router extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            nodes: this.props.nodes,
            edges: this.props.edges,
            id: this.props.id,
            routingTable: null
        };
        
        this.calculateRoutingTable();

    }

    calculateRoutingTable(){
        var s = [[this.state.id, null]];
        var indexOfThis = this.state.nodes.indexOf(this.state.id);
        var all = this.state.nodes.splice(0);
        if(indexOfThis !== -1) All.splice(indexOfThis);
        var matrix = new Object();
    }

    render(){
        return null;
    }
}