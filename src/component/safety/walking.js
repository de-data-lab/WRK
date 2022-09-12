import React from "react";
import * as d3 from "d3";
import walkingData from "../../data/safety_walking.csv";
import { ChartHeader, ChartFooter, ChartContainer } from "../housing/availableUnits";

export default class Walking extends React.Component {
    componentDidMount = () => {
        this.drawWalking();
    }

    componentDidUpdate = () => {
        d3.select("svg").remove();
        this.drawWalking();
    }

    drawWalking = () => {
        //set svg size
        let w = 1000;
        let h = 500;
        let padding = 120;

        let dataset = [], xScale, yScale, xAxis, yAxis;
        //loading data from csv file
        d3.csv(walkingData).then(data => {

            let subgroup = data.columns.slice(1);

            let color = d3.scaleOrdinal()
                            .domain(subgroup)
                            .range(["#dd1c77", "#fee391", "#99d8c9", "#43a2ca"]);

            data.forEach(d => {           
                let x0 = -1 * (+d["very unsafe"] + +d["somewhat unsafe"]);

                d.boxes = subgroup.map(name => { 
                    return {
                        name: name, 
                        x0: x0, 
                        x1: x0 += +d[name],
                        value: +d[name]
                    }; 
                });
            });
            
            dataset = data;

            //construct a band scale with specified domain and range
            yScale = d3.scaleBand()
                        .domain(dataset.map(d => d.time))
                        .range([h - padding, padding]);
                
            //construct a continuous scale with specified domain and range
            xScale = d3.scaleLinear()
                        .domain([-100, 100])
                        .range([padding, w - padding]);
                        
            //construct a bootom-oriented axis generator for the given scale
            xAxis = d3.axisBottom()
                        .scale(xScale)
                        .tickSizeInner(- h + 2 * padding)
                        .ticks(5)
                        .tickFormat(d => d < 0 ? -d + "%" : d + "%");
                            
            //construct a left-oriented axis generator for the given scale
            yAxis = d3.axisLeft()
                        .scale(yScale);
                        

            //create svg element
            let svg = d3.select(this.props.walkingRef.current)
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h); 

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

            //create rect element and load dataset
            let rows = svg.selectAll(".time")
                            .data(dataset)
                            .enter()
                            .append("g")
                            .attr("transform", d => `translate(0, ${yScale(d.time)})`);            

            let rect = rows.selectAll("rect")
                            .data(d => d.boxes)
                            .enter()
                            .append("g")
                            .attr("transform", d => `translate(0, ${padding / 2.5})`);

            rect.append("rect")
                .attr("height", yScale.bandwidth() / 4)
                .attr("x", d => xScale(d.x0))
                .attr("width", 0)
                .style("fill", d => color(d.name))
                .transition()
                    .duration(700)
                    .delay((d, i) => i * 300)
                    .attr("width", d => xScale(d.x1) - xScale(d.x0));

            let startp = svg.append("g")
                            .attr("class", "legendbox")
                            .attr("id", "mylegendbox")
                            .attr("transform", `translate(${padding}, 0)`);

            let legend = startp.selectAll(".legend")
                                .data(subgroup)
                                .enter()
                                .append("g")
                                .attr("class", "legend")
                                .attr("transform", (d, i) => `translate(${w / subgroup.length * i}, 30)`)
                                .style("opacity", "0");

            legend.append("rect")
                    .attr("x", 0)
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", color);


            legend.append("text")
                    .attr("x", 35)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .style("text-anchor", "begin")
                    .style("font-size" ,"15px")
                    .attr("fill", color)
                    .text(d => d);

            legend.transition()
                    .duration(500)
                    .delay((d, i) => 1300 + 100 * i)
                    .style("opacity", "1");

            //define event listeners for click, mouseover, mouseout
            rect.on("mouseover", (event, d) => {
                d3.select(event.currentTarget)
                    .attr("fill", "#fd8d3c");

                d3.select("#walking")
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY + "px")
                    .style("background-color", "#391D6A")
                    .selectAll("p")
                    .style("color", color(d.name))
                    .select("#value")
                    .text(d.value + "%");

                d3.select("#walking")
                    .select("#year")
                    .text(d.name);
                    
                d3.select("#walking").classed("hidden", false);

            })
            .on("mouseout", (event, d) => {
                d3.select(event.currentTarget)
                    .transition("restoreBarColor")
                    .duration(250)
                    .attr("fill",  color(d.key));

                d3.select("#walking").classed("hidden", true);
            });

    
        }).catch((error) => {
            console.log(error);
        });
    }

    render() {
        return (
            <div className="walking-gap" style={{display: this.props.selectedStatsID === 0 ? "block" : "none"}}>
                <ChartHeader 
                    chartTitle="How safe would you say you feel walking in the community?"
                    dotColor="#fee391"
                />
                <ChartContainer 
                    containerRef={this.props.walkingRef} 
                    tooltipID="walking"
                    tooltipValueTitle="percentage"
                    tooltipOption="change"
                    display="none"
                />
                <ChartFooter chartSource="2020 Resident Survey." />
            </div>
        );
    }
}