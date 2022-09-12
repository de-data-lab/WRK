import React from "react";
import Stats from "../homepage/stats";
import { homePageData } from "../../data/data";
import Number from "./number";
import Hours from "./hours";
import Programs from "./programs";

export default class Events extends React.Component {
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

    numberRef = React.createRef();
    hoursRef = React.createRef();
    programsRef = React.createRef();

    render() {
        return (
            <div className="chart-board">
                <Stats 
                    homePageData={homePageData.filter(e => e.id === 4)} 
                    statsBoardWidth="350px"
                    disabledStyle={true}
                    statsItemClick={this.statsItemClick}
                    selectedStatsID={this.state.selectedStatsID}
                />
                <Number 
                    selectedStatsID={this.state.selectedStatsID}
                    numberRef={this.numberRef}
                />
                <Hours
                    selectedStatsID={this.state.selectedStatsID}
                    hoursRef={this.hoursRef}
                />
                <Programs
                    selectedStatsID={this.state.selectedStatsID}
                    programsRef={this.programsRef}
                />               
            </div>
        );
    }
}