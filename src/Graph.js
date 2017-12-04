import React, {Component} from 'react';
import {Line} from 'react-chartjs-2';

class Graph extends Component {
    onload() {
        console.log(document.getElementById('test'));
    }

    render() {
        return (<
            Line
                onElementsClick = {(elems) => {
                    debugger;
                    this.onload();
                }}
                data = {
                    {
                        labels: this.props.table.map(r => {
                            return new Date(r.timestamp);
                        }),
                        datasets: [{
                            label: this.props.name,
                            fill: false,
                            lineTension: 0,
                            data: this.props.table.map(r => {
                                return r.value;
                            }),
                            backgroundColor: 'rgba(202, 215, 220, 2)',
                            borderColor: 'rgba(81, 123, 139, 1)',
                        }]
                    }
                }
            options = {
                {
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
                }
            }
            width = {400}
            height = {250}
        />)
    }
}

export {Graph};
