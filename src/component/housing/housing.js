import React from "react";
import "../../style/App.css";
import Stats from "../homepage/stats";
import { homePageData } from "../../data/data";
import AvailableUnits from "./availableUnits";
import OccupiedPercentage from "./occupiedPercentage";
import MonthsSinceMoveIn from "./monthsSinceMoveIn";

export default class Housing extends React.Component {
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
    
    availableUnitsRef = React.createRef();
    occupiedPercentageRef = React.createRef();
    monthsRef = React.createRef();

    render() {
        return (
            <div className="chart-board">
                <Stats 
                    homePageData={homePageData.filter(e => e.id === 0)} 
                    statsBoardWidth="350px"
                    disabledStyle={true}
                    statsItemClick={this.statsItemClick}
                    selectedStatsID={this.state.selectedStatsID}
                />
                <AvailableUnits
                    selectedStatsID={this.state.selectedStatsID} 
                    availableUnitsRef={this.availableUnitsRef}
                />
                <OccupiedPercentage
                    selectedStatsID={this.state.selectedStatsID} 
                    occupiedPercentageRef={this.occupiedPercentageRef}
                />
                <MonthsSinceMoveIn
                    selectedStatsID={this.state.selectedStatsID} 
                    monthsRef={this.monthsRef}
                />
            </div>            
        );
    }
}
