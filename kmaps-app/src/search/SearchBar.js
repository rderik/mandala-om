import React from 'react';
import { BasicSearch } from './BasicSearch';
import { AdvancedToggle } from '../main/AdvancedToggle';
import { HamburgerToggle } from '../main/HamburgerToggle';
import SearchContext from '../context/SearchContext';

export class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { advanced: false, hamburgerOpen: false };
        this.handleStateChange = this.handleStateChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    render() {
        const searchbar = (
            <div id="sui-top" className="sui-top">
                {/*<form onSubmit={this.handleSubmit}>*/}
                <div style={{ display: 'inline-block' }}>
                    <SearchContext>
                        <BasicSearch
                            onSubmit={this.handleSubmit}
                            onChange={this.handleInputChange}
                        />
                        <AdvancedToggle
                            onStateChange={this.handleStateChange}
                            advanced={this.state.advanced}
                        />
                        <HamburgerToggle
                            onStateChange={this.handleStateChange}
                            hamburgerOpen={this.state.hamburgerOpen}
                        />
                    </SearchContext>
                </div>
                {/*</form>*/}
            </div>
        );
        return searchbar;
    }

    handleInputChange(event) {
        console.log('Input Change', event.target.value);
        this.setState({ search: event.target.value });
    }

    handleSubmit(value) {
        console.log('Submit: ' + value);
        this.setState({ search: value });
    }

    handleClearBasic(event) {
        console.log('Clear');
        event.preventDefault();
    }

    handleStateChange(newstate) {
        this.setState(newstate, () => {
            // console.log("SearchBar State now: " + JSON.stringify(this.state));
            this.props.onStateChange(this.state);
        });
    }
}
