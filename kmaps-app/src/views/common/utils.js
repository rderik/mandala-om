import _ from 'lodash';
import $ from 'jquery';
import { BsCheckCircle, BsMap, ImStack } from 'react-icons/all';
import React from 'react';
import { Link } from 'react-router-dom';

export function buildNestedDocs(docs, child_type, path_field) {
    path_field = path_field ? path_field : child_type + '_path_s';

    const base = {};
    docs = _.filter(docs, (x) => {
        return x.block_child_type === child_type;
    });

    // console.log("buildNestedDocs: ", docs)

    _.forEach(docs, (doc, i) => {
        // console.log("buildNestedDocs: i=" +i);
        // console.log("buildNestedDocs: pathField = " + path_field);
        const path = doc[path_field].split('/');
        // console.log("buildNestedDocs path = " + path);
        doc.order = i;
        // console.log("buildNestedDocs path.length == " + path.length);
        if (path.length === 1) {
            // this is a "root doc", push it on the base list
            base[path[0]] = doc;
        } else {
            // this is a "nested doc"
            // this is a "nested doc"

            // check for each "ancestor"
            // create  "fake ancestor", if it doesn't exist
            // add the doc to its parent in _nestedDoc_ field
            //      created _nestedDoc_ field if it doesn't exist
            //      if it already exists (it might have been faked earlier), populate fields
            // console.log("buildNestedDocs: nested path = ", path);
            var curr = base;
            for (let i = 0; i < path.length; i++) {
                // console.log("buildNestedDocs segment: " + path.slice(0, i + 1).join("/"));
                if (!curr[path[i]]) {
                    curr[path[i]] = {};
                }
                if (i === path.length - 1) {
                    curr[path[i]] = doc;
                }
                if (!curr[path[i]]._nested_) {
                    curr[path[i]]._nested_ = {};
                }
                curr = curr[path[i]]._nested_;
            }
        }
    });
    // console.log("buildNestedDocs:", base);
    return base;
}

/**
 * Generic function to normalize links in document's html from Mandala APIs
 * This needs to be called from UseEffect once html has been inserted.
 * It is called from kmaps-app/src/context/MdlAssetContext.js
 */
export function normalizeLinks(asset_type) {
    if (typeof asset_type == 'undefined') {
        asset_type = 'mandala';
    }
    let aels = [];
    // Mandala Assets inserted in text that have the attribute "data-mandala-id"
    const mandala_items = document.querySelectorAll('[data-mandala-id]');
    _.forEach(mandala_items, function (el) {
        const mid = el.getAttribute('data-mandala-id');
        const new_url = '/mandala-om/' + mid.replace('-', '/');
        aels = el.getElementsByTagName('a');
        _.forEach(aels, function (ael) {
            ael.setAttribute('href', new_url);
            ael.setAttribute('target', '_self');
        });
    });

    // Update links to external sources so they are either internal or disabled (currently all disabled)
    aels = document.querySelectorAll('a');
    _.forEach(aels, function (el) {
        const href = el.getAttribute('href');
        if (href) {
            if (href.indexOf('shanti_texts/node_ajax_text') > -1) {
                return;
            } else if (href.indexOf('/content') === 0) {
                // All /content/... links are in the same app
                el.setAttribute('data-asset-type', asset_type);
                el.setAttribute('data-url', href);
                el.setAttribute('href', '#');
                el.removeAttribute('target');
                el.classList.add('extlink');
            } else if (href.indexOf('.shanti.virginia.edu') > -1) {
                // Links to .shanti.virginia.edu. Disable for now"
                el.setAttribute('data-url', href);
                el.removeAttribute('href');
                el.setAttribute('href', '#');
                el.removeAttribute('target');
                el.classList.add('extlink');
            }
        }
    });
}

/**
 *
 * @param sel
 */
