import React from "react";
import * as d3 from "d3";
import kindergartenRiversideData from "../../data/education_kinder_readiness_WRK.csv";
import kindergartenDelawareData from "../../data/education_kinder_readiness_wide.csv";
import { ChartHeader, ChartFooter, ChartContainer } from "../housing/availableUnits";

export default class Kindergarden extends React.Component {
    componentDidMount = () => {
        this.drawKindergarden();
    }

    componentDidUpdate = () => {
        d3.select("svg").remove();
        this.drawKindergarden();
    }

    drawKindergarden = () => {
        //set svg size
        let w = 1000;
        let h = 500;
        let padding = 120;

        let dataset = [], delawareDataset = [], xScale, yScale, xAxis, yAxis, line, delawareLine;
        //loading data from csv file
        d3.csv(kindergartenRiversideData).then(data => {
            data.sort((a, b) => a.year - b.year);
            let prev;
            for (let i = 0; i < data.length; i++) {
                if (prev === undefined) prev = data[i].kinder_ready_prop;
                data[i].change = data[i].kinder_ready_prop / prev - 1;
                prev = data[i].kinder_ready_prop;    
            }

            dataset = data;

            d3.csv(kindergartenDelawareData).then(delawareData => {
                let prevDE;
                for (let i = 0; i < delawareData.length; i++) {
                    if (prevDE === undefined) prevDE = delawareData[i].mean;
                    delawareData[i].change = delawareData[i].mean / prevDE - 1;
                    prevDE = delawareData[i].mean;    
                }

                delawareDataset = delawareData;

                //construct a band scale with specified domain and range
                xScale = d3.scaleBand()
                            .domain(["2016", "2017", "2018", "2019", "2020", "2021"])
                            .range([padding, w - padding])
                            .paddingInner(1);
                    
                //construct a continuous scale with specified domain and range
                yScale = d3.scaleLinear()
                            .domain([0.5, 1])
                            .range([h - padding, padding]);

                //construct a bootom-oriented axis generator for the given scale
                xAxis = d3.axisBottom()
                            .scale(xScale);

                //construct a left-oriented axis generator for the given scale
                yAxis = d3.axisLeft()
                            .scale(yScale)
                            .ticks(5)
                            .tickFormat(d3.format(".0%"));

                line = d3.line()  
                            .x(d => xScale(d.year)) 
                            .y(d => yScale(d.kinder_ready_prop)); 

                delawareLine = d3.line()
                                    .x(d => xScale(d.TimeFrame)) 
                                    .y(d => yScale(d.mean));

                //create svg element
                let svg = d3.select(this.props.kindergardenRef.current)
                            .append("svg")
                            .attr("width", w)
                            .attr("height", h); 


                //create lines
                let path = svg.append("path")
                                .datum(dataset) 
                                .attr("class", "line")
                                .attr("d", line); 

                let delawarePath = svg.append("path")
                                        .datum(delawareDataset)
                                        .attr("class", "delawareLine")
                                        .attr("d", delawareLine);
                //create dots
                let circle = svg.append("g")
                                .selectAll("circle")
                                .data(dataset)
                                .enter()
                                .append("circle")
                                    .attr("cx", d => xScale(d.year))
                                    .attr("cy", d => yScale(d.kinder_ready_prop))
                                    .attr("r", 5)
                                    .attr("fill", "#a8ddb5")

                let delawareCircle = svg.append("g")
                                        .selectAll("circle")
                                        .data(delawareDataset)
                                        .enter()
                                        .append("circle")
                                            .attr("cx", d => xScale(d.TimeFrame))
                                            .attr("cy", d => yScale(d.mean))
                                            .attr("r", 5)
                                            .attr("fill", "#e7298a")

                let totalLength = path.node().getTotalLength();

                path.attr("stroke-dasharray", totalLength + " " + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                        .duration(4000)
                        .attr("stroke-dashoffset", 0);

                let totalDELength = delawarePath.node().getTotalLength();

                delawarePath.attr("stroke-dasharray", totalDELength + " " + totalDELength)
                            .attr("stroke-dashoffset", totalDELength)
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
                    .attr("transform", `translate(${w - 100}, ${yScale(dataset[dataset.length - 1].kinder_ready_prop)})`)
                    .attr("dy", ".35em")
                    .attr("text-anchor", "start")
                    .style("fill", "#a8ddb5")
                    .transition()
                        .delay(4000)
                        .duration(400)
                    .text("Riverside");

                svg.append("text")
                    .attr("transform", `translate(${w / 2}, ${yScale(delawareDataset[delawareDataset.length - 1].mean)})`)
                    .attr("dy", "-.35em")
                    .attr("text-anchor", "start")
                    .style("fill", "#e7298a")
                    .transition()
                        .delay(4000)
                        .duration(400)
                    .text("Delaware");

                //define event listeners for click, mouseover, mouseout
                circle.on("mouseover", (event, d) => {
                            d3.select(event.currentTarget)
                                .attr("fill", "#fd8d3c");

                            d3.select("#kindergarden")
                                .style("left", event.pageX + "px")
                                .style("top", event.pageY + "px")
                                .style("background-color", "#391D6A")
                                .selectAll("p")
                                .style("color", "#d95f02")
                                .select("#value")
                                .text(d3.format(".1%")(d.kinder_ready_prop));

                            d3.select("#kindergarden")
                                .select("#year")
                                .text("Riverside " + d.year); 
                                
                            d3.select("#kindergarden")
                                .select("#change")
                                .text(d3.format("+,.1%")(d.change));

                            d3.select("#kindergarden").classed("hidden", false);

                        })
                        .on("mouseout", (event, d) => {
                            d3.select(event.currentTarget)
                                .transition("restoreBarColor")
                                .duration(250)
                                .attr("fill", "#a8ddb5");

                            d3.select("#kindergarden").classed("hidden", true);
                        });

                delawareCircle.on("mouseover", (event, d) => {
                    d3.select(event.currentTarget)
                        .attr("fill", "#8c6bb1");

                    d3.select("#kindergarden")
                        .style("left", event.pageX + "px")
                        .style("top", event.pageY + "px")
                        .style("background-color", "#8c6bb1")
                        .selectAll("p")
                        .style("color", "#4d004b")
                        .select("#value")
                        .text(d3.format(".1%")(d.mean));

                    d3.select("#kindergarden")
                        .select("#year")
                        .text("Delaware " + d.TimeFrame); 
                        
                    d3.select("#kindergarden")
                        .select("#change")
                        .text(d3.format("+,.1%")(d.change));

                    d3.select("#kindergarden").classed("hidden", false);

                })
                .on("mouseout", (event, d) => {
                    d3.select(event.currentTarget)
                        .transition("restoreBarColor")
                        .duration(250)
                        .attr("fill", "#e7298a");

                    d3.select("#kindergarden").classed("hidden", true);
                });

            }).catch((error) => {
                console.log(error);
            });
        
        }).catch((error) => {
            console.log(error);
        });
    }

    render() {
        return (
            <div className="kindergarden-readiness" style={{display: this.props.selectedStatsID === 0 ? "block" : "none"}}>
                <ChartHeader 
                    chartTitle="Children achieving kindergarten readiness"
                    dotColor="#e7298a"
                />
                <ChartContainer 
                    containerRef={this.props.kindergardenRef} 
                    tooltipID="kindergarden"
                    tooltipValueTitle="percentage"
                    tooltipOption="change"
                />
                <ChartFooter chartSource="The Annie E. Casey Foundation Kids Count Data Center." />
            </div>
        );
    }
}