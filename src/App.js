import React, { Component } from 'react';
import fire from './fire';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import { Line } from 'react-chartjs-2';

const sliderStyle = {width: 400, margin: 50};
const marks = {
  0: 'start',
  20: 'month',
  50: 'day',
  100: 'now',
  };
const hour = 3600000;
//const day = 86400000;
//const week = day * 7;
//const month = day * 31;

const tempGraph = 'temp';
const co2Graph = 'co2';
const humidGraph = 'humidity';


class Graph extends Component {
  constructor(props) {
    super(props);
    }
  render() {
    //debugger;
    return (
      <Line data={{
        labels: this.props.table.map( r => {return new Date(r.timestamp);} ),
        datasets: [{
          label: this.props.name,
          fill: false,
          lineTension: 0,
          data: this.props.table.map( r => {return r.value;} ),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255,99,132,1)',
        }]
      }}
      options={{
        scales: {
         xAxes: [{
           type: "time",
           time: {
             displayFormats: {
               //second: 'MMM D h:mm'
             }
             //parser: 'MM/DD/YYYY HH:mm',
             // round: 'day'
          },
          scaleLabel: {
            display: true,
               labelString: 'Date'
             },
             ticks: {
               source: 'auto',
             },
         }],
          yAxes: [{
           scaleLabel: {
             display: true,
             labelString: 'value'
           }
          }]
        }
      }} width={600} height={250}/>
    )
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state =
    {
      tempValues: [],
      co2Values: [],
      humidValues: []
    };
  }

  reloadData(tableName, values) {
    //if (prevStore) {
    //  fire.database().ref(prevStore).off();
    //}
    let tempRef = fire.database().ref(tableName)
      .orderByKey().limitToLast(5000);
    tempRef.on('value', records => {
      var newState = {};
     // debugger;
      if (records.val()) {
        newState[values] = Object.values(records.val());
        this.setState(newState);
      }
      //tempRef.off('value');
      //tempRef.on('child_added', new_record => {
      //  var updatedState = {};
      //  debugger;
      //  updatedState[values] = this.state[values].concat([new_record.val()]);
      // this.setState(updatedState);
      //})
    });
  }

  reloadAllData() {
    this.reloadData(tempGraph, 'tempValues');
    this.reloadData(co2Graph, 'co2Values');
    this.reloadData(humidGraph, 'humidValues');
  }

  componentWillMount() {
    this.reloadAllData();
  }

  componentDidUpdate(prevProps, prevState) {
  }

  addMessage(e){
    e.preventDefault(); // <- prevent form submit from reloading the page
    /* Send the message to Firebase */
    fire.database().ref('temp').push({
      value: this.inputEl.value,
      timestamp: new Date().getTime()
    });
    this.inputEl.value = ''; // <- clear the input
  }


  calcRange(value) {
    //var left;
    //var right;
    let now = new Date().getTime();
    if (value[0] === 50) {
      this.setState({
        start: now - hour})
      }
    }

  render() {
    return (
    <div>
      <form onSubmit={this.addMessage.bind(this)}>
        <input type="text" ref={ el => this.inputEl = el }/>
        <input type="submit"/>
        <ul>
          { /* Render the list of messages */
        //    this.state.messages.map(
        //(msg, i) => <li key={i}>Time: {msg.timestamp} Value: {msg.value}</li>
        //    )
          }
        </ul>
      </form>
      <Graph name="Temperature" table={this.state.tempValues} />
      <Graph name="CO2" table={this.state.co2Values} />
      <Graph name="Humidity" table={this.state.humidValues} />
      <div style={sliderStyle}>
        <p>Time range</p>
        <Slider.Range min={0} marks={marks} onChange={this.calcRange.bind(this)}
                              defaultValue={[10, 2000]} />
      </div>
    </div>
      );
  }
}

export default App;
