import React, { useState } from 'react';
import { BasicSearch } from './BasicSearch';
import { AdvancedToggle } from '../main/AdvancedToggle';
import { HamburgerToggle } from '../main/HamburgerToggle';
import SearchContext from '../context/SearchContext';

export function SearchBar(props) {
    const [search, setSearch] = useState('');

    function toggleAdvanced() {
        props.onStateChange({ advanced: !props.advanced });
    }

    function toggleHamburger() {
        props.onStateChange({ hamburgerOpen: !props.hamburgerOpen });
    }

    function handleInputChange(event) {
        console.log('Input Change', event.target.value);
        setSearch(event.target.value);
    }

    function handleSubmit(value) {
        console.log('Submit: ' + value);
        setSearch(value);
    }

    function handleClearBasic(event) {
        console.log('Clear');
        event.preventDefault();
    }

    const searchbar = (
        <section id="c-siteHeader__search" className="c-siteHeader__search">
            {/*<form onSubmit={this.handleSubmit}>*/}
            <SearchContext>
                <BasicSearch
                    onSubmit={handleSubmit}
                    onChange={handleInputChange}
                />
                <AdvancedToggle
                    onToggleAdvanced={toggleAdvanced}
                    advanced={props.advanced}
                />
            </SearchContext>
            {/*</form>*/}
        </section>
    );
    return searchbar;
}
