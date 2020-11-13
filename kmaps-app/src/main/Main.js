import React, { useEffect, useState } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import Router from './RouterSelect';

import { SiteHeader } from './SiteHeader/SiteHeader';
import { Home } from './HomePage/Home';
import { ContentMain } from './ContentMain';
import { Hamburger } from './MainNavToggle/Hamburger';

import { SearchBar } from '../search/SearchBar';
import { SearchAdvanced } from '../search/SearchAdvanced';
import { Error404 } from '../App';
import SearchContext from '../context/SearchContext';
import { useStoreRehydrated } from 'easy-peasy';
import HistoryListener from '../views/History/HistoryListener';
import FancyTree from '../views/FancyTree';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Container from 'react-bootstrap/Container';
import { useHistory } from 'react-router';
import { useStoreState } from '../model/StoreModel';

const stateDefault = {
    kmasset: {
        header: 'Mandala',
        title: ['Mandala'],
        uid: 'mandala',
    },
};

export function Main(props) {
    const [state, setState] = useState(stateDefault);
    const handleStateChange = (new_state) => {
        setState({ ...state, ...new_state });
    };
    // const storeReady = true;
    const storeReady = useStoreRehydrated();
    const loading = <div className={'loading-msg'}>Loading...</div>;

    let stateList = [];
    if (state.advanced) {
        stateList.push('u-ToggleState--advanced');
    }
    if (state.tree) {
        stateList.push('u-ToggleState--tree');
    }
    if (!state.tree && !state.advanced) {
        stateList.push('u-ToggleState--off');
    }

  // Using Easy Peasy state:
    const currentFeatureId = useStoreState((state) => state.kmap.uid);

    const searchClasses = stateList.join(' ');
    const main = (
        <Router
            {...(process.env.REACT_APP_STANDALONE !== 'standalone'
                ? { basename: '/mandala-om' }
                : {})}
        >
            <div
                id={'l-site__wrap'}
                className={`l-site__wrap  ${searchClasses}`}
            >
                <HistoryListener />
                <SiteHeader
                    advanced={state.advanced}
                    tree={state.tree}
                    onStateChange={handleStateChange}
                />
                <Hamburger hamburgerOpen={state.hamburgerOpen} />

                <Switch>
                    <Route path={'/home'}>
                        <Home />
                    </Route>
                    {process.env.REACT_APP_STANDALONE !== 'standalone' && (
                        <Route exact path={'/'}>
                            <Redirect to={'/home'} />
                        </Route>
                    )}
                    <Route path={'/'}>
                        <ContentMain
                            site={'mandala'}
                            mode={'development'}
                            title={'Mandala'}
                            sui={props.sui}
                            kmasset={state.kmasset}
                            kmap={state.kmap}
                            onStateChange={handleStateChange}
                        />
                    </Route>
                    <Route path={'*'}>
                        <Error404 />
                        <Home />
                    </Route>
                </Switch>
                {/* Commented this out to get Asset Views to work (ndg) */}
                <SearchContext>
                    <SearchAdvanced
                        advanced={state.advanced}
                        onStateChange={handleStateChange}
                    />
                    <TreeNav currentFeatureId={currentFeatureId} tree={state.tree} />
                </SearchContext>
                <Hamburger hamburgerOpen={state.hamburgerOpen} />
            </div>
        </Router>
    );

    const ret = storeReady ? main : loading;
    return ret;
}

export function TreeNav(props) {
    const openclass = props.tree ? 'open' : 'closed';

    const tabs = (
        <aside
            id="l-column__search--treeNav"
            className={`l-column__search c-TreeNav--tabs ${openclass} overflow-auto`}
        >
            <div>
                <span
                    className={
                        'sacrifical-dummy-element-that-is-not-displayed-for-some-reason'
                    }
                ></span>
                <Tabs defaultActiveKey="places" id="kmaps-tab">
                    <Tab eventKey="places" title="Places">
                        <PlacesTree currentFeatureId={props.currentFeatureId}/>
                    </Tab>
                    <Tab eventKey="subjects" title="Subjects">
                        <SubjectsTree currentFeatureId={props.currentFeatureId}/>
                    </Tab>
                    <Tab eventKey="terms" title="Terms">
                        <TermsTree currentFeatureId={props.currentFeatureId}/>
                    </Tab>
                </Tabs>
            </div>
        </aside>
    );
    return tabs;
}

function PlacesTree(props) {
    return (
        <FancyTree
            domain="places"
            tree="places"
            descendants={true}
            directAncestors={false}
            displayPopup={true}
            perspective="pol.admin.hier"
            view="roman.scholar"
            sortBy="header_ssort+ASC"
            currentFeatureId={props.currentFeatureId}
        />
    );
}

function TermsTree(props) {
    return (
        <FancyTree
            domain="terms"
            tree="terms"
            descendants={true}
            directAncestors={false}
            displayPopup={true}
            perspective="tib.alpha"
            view="roman.scholar"
            sortBy="position_i+ASC"
            currentFeatureId={props.currentFeatureId}
        />
    );
}

function SubjectsTree(props) {
    return (
        <FancyTree
            domain="subjects"
            tree="subjects"
            descendants={true}
            directAncestors={false}
            displayPopup={true}
            perspective={'gen'}
            view="roman.popular"
            sortBy="header_ssort+ASC"
            currentFeatureId={props.currentFeatureId}
        />
    );
}
