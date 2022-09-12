import React from "react";
import * as d3 from "d3";
import eventData from "../../data/events_warehouse_calendar.csv";
import { ChartHeader, ChartFooter, ChartContainer } from "../housing/availableUnits";

export default class Hours extends React.Component {
    componentDidMount = () => {
        this.drawHours();
    }

    componentDidUpdate = () => {
        d3.select("svg").remove();
        this.drawHours();
    }

    drawHours = () => {
        //set svg size
        let w = 1000;
        let h = 500;
        let padding = 120;

        let dataset2022 = [], dataset2021 = [], dataset2020 = [],xScale, yScale, xAxis, yAxis;
        //loading data from csv file
        d3.csv(eventData).then(data => {
            let group2022 = {}, group2021 = {}, group2020 = {};

            let monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
                        
            for (let obj of data) {
                let year = obj.year;
                let month = obj.month;
                let hour = +obj.duration_hour;
                if (year === "2022") {
                    group2022[month] = group2022[month] ? group2022[month] + hour : hour;
                } else if (year === "2021") {
                    group2021[month] = group2021[month] ? group2021[month] + hour : hour;
                } else {
                    group2020[month] = group2020[month] ? group2020[month] + hour : hour;
                }                
            }


            for (let key in group2022) {
                dataset2022.push([monthNames[+key - 1], group2022[key], +key]);
            }

            for (let key in group2021) {
                dataset2021.push([monthNames[+key - 1], group2021[key], +key]);
            }

            for (let key in group2020) {
                dataset2020.push([monthNames[+key - 1], group2020[key], +key]);
            }

            //construct a band scale with specified domain and range
            xScale = d3.scaleBand()
                        .domain(monthNames)
                        .range([padding, w - padding])
                        .paddingInner(1);

            //construct a continuous scale with specified domain and range
            yScale = d3.scaleLinear()
                        .domain([0, 400])
                        .range([h - padding, padding]);

            //construct a bootom-oriented axis generator for the given scale
            xAxis = d3.axisBottom()
                        .scale(xScale);

            //construct a left-oriented axis generator for the given scale
            yAxis = d3.axisLeft()
                        .scale(yScale)
                        .tickFormat(d => d + " h.")
                        .ticks(5); 

            let line = d3.line()  
                            .x(d => xScale(d[0])) 
                            .y(d => yScale(d[1]));         

            //create svg element
            let svg = d3.select(this.props.hoursRef.current)
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h);  

            //create lines
            let path2022 = svg.append("path")
                                .datum(dataset2022) 
                                .attr("class", "line")
                                .attr("d", line); 

            let path2021 = svg.append("path")
                                .datum(dataset2021) 
                                .attr("class", "line2021")
                                .attr("d", line);

            let path2020 = svg.append("path")
                                .datum(dataset2020) 
                                .attr("class", "line2020")
                                .attr("d", line);

            //create dots
            let circle2022 = svg.append("g")
                                .selectAll("circle")
                                .data(dataset2022)
                                .enter()
                                .append("circle")
                                    .attr("cx", d => xScale(d[0]))
                                    .attr("cy", d => yScale(d[1]))
                                    .attr("r", 5)
                                    .attr("fill", "#a8ddb5")

            let circle2021 = svg.append("g")
                                .selectAll("circle")
                                .data(dataset2021)
                                .enter()
                                .append("circle")
                                    .attr("cx", d => xScale(d[0]))
                                    .attr("cy", d => yScale(d[1]))
                                    .attr("r", 5)
                                    .attr("fill", "#e7298a")

            let circle2020 = svg.append("g")
                                .selectAll("circle")
                                .data(dataset2020)
                                .enter()
                                .append("circle")
                                    .attr("cx", d => xScale(d[0]))
                                    .attr("cy", d => yScale(d[1]))
                                    .attr("r", 5)
                                    .attr("fill", "#fee391")

            let totalLength2022 = path2022.node().getTotalLength();

            path2022.attr("stroke-dasharray", totalLength2022 + " " + totalLength2022)
                    .attr("stroke-dashoffset", totalLength2022)
                    .transition()
                        .duration(4000)
                        .attr("stroke-dashoffset", 0);

            let totalLength2021 = path2021.node().getTotalLength();

            path2021.attr("stroke-dasharray", totalLength2021 + " " + totalLength2021)
                    .attr("stroke-dashoffset", totalLength2021)
                    .transition()
                        .duration(4000)
                        .attr("stroke-dashoffset", 0);

            let totalLength2020 = path2020.node().getTotalLength();

            path2020.attr("stroke-dasharray", totalLength2020 + " " + totalLength2020)
                    .attr("stroke-dashoffset", totalLength2020)
                    .transition()
                        .duration(4000)
                        .attr("stroke-dashoffset", 0);                 

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

            //add label to each line
            svg.append("text")
                .attr("transform", `translate(${w - 100}, ${yScale(dataset2022[dataset2022.length - 1][1])})`)
                .attr("dy", ".35em")
                .attr("text-anchor", "start")
                .style("fill", "#a8ddb5")
                .transition()
                    .delay(4000)
                    .duration(400)
                .text("2022");

            svg.append("text")
                .attr("transform", `translate(${w - 100}, ${yScale(dataset2021[dataset2021.length - 1][1])})`)
                .attr("dy", ".35em")
                .attr("text-anchor", "start")
                .style("fill", "#e7298a")
                .transition()
                    .delay(4000)
                    .duration(400)
                .text("2021");
            
            svg.append("text")
                .attr("transform", `translate(${w - 100}, ${yScale(dataset2020[dataset2020.length - 1][1])})`)
                .attr("dy", ".35em")
                .attr("text-anchor", "start")
                .style("fill", "#fee391")
                .transition()
                    .delay(4000)
                    .duration(400)
                .text("2020");

            //define event listeners for click, mouseover, mouseout
            circle2022.on("mouseover", (event, d) => {
                d3.select(event.currentTarget)
                    .attr("fill", "#fd8d3c");

                d3.select("#hours")
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY + "px")
                    .style("background-color", "#391D6A")
                    .selectAll("p")
                    .style("color", "#d95f02")
                    .select("#value")
                    .text(d[1]);

                d3.select("#hours")
                    .select("#year")
                    .text("2022 " + d[0]); 

                d3.select("#hours").classed("hidden", false);

            })
            .on("mouseout", (event, d) => {
                d3.select(event.currentTarget)
                    .transition("restoreBarColor")
                    .duration(250)
                    .attr("fill",  d => "#a8ddb5");

                d3.select("#hours").classed("hidden", true);
            });

            circle2021.on("mouseover", (event, d) => {
                d3.select(event.currentTarget)
                    .attr("fill", "#fd8d3c");

                d3.select("#hours")
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY + "px")
                    .style("background-color", "#391D6A")
                    .selectAll("p")
                    .style("color", "#e7298a")
                    .select("#value")
                    .text(d[1]);

                d3.select("#hours")
                    .select("#year")
                    .text("2021 " + d[0]); 

                d3.select("#hours").classed("hidden", false);

            })
            .on("mouseout", (event, d) => {
                d3.select(event.currentTarget)
                    .transition("restoreBarColor")
                    .duration(250)
                    .attr("fill",  d => "#e7298a");

                d3.select("#hours").classed("hidden", true);
            });

