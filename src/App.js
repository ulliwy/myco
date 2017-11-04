import React, { Component } from 'react';
import fire from './fire';

import './App.css';
import './navbar.css';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import { Line } from 'react-chartjs-2';

import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";

const sliderStyle = {width: 400};
const marks = {
  0: '3 months',
  20: 'month',
  40: 'week',
  60: 'day',
  80: 'hour',
  100: 'now',
  };
const hour = 3600000;
const day = 86400000;
//const week = day * 7;
//const month = day * 31;

const tempGraph = 'temp';
const co2Graph = 'co2';
const humidGraph = 'humidity';
const camera = 'camera';

class Graph extends Component {
  //constructor(props) {
  //  super(props);
  //  }
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
               second: 'MMM D h:mm',
               hour: 'MMM D h:mm'
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
      }} width={400} height={250}/>
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
      humidValues: [],
      cameraValues: []
    };
  }

  reloadData(tableName, values, start, end) {
    if (start || end) {
      let tempRef = fire.database().ref(tableName).orderByChild('timestamp')
        .startAt(new Date().getTime() - start)
        .endAt(new Date().getTime() - end);
      debugger;
      tempRef.on('value', records => {
        var newState = {};
        if (records.val()) {
          newState[values] = Object.values(records.val());
          //this.setState(newState);
        } else {
          if (values === 'cameraValues') {
            newState[values] = [{
              original: "https://storage.googleapis.com/stanford-boxes.appspot.com/pics/no-image-available%20(1).jpg",
              thumbnail: "https://storage.googleapis.com/stanford-boxes.appspot.com/pics/no-image-available%20(1).jpg"}]
          } else {
            newState[values] = [];
          }
          //this.setState(newState);
        }
        this.setState(newState);
      });
    } else {
      let tempRef = fire.database().ref(tableName)
        .orderByKey().limitToLast(5000);
      tempRef.on('value', records => {
        var newState = {};
        if (records.val()) {
          newState[values] = Object.values(records.val());
          //this.setState(newState);
        } else {
          newState[values] = [];
          //this.setState(newState);
        }
        this.setState(newState);
      });
    }
    //tempRef.on('value', records => {
    //  var newState = {};
     // debugger;
    //  if (records.val()) {
    //    newState[values] = Object.values(records.val());
    //    this.setState(newState);
    //  }
    //});
  }

  reloadAllData(start, end) {
    //debugger;
    this.reloadData(tempGraph, 'tempValues', start, end);
    this.reloadData(co2Graph, 'co2Values', start, end);
    this.reloadData(humidGraph, 'humidValues', start, end);
    this.reloadData(camera, 'cameraValues', start, end);
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
    fire.database().ref('co2').push({
      value: this.inputEl.value,
      timestamp: new Date().getTime()
    });
    fire.database().ref('humidity').push({
      value: this.inputEl.value,
      timestamp: new Date().getTime()
    });
  this.inputEl.value = ''; // <- clear the input
  }


  calcRange(value) {
    var left;
    var right;
    //debugger;
    if (value[0] === 0) {
      left = day * 31 * 3;
    } else if (value[0] === 20){
      left = day * 31;
    } else if (value[0] === 40){
      left = day * 7;
    } else if (value[0] === 60) {
      left = day;
    } else if (value[0] === 80){
      left = hour;
    }
    if (value[1] === 0) {
      right = day * 31 * 3;
    } else if (value[1] === 20){
      right = day * 31;
    } else if (value[1] === 40){
      right = day * 7;
    } else if (value[1] === 60) {
      right = day;
    } else if (value[1] === 80){
      right = hour;
    } else if (value[1] === 100) {
      right = 0;
    }
    if (left || right) {
       this.reloadAllData(left, right);
    }
  }

  render() {
    return (
    <div>
      <div class="topnav" id="myTopnav">
        <a href="#logo">Mycotronics</a>
      </div>
      <div>
        <div className="slider" style={sliderStyle}>
          <p>Time range</p>
          <Slider.Range dots min={0} marks={marks} step={20}
                              onChange={this.calcRange.bind(this)}
                              defaultValue={[0, 100]} />
        </div>
        <div>
          <div className="container">
            <div className="plot">
              <Graph name="Temperature" table={this.state.tempValues} />
            </div>
            <div className="plot">
              <Graph name="CO2" table={this.state.co2Values} />
            </div>
          </div>
        <div className="container">
        <div className="plot">
          <Graph name="Humidity" table={this.state.humidValues} />
          </div>
            <div className="plot">
              <ImageGallery items={this.state.cameraValues}
                showThumbnails={true}
                thumbnailPosition='left'
                defaultImage = {"http://www.bsmc.net.au/wp-content/uploads/No-image-available.jpg"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  }
}

export default App;
