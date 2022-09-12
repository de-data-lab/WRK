import React from "react";
import Stats from "../homepage/stats";
import { homePageData } from "../../data/data";
import Walking from "./walking";
import Rating from "./rating";
import Concern from "./concern";

export default class Safety extends React.Component {
    state = {
        selectedStatsID: 0
    }

    statsItemClick = (value) => {
        let selectedStatsID = this.state.selectedStatsID;
        selectedStatsID = value;
        this.setState({
            selectedStatsID: selectedStatsID
        });
    }

    walkingRef = React.createRef();
    ratingRef = React.createRef();
    concernRef = React.createRef();

    render() {
        return (
            <div className="chart-board">
                <Stats 
                    homePageData={homePageData.filter(e => e.id === 3)} 
                    statsBoardWidth="350px"
                    disabledStyle={true}
                    statsItemClick={this.statsItemClick}
                    selectedStatsID={this.state.selectedStatsID}
                />
                <Walking 
                    selectedStatsID={this.state.selectedStatsID}
                    walkingRef={this.walkingRef}
                />
                <Rating
                    selectedStatsID={this.state.selectedStatsID}
                    ratingRef={this.ratingRef}
                />
                <Concern
                    selectedStatsID={this.state.selectedStatsID}
                    concernRef={this.concernRef}
                />
            </div>
        );
    }
}