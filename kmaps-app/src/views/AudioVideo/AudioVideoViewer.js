import React, { useEffect, useState } from 'react';
import useStatus from '../../hooks/useStatus';
import axios from 'axios';
import jsonpAdapter from '../../logic/axios-jsonp';
import { Tabs, Tab } from 'react-bootstrap';
import './AVViewer.css';
import $ from 'jquery';
import { FeatureDeck } from '../common/FeatureDeck';
import { convertNodeToElement } from 'react-html-parser';
import { HtmlWithPopovers, HtmlCustom } from '../common/MandalaMarkup';
import { createAssetCrumbs } from '../common/utils';

/**
 * AudioVideoViewer is called from ContentMain.js and is wrapped in a MdlAssetContext that supplies it with a SOLR
 * record for the AV asset being viewed. It creates a single div#av-viewer inside of the #u-wrapContent__searchResults div
 *
 * The AudioVideoViewer has two children representing the two rows of the Bootstrap container:
 *      1. AudioVideoPlayer: This component defined below displays the video play and transcript in a single row,
 *      2. AudioVideoMeta: This component also defined below displays a row with the tabbed metadata information for the video.
 *
 * The AudioVideoMeta displays two tabs: an info tab with the fields labels and information and a related AV assets tab
 * which has a gallery of related AV assets.
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 * @author ndg8f
 */
export function AudioVideoViewer(props) {
    const id = props.id;
    const kmasset = props.mdlasset;
    const nodejson = props.nodejson;
    const sui = props.sui;
    const ismain = props.ismain ? props.ismain : false; // set to true when the av viewer is the main component on the page

    const [playerDrawn, setPlayerDrawn] = useState(false);
    const status = useStatus();

    // Do Status Stuff (Title and Breadcrumbs)

    // TODO: is this necessary? Are there situations where it's better to hide the extra content? Need to hide if there is no extra content.
    useEffect(() => {
        if (ismain) {
            status.clear();
            status.setType('audio-video');
            $('body').on('click', 'a.sui-avMore2', function () {
                $('#sui-avlang').toggle();
                this.text =
                    this.text == 'SHOW MORE' ? 'SHOW LESS' : 'SHOW MORE';
            });
            $('#l-site__wrap').addClass('av');
        }
    }, []);

    // Effect to Draw AV player once kmasset and nodejson return
    useEffect(() => {
        if (kmasset) {
            status.setType('audio-video');
            // Set the Title
            const mytitle =
                kmasset.title && kmasset.title.length > 0
                    ? kmasset.title[0]
                    : '';
            status.setHeaderTitle(mytitle);

            // Set the Breadcrumbs (Not needed here while SUI is still setting breadcurmbs )
            const bcrumbs = createAssetCrumbs(kmasset);
            status.setPath(bcrumbs);
            if (nodejson) {
                // Should only redraw if kmasset and nodejson change but redrawns on some clicks
                // So created a state variable playerDrawn so it doesn't redraw the player
                if (!playerDrawn) {
                    sui.av.DrawPlayer(kmasset, nodejson);
                    window.sui = sui;
                    setPlayerDrawn(true);
                }
            }
        }
    }, [kmasset, nodejson]); // Depend on kmasset and nodejson

    // Return the av-viewer div with div for Bill's drawing of AV player and AV metadata
    return (
        <div id={'av-viewer'}>
            <div id={'sui-av'}>Loading ...</div>
            <AudioVideoMeta id={id} asset={kmasset} sui={sui} node={nodejson} />
        </div>
    );
}

/**
 * A component to show two bootstrap tabs for "Details" and "Related". The Details tab is populated by Bill's code audiovideo.js
 * A need function, DrawMetaNew has been added to that code that takes and element ID and draws the combined meta data
 * in that element. Previously Bill had different tabs for different types of metadata, but with the addition of the
 * related tab, these were combined into "Details" as on the Drupal site.
 *
 * The Related tab is populated by an ajax (axios) call to the environment's Drupal Audio Video site, an endpoint for a gallery
 * of thumbnails using a "more like this" solr search in AV's custom solr index. The url is {base}/services/mlt/{nid}.
 * The API has been updated to return json when the parameter 'wt=json' is added. This returns a list of thumbnail divs
 * in HTML markup. Each of these is processed with the AudioVideoMltTile component below
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function AudioVideoMeta(props) {
    const kmasset = props.asset;
    const node = props.node;
    const sui = props.sui;
    const metamarkup =
        kmasset && node ? sui.av.DrawMetaNew(kmasset, node) : 'Loading ...';
    const [tabkey, setTabkey] = useState('details');
    useEffect(() => {
        $('.c-columnContent__main').scrollTop(0); // on smaller screens need to scroll down to get to related av items so when clicked scroll to top of div
        setTabkey('details'); // Select and show the details tab when a new item is shown
    }, [kmasset]);
    return (
        <div id="av-meta-row">
            <Tabs
                id="av-meta-tabs"
                activeKey={tabkey}
                onSelect={(k) => setTabkey(k)}
            >
                <Tab eventKey="details" title="DETAILS ">
                    <div id={'meta-details'}>
                        <HtmlWithPopovers markup={metamarkup} />
                    </div>
                </Tab>
                <Tab eventKey="related" title="RELATED ">
                    <AudioVideoRelated asset={kmasset} node={node} />
                </Tab>
            </Tabs>
        </div>
    );
}

/**
 * Component to populate the AV Related tab below the video and transcript. Calls the API to get the list from Drupal
 * Then iterates through it creating a AudioVideoMltTile component for each.
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function AudioVideoRelated(props) {
    const kmasset = props.asset;
    const node = props.node;
    const id =
        node && node.nid ? node.nid : kmasset && kmasset.id ? kmasset.id : '';
    const [mlt, setMlt] = useState([]);
    const url =
        process.env.REACT_APP_DRUPAL_AUDIO_VIDEO +
        '/services/mlt/' +
        id +
        '?wt=json';
    // Effect uses Axios to call the API url above to get the More Like This list
    useEffect(() => {
        axios({
            url: url,
            adapter: jsonpAdapter,
        })
            .then(function (response) {
                setMlt(response.data);
            })
            .catch(function (error) {
                setMlt([]);
            });
    }, [id]);
    return (
        <div id={'meta-mlt'}>
            <FeatureDeck
                docs={mlt}
                title={'Related AV Assets'}
                inline={false}
            />
        </div>
    );
}
