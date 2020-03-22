import React, { PureComponent } from "react";
import { StyleSheet, Image } from "react-native";
// import { snake } from "./images";

// const snake = ;

class Head extends PureComponent {
    render() {
        const x = this.props.position[0];
        const y = this.props.position[1];

        return (
            <Image source={require('./images/snake.png')} width={this.props.size} height={this.props.size} style={[styles.finger, { width: this.props.size, height: this.props.size, left: x * this.props.size, top: y * this.props.size }]} />
            // <View style={[styles.finger, { width: this.props.size, height: this.props.size, left: x * this.props.size, top: y * this.props.size }]}>
            // </View>
        );
    }
}

const styles = StyleSheet.create({
    finger: {
        // backgroundColor: '#888888',
        position: "absolute",
        // borderTopLeftRadius: 20,
        // borderBottomLeftRadius: 20,
        // borderTopRightRadius: 50
    }
});

export { Head };
