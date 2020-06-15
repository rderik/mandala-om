import {Link} from "react-router-dom";
import React from "react";

export function TopBar() {
    const topBar = <div className={'sui-topBar'}>
        <Link to={'/home'}>
            <img src={'/mandala-om/img/bhutanleft.gif'} style={{cursor: 'pointer'}} alt={'Home Page'} />
        </Link>
    </div>
    return topBar;
}