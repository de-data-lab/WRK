import React from "react";
import * as d3 from "d3";
import employmentData from "../../data/workforce_unemployment_sum.csv";
import { ChartHeader, ChartFooter, ChartContainer } from "../housing/availableUnits";

export default class Employment extends React.Component {
    componentDidMount = () => {
        this.drawEmployment();
    }

    componentDidUpdate = () => {
        d3.select("svg").remove();
        this.drawEmployment();
    }

    drawEmployment = () => {
        //set svg size
        let w = 1000;
        let h = 500;
        let padding = 80;

        let dataset = [], xScale, subScale, yScale, xAxis, yAxis;
        //loading data from csv file
        d3.csv(employmentData).then(data => {

            let subgroups = data.columns.slice(1);

            let color = d3.scaleOrdinal()
                            .domain(subgroups)
                            .range(["#99d8c9", "#fee391", "#43a2ca", "#dd1c77", "#d95f0e", "#238b45"])
            
            dataset = data;

            //construct a band scale with specified domain and range
            xScale = d3.scaleBand()
                        .domain(dataset.map(d => d.year))
                        .range([padding, w])
                        .paddingInner(0.4);

            subScale = d3.scaleBand()
                            .domain(subgroups)
                            .range([0, xScale.bandwidth()])
                            .padding([0.1])
                
            //construct a continuous scale with specified domain and range
            yScale = d3.scaleLinear()
                        .domain([0.6, 1])
                        .range([h - padding, padding]);

            //construct a bootom-oriented axis generator for the given scale
            xAxis = d3.axisBottom()
                        .scale(xScale);

            //construct a left-oriented axis generator for the given scale
            yAxis = d3.axisLeft()
                        .scale(yScale)
                        .ticks(5)
                        .tickFormat(d3.format(".0%"));

            //create svg element
            let svg = d3.select(this.props.employmentRef.current)
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h); 

            //create rect element and load dataset
            let rect = svg.append("g")
                            .selectAll("g")
                            .data(dataset)
                            .enter()
                            .append("g")
                            .attr("transform", d => `translate(${xScale(d.year)}, 0)`)
                            .selectAll("rect")
                            .data(d => subgroups.map(key => { return {key: key, value: d[key], year: d.year}; }))
                            .enter()
                            .append("rect");

            rect.attr("x", d => subScale(d.key))
                .attr("y", h - padding)
                .attr("width", subScale.bandwidth())
                .attr("height", 0)
                .attr("fill", d => color(d.key))
                .transition()
                    .duration(700)
                    .delay((d, i) => i * 300)
                    .attr("y", d => yScale(1 - d.value))
                    .attr("height", d => h - padding - yScale(1 - d.value));

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
                .attr("transform", `translate(${padding}, 0)`)
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
                    .attr("y", padding - 80)
                    .attr("width", 10)
                    .attr("height", 10)
                    .attr("fill", d => color(d));

            legend.append("text")
                    .attr("x", w - 24)
                    .attr("y", padding - 80)
                    .attr("dy", "0.7em")
                    .attr("fill", d => color(d))
                    .text(d => d);

            legend.transition()
                    .duration(500)
                    .delay((d, i) => 1300 + 100 * i)
                    .style("opacity", "1");

            //define event listeners for click, mouseover, mouseout
            rect.on("mouseover", (event, d) => {
                    d3.select(event.currentTarget)
                        .attr("fill", "#fd8d3c");

                    d3.select("#employment")
                        .style("left", event.pageX + "px")
                        .style("top", event.pageY + "px")
                        .style("background-color", "#391D6A")
                        .selectAll("p")
                        .style("color", color(d.key))
                        .select("#value")
                        .text(d3.format(".2%")(1 - d.value));

                    d3.select("#employment")
                        .select("#year")
                        .text(d.key + " " + d.year);
                        
                    d3.select("#employment").classed("hidden", false);

                })
                .on("mouseout", (event, d) => {
                    d3.select(event.currentTarget)
                        .transition("restoreBarColor")
                        .duration(250)
                        .attr("fill",  color(d.key));

                    d3.select("#employment").classed("hidden", true);
                });
    
        }).catch((error) => {
            console.log(error);
        });
    }

    render() {
        return (
            <div className="employment-gap" style={{display: this.props.selectedStatsID === 0 ? "block" : "none"}}>
                <ChartHeader 
                    chartTitle="Employment rate from 2011 - 2020"
                    dotColor="#238b45"
                />
                <ChartContainer 
                    containerRef={this.props.employmentRef} 
                    tooltipID="employment"
                    tooltipValueTitle="percentage"
                    tooltipOption="change"
                    display="none"
                />
                <ChartFooter chartSource="United States Census Bureau." />
            </div>
        );
    }
}