import React, { Component } from 'react';
import fire from './fire';

import './App.css';
import './navbar.css';

import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import { Line } from 'react-chartjs-2';

import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css";

import fileDownload from 'js-file-download';

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
const tempGraph = 'data/rpi1/Temp';
const co2Graph = 'data/rpi1/CO2';
const humidGraph = 'data/rpi1/Humi';
const camera = 'data/rpi1/Camera';
class Graph extends Component {
  render() {
    return (
      <Line data={{
        labels: this.props.table.map( r => {return new Date(r.timestamp);} ),
        datasets: [{
          label: this.props.name,
          fill: false,
          lineTension: 0,
          data: this.props.table.map( r => {return r.value;} ),
          backgroundColor: 'rgba(202, 215, 220, 2)',
          borderColor: 'rgba(81, 123, 139, 1)',
        }]
      }}
      options={{
        title: {
          display: true,
          text: this.props.name,
          fontSize: 14,
        },
        legend: {
          display: false,
        },
        scales: {
         xAxes: [{
           type: "time",
           time: {
             displayFormats: {
               second: 'MMM D,HH:mm',
               hour: 'MMM D, HH:mm',
               day: 'MM D, HH:mm',
               month: "MM D"
              },
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
             labelString: 'Value'
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
      tempRef.on('value', records => {
        var newState = {};
        if (records.val()) {
          newState[values] = Object.values(records.val());
        } else {
          if (values === 'cameraValues') {
            newState[values] = [{
              original: "https://storage.googleapis.com/stanford-boxes.appspot.com/pics/no-image-available%20(1).jpg",
              thumbnail: "https://storage.googleapis.com/stanford-boxes.appspot.com/pics/no-image-available%20(1).jpg"}]
          } else {
            newState[values] = [];
          }
        }
        this.setState(newState);
      });
    } else {
      let tempRef = fire.database().ref(tableName)
        .orderByChild('timestamp')
        .startAt(new Date().getTime() - day)
        .endAt(new Date().getTime());
      tempRef.on('value', records => {
        var newState = {};
        if (records.val()) {
        newState[values] = Object.values(records.val());
        } else {
          newState[values] = [];
        }
        this.setState(newState);
      });
    }
  }

  reloadAllData(start, end) {
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

  handleClick() {
   var data = [
     {temp: this.state.tempValues},
     {co2: this.state.co2Values},
     {humidity: this.state.humidValues}
   ];
   fileDownload(JSON.stringify(data), 'data.json');
  }

  calcRange(value) {
    var left;
    var right;
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
      <div className="topnav" id="myTopnav">
	<div className="logo">
	  <a href="">
            <img src="http://storage.googleapis.com/stanford-boxes.appspot.com/pics/logo.png" alt="Mycotronics" />
          </a>
            <button className="btn"
              onClick={this.handleClick.bind(this)}>
              <img src="https://cdn0.iconfinder.com/data/icons/simple-seo-and-internet-icons/512/download_cloud_information-512.png"
                alt="Get data"/>
            </button>
        </div>
      </div>
      <div>
        <div>
        <div className="slider">
          <Slider.Range dots min={0} marks={marks} step={20}
                              onChange={this.calcRange.bind(this)}
                              defaultValue={[60, 100]} />
        </div>
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
              <ImageGallery items={this.state.cameraValues.map(el => {
                return {
                  original: el.original,
                  thumbnail: el.original
                }
              })}
                showThumbnails={true}
                thumbnailPosition='right'
                disableSwipe={true}
                slideDuration={1}
                slideInterval={500}
                infinite={false}
                defaultImage={"http://www.bsmc.net.au/wp-content/uploads/No-image-available.jpg"}
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
