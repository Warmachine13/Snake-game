import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import Constants from './Constants';

class Tail extends Component {
    constructor(props) {
        super(props);
    }

    colorTween(i) {
        let p = parseInt((Math.PI ** i))
        var r1 = 0xff;
        var g1 = 0x00;
        var b1 = 0x00;
        var r2 = 0xaa;
        var g2 = 0x33;
        var b2 = 0xfc;
        var r3 = (256 + (r2 - r1) * p / 100 + r1).toString(16);
        var g3 = (256 + (g2 - g1) * p / 100 + g1).toString(16);
        var b3 = (256 + (b2 - b1) * p / 100 + b1).toString(16);
        return '#' + r3.substring(1, 3) + g3.substring(1, 3) + b3.substring(1, 3);
    }

    render() {

        let tailList = this.props.elements.map((el, idx) => {
            return <View key={idx} style={{ width: this.props.size, height: this.props.size, position: 'absolute', left: el[0] * this.props.size, top: el[1] * this.props.size, backgroundColor: this.colorTween(idx), borderRadius: 25 }} />
        });

        return (
            <View style={{ width: Constants.GRID_SIZE * this.props.size, height: Constants.GRID_SIZE * this.props.size }}>
                {tailList}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    finger: {
        backgroundColor: '#888888',
        position: "absolute"
    }
});

export { Tail };
