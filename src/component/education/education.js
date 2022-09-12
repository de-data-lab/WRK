import React from "react";
import Stats from "../homepage/stats";
import { homePageData } from "../../data/data";
import Kindergarden from "./kindergarden";
import Literacy from "./literacy";
import Math from "./math";
import Graduation from "./graduation";

export default class Education extends React.Component {
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

    kindergardenRef = React.createRef();
    literacyRef = React.createRef();
    mathRef= React.createRef();
    graduationRef = React.createRef();

    render() {
        return (
            <div className="chart-board">
                <Stats 
                    homePageData={homePageData.filter(e => e.id === 1)} 
                    statsBoardWidth="350px"
                    disabledStyle={true}
                    statsItemClick={this.statsItemClick}
                    selectedStatsID={this.state.selectedStatsID}
                />
                <Kindergarden 
                    selectedStatsID={this.state.selectedStatsID}
                    kindergardenRef={this.kindergardenRef}
                />
                <Literacy
                    selectedStatsID={this.state.selectedStatsID}
                    literacyRef={this.literacyRef}
                />
                <Math 
                    selectedStatsID={this.state.selectedStatsID}
                    mathRef={this.mathRef}
                />
                <Graduation
                    selectedStatsID={this.state.selectedStatsID}
                    graduationRef={this.graduationRef}
                />
            </div>
        );
    }
}