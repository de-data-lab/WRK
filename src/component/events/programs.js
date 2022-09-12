import React from "react";
import * as d3 from "d3";
import eventData from "../../data/events_warehouse_calendar.csv";
import { ChartHeader, ChartFooter, ChartContainer } from "../housing/availableUnits";
import { RadioButton } from "./number";

class ProgramsRadioButton extends React.Component {
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
                                id={element + "programs"}
                                checked={this.props.year === element}
                            />
                        </React.Fragment>
                    );
                })} 
            </div>
        );
        
    }
}

export default class Programs extends React.Component {

    state = {
        programYear: "2022"
    }

    handleProgramsYearChange = (value) => {
        let programYear = this.state.programYear;
        programYear = value;
        this.setState({
            programYear: programYear
        })
    }

    componentDidMount = () => {
        this.drawPrograms();
    }

    componentDidUpdate = () => {
        d3.selectAll("svg").remove();
        this.drawPrograms();
    }

    drawPrograms = () => {
        //set svg size
        let w = 1000;
        let h = 500;
        let padding = 40;
        let leftMargin = 400;


        let dataset = [], xScale, yScale, xAxis, yAxis;

        //loading data from csv file
        d3.csv(eventData).then(data => {

            let programGroup = {};

            for (let obj of data) {
                if (obj.year !== this.state.programYear) continue;
                let name = obj.EventName;
                let hour = +obj.duration_hour;
                programGroup[name] = programGroup[name] ? programGroup[name] + hour : hour;
                
            }

            let topTenSum = 0, totalSum = 0;

            for (let key in programGroup) {
                totalSum += programGroup[key];
                dataset.push([key, programGroup[key]]);
            }

            dataset.sort((a, b) => a[1] - b[1]);

            dataset = dataset.slice(-10);

            for (let array of dataset) {
                topTenSum += array[1];
            }

            //construct a band scale with specified domain and range
            yScale = d3.scaleBand()
                        .domain(dataset.map(d => d[0]))
                        .range([h - padding, padding])
                        .paddingInner(0.8);
                                
            //construct a continuous scale with specified domain and range
            xScale = d3.scaleLinear()
                        .domain([0, d3.max(dataset, d => d[1]) + 100])
                        .range([leftMargin, w - padding])                                       

            //construct a left-oriented axis generator for the given scale
            yAxis = d3.axisLeft()
                        .scale(yScale);

            //construct a top-oriented axis generator for the given scale
            xAxis = d3.axisTop()
                        .scale(xScale)
                        .tickFormat(d => d + " h.")
                        .ticks(5);                            
            
            //create a svg element
            let svg = d3.select(this.props.programsRef.current)
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h);

            //create rect element and load dataset
            let rect = svg.selectAll("rect")
                            .data(dataset)
                            .enter()
                            .append("rect");

            rect.attr("x", leftMargin)
                .attr("y", d => yScale(d[0]))
                .attr("width", 0)
                .attr("height", yScale.bandwidth())
                .attr("fill", d => "#a8ddb5")
                .transition()
                    .duration(700)
                    .delay((d, i) => i * 300)
                    .attr("width", d => xScale(d[1]) - leftMargin);


            //Create axis-x and axis-y
            svg.append("g")
                .attr("class", "axis-x-programs")
                .attr("transform", `translate(0, ${padding})`)
                .attr("color", "#555")
                .call(xAxis)
                .selectAll("text")
                .attr("font-size", "15px")
                .attr("color", "#d9d9d9")
     
            svg.append("g")
                .attr("class", "axis-y-programs")
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
                dataset.sort((a, b) => sortOrder ? b[1] - a[1] : a[1] - b[1]);
                yScale.domain(dataset.map(d => d[0]));

                d3.select(".axis-y-programs")
                    .transition("yAxis")
                    .delay((d, i) => i * 10)
                    .duration(500)
                    .call(yAxis);

                rect.transition("sortBars")
                    .delay((d, i) => i * 10)
                    .duration(500)
                    .attr("y", d => yScale(d[0]));

            }

            //define event listeners for click, mouseover, mouseout
            rect.on("click", () => sortBars())
                .on("mouseover", (event, d) => {

                        d3.select(event.currentTarget)
                            .attr("fill", "#fd8d3c");

                        d3.select("#programs")
                            .style("left", event.pageX + "px")
                            .style("top", event.pageY + "px")
                            .select("#value")
                            .text(d[1]);

                        d3.select("#programs")
                            .select("#year")
                            .text(d[0]);

                        d3.select("#programs")
                            .select("#change")
                            .text(totalSum - topTenSum);
                            
                        d3.select("#programs").classed("hidden", false);

                    })
                    .on("mouseout", (event, d) => {
                        d3.select(event.currentTarget)
                            .transition("restoreBarColor")
                            .duration(250)
                            .attr("fill",  d => "#a8ddb5");

                        d3.select("#programs").classed("hidden", true);
                    });
    
        }).catch((error) => {
            console.log(error);
        });
    }

    render() {
        return (
            <div className="programs-hours" style={{display: this.props.selectedStatsID === 2 ? "block" : "none"}}>
                <ChartHeader 
                    chartTitle="Top ten events with most hours"
                    dotColor="#a8ddb5"
                />
                <ProgramsRadioButton
                    onChange={e => this.handleProgramsYearChange(e.target.value)} 
                    year={this.state.programYear}
                />
                <ChartContainer 
                    containerRef={this.props.programsRef} 
                    tooltipID="programs"
                    tooltipValueTitle="total hours"
                    tooltipOption="total hours of other programs"
                />
                <ChartFooter chartSource="The Warehouse Calendar, The Warehouse." />
            </div>
        );
    }
}