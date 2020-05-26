import React from 'react';
import SearchUI from '../legacy/searchui.js';
import Pages from '../legacy/pages.js';
import {Parser} from "html-to-react";
import $ from "jquery";

export function RelatedsViewer(props) {

        const parser = new Parser();
        const relateds = parser.parse($(props.sui.pages.reldiv).html())
        console.log("relateds div parsed ", relateds);
        return <div className={"relatedsviewer"} >{ relateds }</div>

}