            circle2020.on("mouseover", (event, d) => {
                d3.select(event.currentTarget)
                    .attr("fill", "#fd8d3c");

                d3.select("#hours")
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY + "px")
                    .style("background-color", "#391D6A")
                    .selectAll("p")
                    .style("color", "#fee391")
                    .select("#value")
                    .text(d[1]);

                d3.select("#hours")
                    .select("#year")
                    .text("2020 " + d[0]); 

                d3.select("#hours").classed("hidden", false);

            })
            .on("mouseout", (event, d) => {
                d3.select(event.currentTarget)
                    .transition("restoreBarColor")
                    .duration(250)
                    .attr("fill",  d => "#fee391");

                d3.select("#hours").classed("hidden", true);
            });

        }).catch((error) => {
            console.log(error);
        });
    }

    render() {
        return (
            <div className="hours-monthly" style={{display: this.props.selectedStatsID === 1 ? "block" : "none"}} >
                <ChartHeader 
                    chartTitle="Event hours per month"
                    dotColor="#fee391"
                />
                <ChartContainer 
                    containerRef={this.props.hoursRef} 
                    tooltipID="hours"
                    tooltipValueTitle="hours"
                    tooltipOption="out of"
                    display="none"
                />
                <ChartFooter chartSource="The Warehouse Calendar, The Warehouse." />
            </div>
        );
    }
}