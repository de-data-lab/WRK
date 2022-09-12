import React from "react";
import * as d3 from "d3";
import graduationData from "../../data/education_graduation_summary.csv";
import { ChartHeader, ChartFooter, ChartContainer } from "../housing/availableUnits";

export default class Graduation extends React.Component {
    componentDidMount = () => {
        this.drawGraduation();
    }

    componentDidUpdate = () => {
        d3.select("svg").remove();
        this.drawGraduation();
    }

    drawGraduation = () => {
        //set svg size
        let w = 1000;
        let h = 500;
        let padding = 120;

        let dataset = [], xScale, subScale, yScale, xAxis, yAxis;
        //loading data from csv file
        d3.csv(graduationData).then(data => {
            let subgroups = ["brandywine_christina_colonial", "delaware"];
            
            dataset = data;

            //construct a band scale with specified domain and range
            xScale = d3.scaleBand()
                        .domain(["2015", "2016", "2017", "2018", "2019", "2020"])
                        .range([padding, w - padding])
                        .paddingInner(0.6);

            subScale = d3.scaleBand()
                            .domain(subgroups)
                            .range([0, xScale.bandwidth()])
                            .padding([0.1])
                
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

            //create svg element
            let svg = d3.select(this.props.graduationRef.current)
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h); 

            //create rect element and load dataset
            let rect = svg.append("g")
                            .selectAll("g")
                            .data(dataset)
                            .enter()
                            .append("g")
                            .attr("transform", d => `translate(${xScale(d.schoolyear)}, 0)`)
                            .selectAll("rect")
                            .data(d => subgroups.map(key => { return {key: key, value: d[key] / 100, year: d.schoolyear}; }))
                            .enter()
                            .append("rect");

            rect.attr("x", d => subScale(d.key))
                .attr("y", h - padding)
                .attr("width", subScale.bandwidth())
                .attr("height", 0)
                .attr("fill", d => d.key === 'brandywine_christina_colonial' ? "#a8ddb5" : "#e7298a")
                .transition()
                    .duration(700)
                    .delay((d, i) => i * 300)
                    .attr("y", d => yScale(d.value))
                    .attr("height", d => h - padding - yScale(d.value));

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
                    .attr("y", padding - 50)
                    .attr("width", 10)
                    .attr("height", 10)
                    .attr("fill", d => d === 'brandywine_christina_colonial' ? "#a8ddb5" : "#e7298a");

            legend.append("text")
                    .attr("x", w - 24)
                    .attr("y", padding - 50)
                    .attr("dy", "0.7em")
                    .attr("fill", d => d === 'brandywine_christina_colonial' ? "#a8ddb5" : "#e7298a")
                    .text(d => d === "brandywine_christina_colonial" ? "brandywine, christina, colonial district" : "delaware ");

            legend.transition()
                    .duration(500)
                    .delay((d, i) => 1300 + 100 * i)
                    .style("opacity", "1");

            //define event listeners for click, mouseover, mouseout
            rect.on("mouseover", (event, d) => {
                    d3.select(event.currentTarget)
                        .attr("fill", "#fd8d3c");

                    d3.select("#graduation")
                        .style("left", event.pageX + "px")
                        .style("top", event.pageY + "px")
                        .style("background-color", d.key === "brandywine_christina_colonial" ? "#391D6A" : "#8c6bb1")
                        .selectAll("p")
                        .style("color", d.key === "brandywine_christina_colonial" ? "#d95f02" : "#4d004b")
                        .select("#value")
                        .text(d3.format(".1%")(d.value));

                    d3.select("#graduation")
                        .select("#year")
                        .text(d.key === "brandywine_christina_colonial" ? "brandywine, christina, colonial district " + d.year : "delaware " + d.year);
                        
                    d3.select("#graduation").classed("hidden", false);

                })
                .on("mouseout", (event, d) => {
                    d3.select(event.currentTarget)
                        .transition("restoreBarColor")
                        .duration(250)
                        .attr("fill",  d => d.key === 'brandywine_christina_colonial' ? "#a8ddb5" : "#e7298a");

                    d3.select("#graduation").classed("hidden", true);
                });
    
        }).catch((error) => {
            console.log(error);
        });
    }

    render() {
        return (
            <div className="graduation-gap" style={{display: this.props.selectedStatsID === 3 ? "block" : "none"}}>
                <ChartHeader 
                    chartTitle="High school students graduating within 4 years"
                    dotColor="#e7298a"
                />
                <ChartContainer 
                    containerRef={this.props.graduationRef} 
                    tooltipID="graduation"
                    tooltipValueTitle="percentage"
                    tooltipOption="change"
                    display="none"
                />
                <ChartFooter chartSource="Delaware Open Data." />
            </div>
        );
    }
}