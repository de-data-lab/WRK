import React from "react";
import * as d3 from "d3";
import housingData from "../../data/hud_de_combined.csv";

export class ChartHeader extends React.Component {
    render() {
        const chartHeaderStyle = {
            marginRight: "10px",
            color: this.props.dotColor
        }

        return (
            <div id="header">
                <i className="fa-regular fa-circle-dot" style={chartHeaderStyle}></i>
                <span>{this.props.chartTitle}</span>
            </div>
        );
    }
}

export class ChartFooter extends React.Component {
    render() {
        return (
            <div id="footer">
                <p><strong>Source: </strong>{this.props.chartSource}</p>
            </div>
        );
    }
}

class Tooltip extends React.Component {
    render() {
        return (
            <div id={this.props.tooltipID} className="hidden">
                <p><strong id="year"></strong></p>
                <p>{this.props.tooltipValueTitle}: <span id="value">100</span></p>
                <p style={{display: this.props.display}} >{this.props.tooltipOption}: <span id="change">100%</span></p>
            </div>
        );
    }
}


export class ChartContainer extends React.Component {
    render() {
        return (
            <div ref={this.props.containerRef} className="chart">
                <Tooltip 
                    tooltipID={this.props.tooltipID} 
                    tooltipValueTitle={this.props.tooltipValueTitle}
                    tooltipOption={this.props.tooltipOption}
                    display={this.props.display}
                />
            </div>
        );
    }
}

export default class AvailableUnits extends React.Component {
    componentDidMount = () => {
        this.drawAvailableUnits();
    }

    componentDidUpdate = () => {
        d3.select("svg").remove();
        this.drawAvailableUnits();
    }

    drawAvailableUnits = () => {
        //set svg size
        let w = 1000;
        let h = 500;
        let padding = 120;

        let dataset = [], xScale, yScale, xAxis, yAxis;
        //loading data from csv file
        d3.csv(housingData).then(data => {
            let prev;
            for (let obj of data) {
                if (obj.code !== "10003003002") continue;
                if (prev === undefined) prev = obj.total_units;
                dataset.push([obj.year, obj.total_units, obj.total_units / prev - 1]);
                prev = obj.total_units;
            }  

            //construct a band scale with specified domain and range
            xScale = d3.scaleBand()
                        .domain(dataset.map(d => d[0]))
                        .range([padding, w])
                        .paddingInner(0.8);
                                
            //construct a continuous scale with specified domain and range
            yScale = d3.scaleLinear()
                        .domain([200, 400])
                        .range([h - padding, padding]);
                        

            //construct a bootom-oriented axis generator for the given scale
            xAxis = d3.axisBottom()
                        .scale(xScale);

            //construct a left-oriented axis generator for the given scale
            yAxis = d3.axisLeft()
                        .scale(yScale)
                        .tickFormat(d => d + " units")
                        .ticks(5);                            
            
            //create svg element
            let svg = d3.select(this.props.availableUnitsRef.current)
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h);  

            //create rect element and load dataset
            let rect = svg.selectAll("rect")
                            .data(dataset)
                            .enter()
                            .append("rect");

            rect.attr("x", d => xScale(d[0]))
                .attr("y", h - padding)
                .attr("width", xScale.bandwidth())
                .attr("height", 0)
                .attr("fill", d => "#a8ddb5")
                .transition()
                    .duration(700)
                    .delay((d, i) => i * 300)
                    .attr("y", d => yScale(d[1]))
                    .attr("height", d => h - padding - yScale(d[1]));

            //create percentage label on top
            let percentageLabel = svg.selectAll("text")
                                        .data(dataset)
                                        .enter()
                                        .append("text");

            percentageLabel.attr("class", "percentage-label")
                            .attr("x", d => xScale(d[0]))
                            .attr("y", d => yScale(d[1]) - 15)
                            .attr("text-anchor", "start")
                            .attr("font-weight", "bold")
                            .attr("font-size", "14px")
                            .attr("fill", d => d[2] >= 0 ? "#41ae76" : "#ce1256")
                            .transition()
                                .duration(700)
                                .delay((d, i) => i * 500)
                                .text(d => d3.format("+,.1%")(d[2]));


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


            //define sortBars function to sort bars 
            let sortOrder = false;
            const sortBars = () => {
                sortOrder = !sortOrder; 

                dataset.sort((a, b) => sortOrder ? a[1] - b[1] : a[0] - b[0]);

                xScale.domain(dataset.map(d => d[0]));

                d3.select(".axis-x")
                    .transition("xAxis")
                    .delay((d, i) => i * 10)
                    .duration(500)
                    .call(xAxis);

                rect.transition("sortBars")
                    .delay((d, i) => i * 10)
                    .duration(500)
                    .attr("x", d => xScale(d[0]));

                percentageLabel
                    .attr("x", d => xScale(d[0]));
            }

            //define event listeners for click, mouseover, mouseout
            rect.on("click", () => sortBars())
                .on("mouseover", (event, d) => {
                        d3.select(event.currentTarget)
                            .attr("fill", "#fd8d3c");

                        d3.select("#available")
                            .style("left", event.pageX + "px")
                            .style("top", event.pageY + "px")
                            .select("#value")
                            .text(d[1]);

                        d3.select("#year")
                            .text("Riverside " + d[0]);

                        d3.select("#change")
                            .text(d3.format("+,.1%")(d[2]));
                            
                        d3.select("#available").classed("hidden", false);

                    })
                    .on("mouseout", (event, d) => {
                        d3.select(event.currentTarget)
                            .transition("restoreBarColor")
                            .duration(250)
                            .attr("fill",  d => "#a8ddb5");

                        d3.select("#available").classed("hidden", true);
                    });
            }).catch((error) => {
                console.log(error);
            });
    }

    render() {
        return (
            <div className="available-units" style={{display: this.props.selectedStatsID === 0 ? "block" : "none"}} >
                <ChartHeader 
                    chartTitle="Rental units available in Riverside"
                    dotColor="#a8ddb5"
                />
                <ChartContainer 
                    containerRef={this.props.availableUnitsRef} 
                    tooltipID="available"
                    tooltipValueTitle="available units"
                    tooltipOption="change"
                />
                <ChartFooter chartSource="U.S. Department of Housing and Urban Development (HUD)." />
            </div>
        );
    }
}