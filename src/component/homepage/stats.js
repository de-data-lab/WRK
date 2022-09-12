import React from "react";
import { Link } from "react-router-dom";

export class StatsHeader extends React.Component {
    render() {
        return (
            <div className="stats-header">               
                <h3 className="stats-header-title" style={{color: this.props.fontColor}}>
                    <i className={this.props.statsIcon} style={{marginRight: "10px"}}></i>
                    {this.props.statsTitle}
                </h3>
            </div>
        );
    }
}

class StatsItem extends React.Component {
    render() {
        const statsValueStyle = {
            color: this.props.isStatsValuePositive ? "#AEDC6F" : "#FB5055"
        }

        const statsItemStyle = {
            background: this.props.statsID === this.props.selectedStatsID ? "linear-gradient(#c994c7, #df65b0)" : null,
            cursor: "pointer"
        }

        return (
            <div className="stats-item" onClick={e => this.props.disabledStyle ? this.props.statsItemClick(this.props.statsID) : null} style={statsItemStyle} >
                <div className="stats-amount">{this.props.statsAmount}</div>
                <div className="stats-caption">{this.props.statsCaption}</div>
                <div className="stats-change">
                    <div className="stats-value" style={statsValueStyle}>{this.props.statsValue}</div>
                    <div className="stats-period">{this.props.statsPeriod}</div>
                </div>
            </div>
        );
    }
}

class StatsList extends React.Component {
    render() {
        return (
            <div className="stats-list">
                {this.props.statsContent.map(e => {
                    return (
                        <React.Fragment key={e.statsID}>
                            <StatsItem 
                                statsAmount={e.statsAmount}
                                statsCaption={e.statsCaption}
                                statsValue={e.statsValue}
                                statsPeriod={e.statsPeriod}
                                isStatsValuePositive={e.isStatsValuePositive}
                                statsItemClick={this.props.statsItemClick}
                                statsID ={e.statsID}
                                selectedStatsID={this.props.selectedStatsID}
                                disabledStyle={this.props.disabledStyle}
                            />
                        </React.Fragment>
                    );                   
                })}
            </div>
        );
    }
}

class StatsBox extends React.Component {   
    render() {
        const statsBoxStyle = {
            background: this.props.statsTitle === this.props.selectedTab && !this.props.disabledStyle ? "linear-gradient(#c994c7, #df65b0)" : null,
            textDecoration: "none",
            cursor: !this.props.disabledStyle ? "pointer" : "default"
        }
        
        return (
            <Link to={this.props.statsLink} className="stats-box" onMouseOver={e => this.props.disabledStyle ? null : this.props.tabBoxMouseOver(this.props.statsTitle)} onMouseOut={e => this.props.disabledStyle ? null : this.props.tabBoxMouseOut()} onClick={this.props.disabledStyle ? null : this.props.logoBoxClick} style={statsBoxStyle}>
                <StatsHeader 
                    statsTitle={this.props.statsTitle}
                    statsIcon={this.props.statsIcon}
                    fontColor="#4d004b"
                />
                <StatsList 
                    statsContent={this.props.statsContent}
                    statsItemClick={this.props.statsItemClick}
                    selectedStatsID={this.props.selectedStatsID}
                    disabledStyle={this.props.disabledStyle}
                />
            </Link>
        );
    }
}

export default class Stats extends React.Component {
    render() {
        return (
            <div className="stats-board" style={{width: this.props.statsBoardWidth}}>
              {this.props.homePageData.map(e => {
                return (
                  <React.Fragment key={e.id}>
                        <StatsBox 
                            statsTitle={e.statsTitle}
                            statsIcon={e.statsIcon}
                            statsContent={e.statsContent}
                            tabBoxMouseOver={this.props.tabBoxMouseOver}
                            tabBoxMouseOut={this.props.tabBoxMouseOut}
                            selectedTab={this.props.selectedTab}
                            statsLink={e.statsLink}
                            logoBoxClick={this.props.logoBoxClick}
                            disabledStyle={this.props.disabledStyle}
                            statsItemClick={this.props.statsItemClick}
                            selectedStatsID={this.props.selectedStatsID}
                        />                    
                  </React.Fragment>
                );
              })}
           </div>   
        );
    }
}