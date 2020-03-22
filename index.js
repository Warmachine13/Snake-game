import { AppRegistry } from "react-native";
import SnakeApp from "./App";
import { AsyncStorage } from 'react-native';

const Parse = require("parse/react-native");

Parse.initialize("isMCGHTlWXAs83dXDDOCqaM081bZ7paWjdZ8Z8La", "zcbs3dc3ofM2KB6WBpiPPIzct8O2xjmE7osAdGXz");
Parse.serverURL = 'https://parseapi.back4app.com'
Parse.setAsyncStorage(AsyncStorage);
// console.log(Parse)
// const Scores = Parse.Object.extend("Scores");
// const query = new Parse.Query(Scores);

// query.find().then(value => {
//     console.warn(value)
// });


AppRegistry.registerComponent("Snake", () => SnakeApp);
