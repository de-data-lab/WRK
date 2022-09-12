import React from "react";
import * as d3 from "d3";
import ratingData from "../../data/safety_rating.csv";
import { ChartHeader, ChartFooter, ChartContainer } from "../housing/availableUnits";

export default class Rating extends React.Component {
    componentDidMount = () => {
        this.drawRating();
    }

    componentDidUpdate = () => {
        d3.select("svg").remove();
        this.drawRating();
    }

    drawRating = () => {
        //set svg size
        let w = 1000;
        let h = 500;
        let r = Math.min(w, h) / 2;

        let dataset = [];
        //loading data from csv file
        d3.csv(ratingData).then(data => {
            dataset = data;

            let color = d3.scaleOrdinal()
                            .domain(dataset.map(d => d.group))
                            .range(["#dd1c77", "#fee391", "#99d8c9", "#43a2ca", "#238b45"]);

            //construct an arc generator with inner and outer radius setting
            let arc = d3.arc() 
                        .innerRadius(r * 0.6)
                        .outerRadius(r * 0.8);

            //construct an arc generator for polylines and text labels
            let outerArc = d3.arc()
                                .innerRadius(r * 0.85)
                                .outerRadius(r * 0.85);
                                
            //construct a new pie generator with value setting
            const pie = d3.pie()
                            .value(d => d.percentage); 

            //create a svg element
            let svg = d3.select(this.props.ratingRef.current)
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h);

            //create a circle element inside the donut chart
            svg.append("circle")
                .attr("cx", 0)
                .attr("cy", 0)
                .attr("r", r * 0.55)
                .attr("fill", "#542788")
                .attr("class", "circle-inside")
                .attr("transform", `translate(${w/2 + 20}, ${h/2 + 20})`);

            //set up groups and load data for the chart
            let arcs = svg.selectAll("g.arc")
                            .data(pie(dataset)) 
                            .enter()
                            .append("g")
                            .attr("class", "arc")
                            .attr("transform", `translate(${w/2 + 20}, ${h/2 + 20})`);

            //Draw arc paths
            arcs.append("path")
                .attr("fill", "#542788") 
                .attr("stroke", "#542788")
                .attr("stroke-width", "2px")
                .attr("d", arc)
                .transition()
                    .duration(700)
                    .delay((d, i) => (i + 1) * 500)
                    .attr("fill", d => color(d.data.group)) ;



            //create a text element on the circle inside donut chart
            arcs.append("text")
                .attr("class", "percentage")
                .attr("text-anchor", "middle")
                .text("");

            //create polyline elements for each data group
            arcs.append("polyline")
                .attr("points", d => {
                    let posA = arc.centroid(d);
                    let posB = outerArc.centroid(d);
                    let posC = outerArc.centroid(d);
                    let midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                    posC[0] = r * 0.95 * (midAngle < Math.PI || midAngle > 6.2 ? 1 : -1);
                    return [posA, posB, posC];
                })
                .attr("fill", "none")
                .transition()
                    .duration(700)
                    .delay((d, i) => (i + 1) * 700)
                    .attr("stroke", d => color(d.data.group))
                    .attr("stroke-width", "1px");

            //create text label elements for each data group
            arcs.append("text")
                .transition()
                        .duration(700)
                        .delay((d, i) => (i + 1) * 800)
                        .attr("fill", d => color(d.data.group))
                        .attr("font-weight", "bold")
                        .attr("font-size", "20px")
                        .attr("dy", "0.35em")
                .text(d => `${d.data.group}, ${d.data.percentage}%`)
                .attr("transform", d => {
                    let pos = outerArc.centroid(d);
                    let midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2
                    pos[0] = r * (midAngle < Math.PI || midAngle > 6.2 ? 1 : -1);
                    return `translate(${pos})`;
                })
                .attr("text-anchor", d => {
                    let midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2
                    return (midAngle < Math.PI || midAngle > 6.2 ? 'start' : 'end');
                });
                

            //define event listners for mouseover, mouseout
            arcs.on("mouseover", (event, d) => {
                d3.select(".circle-inside")
                    .attr("fill", color(d.data.group));   
                    
                d3.select(".percentage")
                    .attr("fill", "white")
                    .attr("font-size", "100px")
                    .attr("font-weight", "3em")
                    .attr("dy", "0.3em")
                    .text(d3.format(".0%")(d.data.percentage / 100));
            })
            .on("mouseout", (event, d) => {
                d3.select(".circle-inside")
                    .attr("fill", "#542788");
                
                d3.select(".percentage")
                    .text("");
            });
    
        }).catch((error) => {
            console.log(error);
        });
    }

    render() {
        return (
            <div className="rating-gap" style={{display: this.props.selectedStatsID === 1 ? "block" : "none"}}>
                <ChartHeader 
                    chartTitle="How would you rate the safety in the community?"
                    dotColor="#238b45"
                />
                <ChartContainer 
                    containerRef={this.props.ratingRef} 
                    tooltipID="rating"
                    tooltipValueTitle="percentage"
                    tooltipOption="change"
                    display="none"
                />
                <ChartFooter chartSource="2020 Resident Survey." />
            </div>
        );
    }
}