import './style/App.css';
import React from 'react';
import Stats from './component/homepage/stats';
import {homePageData} from './data/data';
import Header from './component/homepage/header';
import { Route, BrowserRouter, Routes } from "react-router-dom";


export default class App extends React.Component {
    state = {
      homePageData: homePageData,
      selectedTab: "",
    }

    tabBoxMouseOver = (value) => {
      let selectedTab = this.state.selectedTab;
      selectedTab = value;
      this.setState({
        selectedTab: selectedTab
      });
    }

    tabBoxMouseOut = () => {
      this.setState({
        selectedTab: ""
      });
    }

    logoBoxClick = () => {
      this.setState({
        selectedTab: ""
      });
    }
  
    render() {
        return (
          <div>
            <BrowserRouter>
              <Header 
                homePageData={this.state.homePageData} 
                selectedTab={this.state.selectedTab}
                tabBoxMouseOver={this.tabBoxMouseOver}
                tabBoxMouseOut={this.tabBoxMouseOut}
                logoBoxClick={this.logoBoxClick}
              />
            
              <Routes>
                <Route
                  path="/WRK/"
                  element={
                    <Stats 
                      homePageData={this.state.homePageData} 
                      tabBoxMouseOver={this.tabBoxMouseOver}
                      selectedTab={this.state.selectedTab}
                      tabBoxMouseOut={this.tabBoxMouseOut}
                      logoBoxClick={this.logoBoxClick}
                    /> 
                  } 
                />
                {this.state.homePageData.map(e => {
                  return (
                    <React.Fragment key={e.id}>
                      <Route 
                        path={e.statsLink} 
                        element={e.element}>
                      </Route>
                    </React.Fragment>
                  );
                })}
              </Routes>
            </BrowserRouter>
            
          </div>
           
        );
    }             
}

