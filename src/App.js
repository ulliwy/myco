import React, { Component } from 'react';
import fire from './fire';

//import Plot from 'react-plotly.js'

import Plotly from 'plotly.js/lib/core';
import plotComponentFactory from 'react-plotly.js/factory';
const Plot = plotComponentFactory(Plotly);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { messages: [], graphType: "temp" };
  }

  reloadData(prevStore) {
    if (prevStore) {
      fire.database().ref(prevStore).off();
    }

    let ref = fire.database().ref(this.state.graphType)
      .orderByChild('timestamp').limitToLast(5000);

    ref.on('value', snapshot => {
      if (snapshot.val()) {
        this.setState({ messages: Object.values(snapshot.val()) });
      }

      ref.off('value');
      ref.on('child_added', new_record => {
        this.setState({
          messages: [new_record.val()].concat(this.state.messages)
        });
      });
    });
  }

  componentWillMount() {
    this.reloadData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.graphType !== this.state.graphType) {
      this.setState({messages: []});
      this.reloadData(prevState.graphType);
    }
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

  handleOptionChange(changeEvent) {
    this.setState({
      graphType: changeEvent.target.value})
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
      <form>
        <div className="radio">
          <label>
            <input type="radio" value="temp"
                  checked={this.state.graphType === 'temp'}
                  onChange={this.handleOptionChange.bind(this)} />
            Temperature
          </label>
        </div>
        <div className="radio">
         <label>
            <input type="radio" value="co2"
                  checked={this.state.graphType === 'co2'}
                  onChange={this.handleOptionChange.bind(this)} />
            CO2
          </label>
        </div>
        <div className="radio">
          <label>
            <input type="radio" value="humidity"
                  checked={this.state.graphType === 'humidity'}
                  onChange={this.handleOptionChange.bind(this)} />
            Humidity
          </label>
        </div>
      </form>
      <Plot data={[
        {
          type: 'scatter',
          mode: 'lines+points',
          x: this.state.messages.map( msg => {
            var date = new Date(msg.timestamp);
            return (date)}),
          y: this.state.messages.map( msg => +msg.value),
          marker: {color: 'red'}
        }
      ]}

      layout={{
        width: 800,
        height: 600,
        yaxis: {title: "Value"},
        xaxis: {tickformat: "%b %d, %H:%M", tickangle: 45},
        title: 'Temperature'
      }}
    />
    </div>
      );
  }
}

export default App;
