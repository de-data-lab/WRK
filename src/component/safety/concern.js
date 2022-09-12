import React from "react";
import * as d3 from "d3";
import concernData from "../../data/safety_WRK_survey_2021.csv";
import { ChartHeader, ChartFooter, ChartContainer } from "../housing/availableUnits";

export default class Concern extends React.Component {
    componentDidMount = () => {
        this.drawConcern();
    }

    componentDidUpdate = () => {
        d3.select("svg").remove();
        this.drawConcern();
    }

    drawConcern = () => {
        //set svg size
        let w = 1000;
        let h = 500;
        let padding = 20;
        let leftMargin = 400;

        let dataset = [], xScale, yScale, xAxis, yAxis;
        //loading data from csv file
        d3.csv(concernData).then(data => {  
            dataset = data;
            dataset.sort((a, b) => a.yes - b.yes);

            //construct a band scale with specified domain and range
            yScale = d3.scaleBand()
                        .domain(dataset.map(d => d.var_label))
                        .range([h - padding, padding])
                        .paddingInner(0.8);
                                
            //construct a continuous scale with specified domain and range
            xScale = d3.scaleLinear()
                        .domain([0, 0.8])
                        .range([leftMargin, w - padding])                                       

            //construct a left-oriented axis generator for the given scale
            yAxis = d3.axisLeft()
                        .scale(yScale);

            //construct a top-oriented axis generator for the given scale
            xAxis = d3.axisTop()
                        .scale(xScale)
                        .tickFormat(d3.format(".0%"))
                        .ticks(5);                            
            
            //create svg element
            let svg = d3.select(this.props.concernRef.current)
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h);  

            //create rect element and load dataset
            let rect = svg.selectAll("rect")
                            .data(dataset)
                            .enter()
                            .append("rect");

            rect.attr("x", leftMargin)
                .attr("y", d => yScale(d.var_label))
                .attr("width", 0)
                .attr("height", yScale.bandwidth())
                .attr("fill", d => "#a8ddb5")
                .transition()
                    .duration(700)
                    .delay((d, i) => i * 300)
                    .attr("width", d => xScale(d.yes / d.total_participants) - leftMargin);

            //Create axis-x and axis-y
            svg.append("g")
                .attr("class", "axis-x-concern")
                .attr("transform", `translate(0, ${padding})`)
                .attr("color", "#555")
                .call(xAxis)
                .selectAll("text")
                .attr("font-size", "15px")
                .attr("color", "#d9d9d9");
     
            svg.append("g")
                .attr("class", "axis-y-concern")
                .attr("transform", `translate(${leftMargin}, 0)`)
                .attr("color", "#555")
                .call(yAxis)
                .selectAll("text")
                .attr("font-size", "15px")
                .attr("color", "#d9d9d9");

            //define sortBars function to sort bars 
            let sortOrder = false;
            const sortBars = () => {
                sortOrder = !sortOrder; 

                dataset.sort((a, b) => sortOrder ? b.yes - a.yes : a.yes - b.yes);

                yScale.domain(dataset.map(d => d.var_label));

                d3.select(".axis-y-concern")
                    .transition("yAxis")
                    .delay((d, i) => i * 10)
                    .duration(500)
                    .call(yAxis);

                rect.transition("sortBars")
                    .delay((d, i) => i * 10)
                    .duration(500)
                    .attr("y", d => yScale(d.var_label));
            }

            //define event listeners for click, mouseover, mouseout
            rect.on("click", () => sortBars())
                .on("mouseover", (event, d) => {
                        d3.select(event.currentTarget)
                            .attr("fill", "#fd8d3c");

                        d3.select("#concern")
                            .style("left", event.pageX + "px")
                            .style("top", event.pageY + "px")
                            .select("#value")
                            .text(d3.format(".1%")(d.yes / d.total_participants));

                        d3.select("#concern")
                            .select("#year")
                            .text(d.var_label);
                            
                        d3.select("#concern").classed("hidden", false);
                    })
                    .on("mouseout", (event, d) => {
                        d3.select(event.currentTarget)
                            .transition("restoreBarColor")
                            .duration(250)
                            .attr("fill",  d => "#a8ddb5");

                        d3.select("#concern").classed("hidden", true);
                    });
        }).catch((error) => {
            console.log(error);
        });
    }

    render() {
        return (
            <div className="concern-units" style={{display: this.props.selectedStatsID === 2 ? "block" : "none"}} >
                <ChartHeader 
                    chartTitle="What are the safety concerns in the community?"
                    dotColor="#a8ddb5"
                />
                <ChartContainer 
                    containerRef={this.props.concernRef} 
                    tooltipID="concern"
                    tooltipValueTitle="percentage"
                    tooltipOption="change"
                    display="none"
                />
                <ChartFooter chartSource="2020 Resident Survey." />
            </div>
        );
    }
}