export function addBoClass(sel) {
    const els =
        'h1, h2, h3, h4, h5, h6, h7, div, p, blockquote, li, span, label, th, td, a, b, strong, i, em, u, s, dd, dl, dt, figure';
    const repat = /[a-zA-Z0-9\,\.\:\;\-\s]/g; // the regex patter to strip latin and other characters from string

    const ellist =
        typeof sel === 'undefined' || sel === 'all' ? $(els) : $(sel).find(els);

    // Iterate through such elements
    ellist.each(function () {
        //var etxt = $.trim($(this).text());  // get the text of the element
        var etxt = $(this).clone().children().remove().end().text(); // See https://stackoverflow.com/a/8851526/2911874
        etxt = etxt.replace(repat, ''); // strip of irrelevant characters
        var cc1 = etxt.charCodeAt(0); // get the first character code
        // If it is within the Tibetan Unicode Range
        if (cc1 > 3839 && cc1 < 4096) {
            // If it does not already have .bo
            if (!$(this).hasClass('bo') && !$(this).parents().hasClass('bo')) {
                $(this).addClass('bo'); // Add .bo
            }
        }
    });
}

export function grokId(id) {
    const [nid] = id.match(/(\d+)$/);
    return nid;
}

export function fitDimensions(maxHeight, maxWidth, imgHeight, imgWidth) {
    const targetProportions = maxHeight / maxWidth;
    const imageProportions = imgHeight / imgWidth;
    let targetHeight = 0;
    let targetWidth = 0;
    if (targetProportions < imageProportions) {
        // height constrained
        targetHeight = maxHeight;
        targetWidth = Math.floor(imgWidth * (maxHeight / imgHeight));
    } else {
        // width constrained
        targetWidth = maxWidth;
        targetHeight = Math.floor(imgHeight * (maxWidth / imgWidth));
    }
    return { height: targetHeight, width: targetWidth };
}

export function selectIcon(type) {
    const ICON_MAP = {
        'audio-video': (
            <span className={'facetItem icon u-icon__audio-video'} />
        ),
        texts: <span className={'facetItem icon u-icon__texts'} />,
        'texts:pages': <span className={'facetItem icon u-icon__texts'} />,
        images: <span className={'facetItem icon u-icon__images'} />,
        sources: <span className={'facetItem icon u-icon__sources'} />,
        visuals: <span className={'facetItem icon u-icon__visuals'} />,
        places: <span className={'facetItem icon u-icon__places'} />,
        subjects: <span className={'facetItem icon u-icon__subjects'} />,
        terms: <span className={'facetItem icon u-icon__terms'} />,
        collections: (
            <span className={'facetItem'}>
                <ImStack />
            </span>
        ),
        asset_type: (
            <span className={'facetItem'}>
                <BsCheckCircle />
            </span>
        ),
        users: <span className={'facetItem icon u-icon__community'} />,
        creator: <span className={'facetItem icon u-icon__agents'} />,
        languages: <span className={'facetItem icon u-icon__comments-o'} />,
        feature_types: (
            <span className={'facetItem'}>
                <BsMap />
            </span>
        ),
        associated_subjects: (
            <span className={'facetItem icon u-icon__essays'} />
        ),
        perspective: <span className={'facetItem icon u-icon__file-picture'} />,
        search: <span className={'facetItem icon u-icon__search'} />,
    };

    return ICON_MAP[type];
}

export function createAssetCrumbs(kmasset) {
    const asset_type = kmasset.asset_type;
    let bcrumbs = [
        {
            uid: '/' + asset_type,
            name: capitalAsset(asset_type),
        },
    ];
    if (
        kmasset.collection_title_path_ss &&
        kmasset.collection_title_path_ss.length > 0
    ) {
        for (
            var bcn = 0;
            bcn < kmasset.collection_title_path_ss.length;
            bcn++
        ) {
            const colltitle = kmasset.collection_title_path_ss[bcn];
            const collnid = kmasset.collection_nid_path_is[bcn];
            const colluid = `/${asset_type}/collection/${collnid}`;
            bcrumbs.push({
                uid: colluid,
                name: colltitle,
            });
        }
        const mytitle =
            kmasset.title && kmasset.title.length > 0
                ? kmasset.title[0]
                : kmasset.caption;
        let selfbc = {
            uid: '#',
            name: mytitle,
        };
        bcrumbs.push(selfbc);
    }
    return bcrumbs;
}

export function capitalAsset(asn) {
    return asn[0].toUpperCase() + asn.substr(1).replace('-v', '-V');
}
