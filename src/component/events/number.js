import React from "react";
import * as d3 from "d3";
import eventData from "../../data/events_warehouse_calendar.csv";
import { ChartHeader, ChartFooter, ChartContainer } from "../housing/availableUnits";

export class RadioButton extends React.Component {
    render() {  
        return (
            <div className="form-group">
                <input type='radio' value={this.props.value} onChange={this.props.onChange}  checked={this.props.checked} id={this.props.id} />
                <label htmlFor={this.props.id}>{this.props.value}</label>
            </div>
        );
    }
}

class NumberRadioButton extends React.Component {
    render() {
        const yearRange = ["2020", "2021", "2022"];
        return (
            <div className="radio-buttons">
                {yearRange.map(element => {
                    return (
                        <React.Fragment key={element}>
                            <RadioButton
                                value={element}
                                onChange={this.props.onChange}
                                id={element + "number"}
                                checked={this.props.year === element}
                            />
                        </React.Fragment>
                    );
                })} 
            </div>
        );
        
    }
}

export default class Number extends React.Component {
    state = {
        numberYear: "2022"
    }

    handleNumberYearChange = (value) => {
        let numberYear = this.state.numberYear;
        numberYear = value;
        this.setState({
            numberYear: numberYear
        })
    }

    componentDidMount = () => {
        this.drawNumber();
    }

    componentDidUpdate = () => {
        d3.selectAll("svg").remove();
        this.drawNumber();
    }

    drawNumber = () => {
        //set svg size
        let w = 1000;
        let h = 500;
        let padding = 40;
        let leftMargin = 100;

        let dataset = [], xScale, yScale, xAxis, yAxis;
        //loading data from csv file
        d3.csv(eventData).then(data => {
            let monthGroup = [];

            for (let i = 0; i < 12; i++) {
                monthGroup.push({
                    "Other": 0, 
                    "Resume": 0, 
                    "Virtual Classes": 0, 
                    "The Warehouse": 0, 
                    "Digital Media Arts Room": 0
                })
            }

            for (let obj of data) {
                if (obj.year !== this.state.numberYear) continue;

                let month = obj.month;
                let location = obj.location;
                
                monthGroup[month - 1][location]++;                
            } 

            let monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

            for (let i = 0; i < 12; i++) {
                dataset.push({month: monthNames[i], ...monthGroup[i]});
            }

            let subgroups = ["Other", "Resume", "Virtual Classes", "The Warehouse", "Digital Media Arts Room"];

            let color = d3.scaleOrdinal()
                            .domain(subgroups)
                            .range(["#dd1c77", "#fee391", "#99d8c9", "#43a2ca", "#238b45"]);

            //construct a band scale with specified domain and range
            xScale = d3.scaleBand()
                        .domain(dataset.map(d => d.month))
                        .range([leftMargin, w - padding])
                        .paddingInner(0.4);

            //construct a continuous scale with specified domain and range
            yScale = d3.scaleLinear()
                        .domain([0, 200])
                        .range([h - padding, padding]);

            //construct a bootom-oriented axis generator for the given scale
            xAxis = d3.axisBottom()
                        .scale(xScale);

            //construct a left-oriented axis generator for the given scale
            yAxis = d3.axisLeft()
                        .scale(yScale)
                        .tickFormat(d => d + " events")
                        .ticks(5); 

            //stack data
            const stack = d3.stack()
                                .keys(subgroups)
                                .order(d3.stackOrderDescending)
                                .offset(d3.stackOffsetNone);
            
            let stackData = stack(dataset);
            
            //create svg element
            let svg = d3.select(this.props.numberRef.current)
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h);  

            // Add a group for each row of data
            let groups = svg.selectAll("g")
                            .data(stackData)
                            .enter()
                            .append("g")
                            .style("fill", d => color(d.key));

            //create rect element and load dataset
            let rect = groups.selectAll("rect")
                            .data(d => d)
                            .enter()
                            .append("rect");

            rect.attr("x", d => xScale(d.data.month))
                .attr("y", h - padding)
                .attr("width", xScale.bandwidth())
                .attr("height", 0)
                .transition()
                    .duration(700)
                    .delay((d, i) => i * 300)
                    .attr("y", d => yScale(d[1]))
                    .attr("height", d => yScale(d[0]) - yScale(d[1]));

            //Create axis-x and axis-y
            svg.append("g")
                .attr("class", "axis-x")
                .attr("transform", `translate(0, ${h - padding})`)
                .attr("color", "#555")
                .call(xAxis)
                .selectAll("text")
                .attr("font-size", "15px")
                .attr("color", "#d9d9d9");
                       
            svg.append("g")
                .attr("class", "axis-y")
                .attr("transform", `translate(${leftMargin}, 0)`)
                .attr("color", "#555")
                .call(yAxis)
                .selectAll("text")
                .attr("font-size", "15px")
                .attr("color", "#d9d9d9");

            //create legends
            let legend = svg.append("g")
                            .attr("font-size", "15px")
                            .attr("text-anchor", "end")
                            .selectAll("g")
                            .data(subgroups)
                            .enter()
                            .append("g")
                            .attr("transform", (d, i) => `translate(0, ${i * 13})`)
                            .style("opacity", "0");

            legend.append("rect")
                    .attr("x", w - 19)
                    .attr("y", padding - 40)
                    .attr("width", 10)
                    .attr("height", 10)
                    .attr("fill", d => color(d));

            legend.append("text")
                    .attr("x", w - 24)
                    .attr("y", padding - 40)
                    .attr("dy", "0.7em")
                    .attr("fill", d => color(d))
                    .text(d => d);

            legend.transition()
                    .duration(500)
                    .delay((d, i) => 3300 + 300 * i)
                    .style("opacity", "1");

            //define event listeners for click, mouseover, mouseout
            rect.on("mouseover", (event, d) => {
                    d3.select("#number")
                        .style("left", event.pageX + "px")
                        .style("top", event.pageY + "px")
                        .select("#value")
                        .text(d[1] - d[0]);

                    d3.select("#number")
                        .select("#year")
                        .text( () => {
                            for (let key in d.data) {
                                if (d.data[key] === d[1] - d[0]) {
                                    return (
                                        "location: " + key
                                    );
                                }
                            }
                        });

                    d3.select("#number")
                        .select("#change")
                        .text( () => {
                            let sum = 0;
                            for (let key in d.data) {
                                if (isNaN(d.data[key])) continue;
                                sum += +d.data[key];
                            }
                            return sum;
                        });
                        
                    d3.select("#number").classed("hidden", false);

                })
                .on("mouseout", (event, d) => {
                    d3.select("#number").classed("hidden", true);
                });

            }).catch((error) => {
                console.log(error);
            });
    }

    render() {
        return (
            <div className="number-monthly" style={{display: this.props.selectedStatsID === 0 ? "block" : "none"}} >
                <ChartHeader 
                    chartTitle="Number of events over time"
                    dotColor="#43a2ca"
                />
                <NumberRadioButton
                    onChange={e => this.handleNumberYearChange(e.target.value)} 
                    year={this.state.numberYear}
                />
                <ChartContainer 
                    containerRef={this.props.numberRef} 
                    tooltipID="number"
                    tooltipValueTitle="number of events"
                    tooltipOption="out of"
                />
                <ChartFooter chartSource="The Warehouse Calendar, The Warehouse." />
            </div>
        );
    }
}