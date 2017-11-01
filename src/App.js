import React, { Component } from 'react';
import fire from './fire';

//import Plot from 'react-plotly.js'

import Plotly from 'plotly.js/lib/core';
import plotComponentFactory from 'react-plotly.js/factory';
const Plot = plotComponentFactory(Plotly);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { messages: [] }; // <- set up react state
  }

  componentWillMount(){
    let tempRef = fire.database().ref('temp').orderByKey().limitToLast(100);
    tempRef.once('value')
	  .then(function(snapshot) {

	  })

    tempRef.on('child_added', snapshot => {
      /* Update React state when message is added at Firebase Database */
      let message = {
        value: snapshot.val().value,
        timestamp: snapshot.val().timestamp
      };

      this.setState({ messages: [message].concat(this.state.messages) });
    })
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

  render() {
    return (
    <div>
      <form onSubmit={this.addMessage.bind(this)}>
        <input type="text" ref={ el => this.inputEl = el }/>
        <input type="submit"/>
        <ul>
          { /* Render the list of messages */
        //    this.state.messages.map(
        //      (msg, i) => <li key={i}>Time: {msg.timestamp} Value: {msg.value}</li>
        //    )
          }
        </ul>
      </form>
      <Plot data={[
        {
          type: 'scatter',
          mode: 'lines+points',
          x: this.state.messages.map( msg => msg.timestamp),
          y: this.state.messages.map( msg => +msg.value),
          marker: {color: 'red'}
        }
      ]}

      layout={{
        width: 800,
        height: 600,
        title: 'A Fancy Plot'
      }}
    />
    </div>
      );
  }
}

export default App;
