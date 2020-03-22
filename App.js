import React, { Component } from "react";
import { StyleSheet, StatusBar, Modal, View, AsyncStorage, TouchableOpacity, Text, FlatList, TextInput, InteractionManager } from "react-native";
import { GameEngine } from "react-native-game-engine";
import { Head } from "./head";
import { Food } from "./food";
import { Tail } from "./tail";
import { GameLoop } from "./systems";
import Constants from './Constants';
import Parse from "parse/react-native";
import Sound from 'react-native-sound';

import {
  AdMobBanner,
  AdMobInterstitial
} from 'react-native-admob'


export default class SnakeApp extends Component {

  boardSize = Constants.GRID_SIZE * Constants.CELL_SIZE;
  engine = null;
  state = {
    running: true,
    pontos: 0,
    timer: true,
    stoped: false,
    maxPoint: 0,
    scores: [],
    newMaxScrore: false,
    nome: '',
    stop: false
  }


  componentDidMount() {

    AdMobInterstitial.setAdUnitID('ca-app-pub-3408462666302033/8811232233');

    this.showAd = () => AdMobInterstitial.requestAd().then(() =>
      AdMobInterstitial.showAd()
    );

    InteractionManager.runAfterInteractions(async () => {
      try {
        const Scores = Parse.Object.extend("Scores");
        const query = new Parse.Query(Scores);
        let results = await query.descending('score').limit(20).find()

        results = results.map(value => {
          return {
            id: value.id,
            playerName: value.get('playerName'),
            score: value.get('score')
          }
        })
        this.setState({ scores: results })
        AsyncStorage.setItem('Scrores', JSON.stringify(results))
      } catch (error) {
        AsyncStorage.getItem('Scrores').then(value => this.setState({ scores: JSON.parse(value) }))
      }
      AsyncStorage.getItem('maxPoint').then(value => this.setState({ maxPoint: JSON.parse(value) }))
    })

    this.whoosh = new Sound('soundtrack.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        alert('error')
        alert(JSON.stringify(error))
        return;
      }
      // loaded successfully
      console.warn('duration in seconds: ' + this.whoosh.getDuration() + 'number of channels: ' + this.whoosh.getNumberOfChannels());
      this.whoosh.setVolume(0.4);
      this.whoosh.setNumberOfLoops(-1)
      // Play the sound with an onEnd callback
      this.whoosh.play((success) => {
        if (success) {
          console.warn('successfully finished playing');
        } else {
          console.warn('playback failed due to audio decoding errors');
        }
      });
    });

    setInterval(() => {
      this.setState({ timer: !this.state.timer })
    }, 20000)

  }

  bite = new Sound('bite.wav', Sound.MAIN_BUNDLE);
  /** função de criar nova fruta no jogo */

  randomBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  onEvent = (e) => {
    if (e.type === "game-over") {
      this.showAd();
      this.setState({
        running: false,
        stoped: true
      });
      this.whoosh.stop();
      if (!this.state.maxPoint || this.state.pontos > this.state.maxPoint) {
        AsyncStorage.setItem('maxPoint', JSON.stringify(this.state.pontos)).then(value => {
          this.setState({ maxPoint: this.state.pontos, pontos: 0 })
        })
        if (this.state.scores.length == 0 || this.state.scores[0].score < this.state.pontos) {
          this.setState({ newMaxScrore: true, pontos: 0 })
        }
      }

      // Alert.alert("Game Over");
    } else if (e.type === 'point') {
      this.setState({
        pontos: this.state.pontos + 1
      });

      // Play the sound with an onEnd callback
      this.bite.play((success) => {
        if (success) {
          // console.log('successfully finished playing');
        } else {
          // console.log('playback failed due to audio decoding errors');
        }
      });
      // let Sound = require('react-native-sound');


    } else if (e.type === 'started') {
      this.whoosh.play();
      if (!this.state.pontos)
        this.setState({
          pontos: 0
        });
    }
  }

  /** função de limpar o jogo e reiniciar o jogo */

  reset = () => {
    this.engine.swap({
      head: { position: [0, 0], xspeed: 1, yspeed: 0, nextMove: 10, updateFrequency: 10, size: 20, renderer: <Head /> },
      food: { position: [this.randomBetween(0, Constants.GRID_SIZE - 1), this.randomBetween(0, Constants.GRID_SIZE - 1)], size: 20, renderer: <Food /> },
      tail: { size: 20, elements: [], renderer: <Tail /> }
    });
    this.setState({
      running: true,
      stoped: false,
      pontos: 0
    });
  }

  /** função de adicionar um novo score no backend o jogo */

  addNewScore = () => {
    const Scores = Parse.Object.extend("Scores");
    const score = new Scores();

    score.set("score", this.state.pontos);
    score.set("playerName", this.state.nome);
    score.save()
      .then(async (score) => {
        this.setState({ nome: '', newMaxScrore: false });
        const Scores = Parse.Object.extend("Scores");
        const query = new Parse.Query(Scores);
        let results = await query.descending('score').limit(20).find()

        results = results.map(value => {
          return {
            id: value.id,
            playerName: value.get('playerName'),
            score: value.get('score')
          }
        })
        this.setState({ scores: results })
        AsyncStorage.setItem('Scrores', JSON.stringify(results))
        this.reset();
      }, (error) => {
        this.setState({ nome: '', newMaxScrore: false });
        this.reset();
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        //  alert('Failed to create new object, with error code: ' + error.message);
      });
  }

  /** função de start o jogo */

  start = () => {
    this.engine.start();
    this.setState({
      stop: false
    });
  }

  /** função de pausar o jogo */
  pause = () => {
    this.engine.stop();
    this.whoosh.stop();
    this.showAd();
    //  this.engine.start();
    this.setState({
      stop: true
    });
  }

  render() {
    let { pontos, running, timer, stoped, maxPoint, stop, newMaxScrore, scores, nome } = this.state;

    return (

      <View style={{ ...styles.container, backgroundColor: timer ? 'black' : 'white' }}>
        <StatusBar barStyle={timer ? "light-content" : "dark-content"} backgroundColor={timer ? 'black' : 'white'} />

        <TouchableOpacity onPress={this.pause} style={{ top: 50, width: '80%', backgroundColor: 'red', borderRadius: 20, height: 40, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'white' }}>PAUSE</Text>
        </TouchableOpacity>


        <Modal
          animationType="slide"
          transparent={true}
          visible={stoped}
          onRequestClose={this.reset}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0, 0.4)' }}>
            <View style={{ backgroundColor: 'black', alignItems: 'center', justifyContent: 'space-around', width: '80%', height: '50%', }}>
              <Text style={{ color: 'white', fontSize: 50, textAlign: 'center' }}>Game Over</Text>

              <Text style={{ color: 'white', fontSize: 25, textAlign: 'center' }}>Pontuação mais alta: {maxPoint}</Text>
              <Text style={{ color: 'white', fontSize: 50, textAlign: 'center' }}>Pontos: {pontos}</Text>

              {newMaxScrore ? <>
                <TextInput placeholderTextColor={'white'} style={{ color: 'white', width: '80%', backgroundColor: 'black', borderWidth: 0.5, borderColor: 'lightgray' }} placeholder='Digite seu nome ' onChangeText={nome => this.setState({ nome })} onSubmitEditing={this.addNewScore}></TextInput>
                <TouchableOpacity onPress={this.addNewScore} style={{ top: 0, width: '80%', backgroundColor: 'red', borderRadius: 20, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'white' }}>CONFIRMAR</Text>
                </TouchableOpacity>
              </>
                :
                <TouchableOpacity onPress={this.reset} style={{ top: 0, width: '80%', backgroundColor: 'red', borderRadius: 20, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'white' }}>REINICIAR</Text>
                </TouchableOpacity>
              }

            </View>
          </View>
        </Modal>


        <Modal
          animationType="slide"
          transparent={true}
          visible={stop}
          onRequestClose={this.start}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0, 0.4)' }}>
            <View style={{ backgroundColor: 'black', alignItems: 'center', justifyContent: 'space-around', width: '80%', height: '50%', }}>
              <View style={{ alignItems: 'center', justifyContent: 'space-around', width: '100%', height: '100%' }}>
                <Text style={{ color: 'white', fontSize: 50, textAlign: 'center' }}>PAUSE</Text>

                <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'white' }}>Placar</Text>

                <FlatList
                  extraData={scores}
                  data={scores}
                  keyExtractor={value => value.id}
                  style={{ height: '30%', width: '100%' }}
                  ListEmptyComponent={_ => <View style={{ alignItems: 'center', justifyContent: 'center', padding: 8, borderBottomWidth: 0.4, borderBottomColor: 'lightgray' }} >
                    <Text style={{ color: 'white', textAlign: 'center' }}>Não há Pontuação</Text>
                  </View>}
                  renderItem={({ item: { playerName, score, id } }) => (
                    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 8, borderBottomWidth: 0.4, borderBottomColor: 'lightgray' }} key={id}>
                      <Text style={{ color: 'white', textAlign: 'center' }}>Jogador: {playerName} - {score}</Text>
                    </View>
                  )
                  } />

                <TouchableOpacity onPress={this.start} style={{ width: '80%', backgroundColor: 'red', borderRadius: 20, height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'white' }}>CONTINUAR</Text>
                </TouchableOpacity>

              </View>
            </View>
          </View>
        </Modal>




        <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Text style={{ color: timer ? 'white' : 'black', fontSize: 18, textAlign: 'center', top: 0 }}>Pontuação mais alta: {maxPoint}</Text>
          <Text style={{ color: timer ? 'white' : 'black', fontSize: 22, textAlign: 'center' }}>Pontos: {pontos}</Text>
          <GameEngine
            ref={(ref) => { this.engine = ref; }}
            style={[{ width: this.boardSize, height: this.boardSize, backgroundColor: timer ? 'white' : 'black', flex: null }]}
            systems={[GameLoop]}
            entities={{
              head: { position: [0, 0], xspeed: 1, yspeed: 0, nextMove: 10, updateFrequency: 10, size: 20, renderer: <Head /> },
              food: { pontos: 0, position: [this.randomBetween(0, Constants.GRID_SIZE - 1), this.randomBetween(0, Constants.GRID_SIZE - 1)], size: 20, renderer: <Food /> },
              tail: { size: 20, elements: [], renderer: <Tail /> }
            }}
            running={running}
            onEvent={this.onEvent}>
          </GameEngine>
        </View>




        {/* <View style={styles.controls}>
                    <View style={styles.controlRow}>
                        <TouchableOpacity onPress={() => { this.engine.dispatch({ type: "move-up" }) }}>
                            <View style={styles.control} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.controlRow}>
                        <TouchableOpacity onPress={() => { this.engine.dispatch({ type: "move-left" }) }}>
                            <View style={styles.control} />
                        </TouchableOpacity>
                        <View style={[styles.control, { backgroundColor: null }]} />
                        <TouchableOpacity onPress={() => { this.engine.dispatch({ type: "move-right" }) }}>
                            <View style={styles.control} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.controlRow}>
                        <TouchableOpacity onPress={() => { this.engine.dispatch({ type: "move-down" }) }}>
                            <View style={styles.control} />
                        </TouchableOpacity>
                    </View>
                </View> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    // justifyContent: '',
  },
  controls: {
    width: 300,
    height: 300,
    flexDirection: 'column',
  },
  controlRow: {
    height: 100,
    width: 300,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  control: {
    width: 100,
    height: 100,
    backgroundColor: 'blue'
  }
});
