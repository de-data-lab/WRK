import React from "react";
import Stats from "../homepage/stats";
import { homePageData } from "../../data/data";
import Employment from "./employment";

export default class Workforce extends React.Component {
    state = {
        selectedStatsID: 0
    }

    employmentRef = React.createRef();

    statsItemClick = (value) => {
        let selectedStatsID = this.state.selectedStatsID;
        selectedStatsID = value;
        this.setState({
            selectedStatsID: selectedStatsID
        });
    }

    render() {
        return (
            <div className="chart-board">
                <Stats 
                    homePageData={homePageData.filter(e => e.id === 2)} 
                    statsBoardWidth="350px"
                    disabledStyle={true}
                    statsItemClick={this.statsItemClick}
                    selectedStatsID={this.state.selectedStatsID}
                />
                <Employment 
                    selectedStatsID={this.state.selectedStatsID}
                    employmentRef={this.employmentRef}
                />                
            </div>
        );
    }    
}