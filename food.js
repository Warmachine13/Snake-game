import React, { Component } from "react";
import { StyleSheet, Image } from "react-native";

class Food extends Component {

    state = {
        imagens: [
            require('./images/food_1.png'),
            require('./images/food_2.png'),
            require('./images/food_3.png'),
            require('./images/food_4.png'),
            require('./images/food_5.png'),
            require('./images/food_6.png'),
            require('./images/food_7.png'),
            require('./images/food_8.png'),
            require('./images/food_9.png'),
            require('./images/food_10.png'),
            require('./images/food_11.png'),
        ],
        number: 0
    }

    shouldComponentUpdate(prevProps) {
        if (prevProps.pontos !== this.props.pontos || prevProps.position[0] !== this.props.position[0]) {
            return true
        } else {
            return false
        }
    }


    render() {
        const x = this.props.position[0];
        const y = this.props.position[1];
        return (
            <Image source={this.state.imagens[parseInt(Math.floor(Math.random() * 11))]} width={this.props.size} height={this.props.size} style={[styles.finger, { width: this.props.size, height: this.props.size, left: x * this.props.size, top: y * this.props.size }]} />
        );
    }
}

const styles = StyleSheet.create({
    finger: {
        // backgroundColor: 'green',
        // borderRadius: 50,
        position: "absolute"
    }
});

export { Food };
