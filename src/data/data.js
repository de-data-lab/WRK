import Housing from "../component/housing/housing";
import Education from '../component/education/education';
import Workforce from '../component/workforce/workforce';
import Safety from '../component/safety/safety';
import Events from '../component/events/events';

export const homePageData = [
    {
        id: 0,
        statsTitle: "Housing",
        statsIcon: "fa-solid fa-house-chimney",
        statsLink: "/WRK/housing",
        element: <Housing />,
        statsContent: [
            {
                statsID: 0,
                statsAmount: "273",
                statsCaption: "rental units in 2021",
                statsValue: "- 4.3",
                statsPeriod: "per year",
                isStatsValuePositive: false
            },
            {
                statsID: 1,
                statsAmount: "80%",
                statsCaption: "rental units occupied",
                statsValue: "- 3.9%",
                statsPeriod: "per year",
                isStatsValuePositive: false
            },
            {
                statsID: 2,
                statsAmount: "120",
                statsCaption: "months since moved in",
                statsValue: "+ 3.6",
                statsPeriod: "per year",
                isStatsValuePositive: true
            }
        ]
    },
    {
        id: 1,
        statsTitle: "Education",
        statsIcon: "fa-solid fa-graduation-cap",
        statsLink: "/WRK/education",
        element: <Education />,
        statsContent: [
            {
                statsID: 0,
                statsAmount: "82%",
                statsCaption: "kindergarden readiness",
                statsValue: "+ 21.9%",
                statsPeriod: "more than DE",
                isStatsValuePositive: true
            },
            {
                statsID: 1,
                statsAmount: "-10.0%",
                statsCaption: "literacy achievement gap to DE",
                statsValue: "+ 3.0%",
                statsPeriod: "per year",
                isStatsValuePositive: true
            },
            {
                statsID: 2,
                statsAmount: "-2.4%",
                statsCaption: "math achievement gap to DE",
                statsValue: "+ 2.1%",
                statsPeriod: "per year",
                isStatsValuePositive: true
            },
            {
                statsID: 3,
                statsAmount: "-6.8%",
                statsCaption: "high school graduation gap to DE",
                statsValue: "+ 0.5%",
                statsPeriod: "per year",
                isStatsValuePositive: true
            }
        ]

    },
    {
        id: 2,
        statsTitle: "Workforce",
        statsIcon: "fa-solid fa-briefcase",
        statsLink: "/WRK/workforce",
        element: <Workforce />,
        statsContent: [
            {
                statsID: 0,
                statsAmount: "-9.4%",
                statsCaption: "employment rate gap to Wilmington",
                statsValue: "- 2.7%",
                statsPeriod: "per year",
                isStatsValuePositive: false
            }
        ]
    },
    {
        id: 3,
        statsTitle: "Safety",
        statsIcon: "fa-solid fa-shield-virus",
        statsLink: "/WRK/safety",
        element: <Safety />,
        statsContent: [
            {
                statsID: 0,
                statsAmount: "66.8%",
                statsCaption: "feeling safe while walking during day time",
            },
            {
                statsID: 1,
                statsAmount: "52.1%",
                statsCaption: "rate the safety above fair in the community",
            },
            {
                statsID: 2,
                statsAmount: "74.0%",
                statsCaption: "saying gun violence is the top concern in the community",
            }
        ]
    },
    {
        id: 4,
        statsTitle: "Events",
        statsIcon: "fa-solid fa-calendar-days",
        statsLink: "/WRK/events",
        element: <Events />,
        statsContent: [
            {
                statsID: 0,
                statsAmount: "88.8",
                statsCaption: "events hosted per month",
            },
            {
                statsID: 1,
                statsAmount: "1745.9",
                statsCaption: "hours service provided to the community per year",
            },
            {
                statsID: 2,
                statsAmount: "729",
                statsCaption: "hours service provided from the event with the most hours",
            }
        ]
    }
]



