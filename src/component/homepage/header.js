import React from "react";
import { StatsHeader } from "./stats";
import { Link } from "react-router-dom";

class Logo extends React.Component {
    render() {
        return (
            <div className="logo" onClick={this.props.logoBoxClick} >
                <img src={this.props.logoURL} className="logoIcon" alt="WRK" />
                <p className="logoText">{this.props.logoText}</p>
            </div>
        );
    }
}

class NavBarTab extends React.Component {
    render() {
        const navbarTabStyle = {
            background: this.props.statsTitle === this.props.selectedTab ? "linear-gradient(#c994c7, #df65b0)" : null
        }

        return (
            <div className="navbar-tab" style={navbarTabStyle} onMouseOver={e => this.props.tabBoxMouseOver(this.props.statsTitle)} onMouseOut={e => this.props.tabBoxMouseOut()} >
                <Link to={this.props.statsLink} style={{textDecoration: "none"}}>
                    <StatsHeader 
                        statsTitle={this.props.statsTitle}
                        statsIcon={this.props.statsIcon}
                        fontColor="#ffffff"
                    />
                </Link>              
            </div>
        );
    }
}

class NavBar extends React.Component {
    render() {
        return (
            <div className="navbar">
                    {this.props.homePageData.map(e => {
                        return (
                            <React.Fragment key={e.id}>
                                <NavBarTab 
                                    statsTitle={e.statsTitle} 
                                    statsIcon={e.statsIcon}
                                    selectedTab={this.props.selectedTab}
                                    tabBoxMouseOver={this.props.tabBoxMouseOver}
                                    tabBoxMouseOut={this.props.tabBoxMouseOut}
                                    statsLink={e.statsLink}
                                />
                            </React.Fragment>
                        );
                    })}                
            </div>
        );
    }
}

export default class Header extends React.Component {
    render() {
        return (
            <div className="header">
                <Link to="/WRK" style={{textDecoration: "none"}}>
                    <Logo 
                        logoURL="https://raw.githubusercontent.com/YupengLei/wrk-dashboard-dark/main/public/image/WRK-logo.webp"
                        logoText="WRK Dashboard"
                        logoBoxClick={this.props.logoBoxClick}
                    />
                </Link> 
                <NavBar 
                    homePageData={this.props.homePageData} 
                    selectedTab={this.props.selectedTab}
                    tabBoxMouseOver={this.props.tabBoxMouseOver}
                    tabBoxMouseOut={this.props.tabBoxMouseOut}
                />
            </div>
        );
    }
}