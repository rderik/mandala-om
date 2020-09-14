import { Col, Row } from 'react-bootstrap';
import { CollectionField, KmapsFields } from '../common/utilcomponents';
import { HtmlCustom } from '../common/MandalaMarkup';
import React, { useState } from 'react';

const IMAGE_FIELDS = [
    'field_image_digital|Only Digital|info',
    'field_image_color|Color|info',
    'field_image_quality|Quality|info',
    'field_image_rotation|Rotation|info',
    'field_physical_size|Physical Size|arrows',
    'field_image_capture_device|Capture Device|camera',
    'field_image_materials|Materials|th',
    'field_image_enhancement|Enhancement|plus-square-o',
    'location_constructed|Location|places',
    'copyright_statement|Copyright|copyright',
    'field_license_url|License|info',
    'field_aperture|Aperture|info',
    'field_exposure_bias|Exposure Bias|info',
    'field_flash_settings|Flash Settings|info',
    'field_focal_length|Focal Length|info',
    'field_iso_speed_rating|ISO Speed|info',
    'field_lens|lens|info',
    'field_light_source|Light Source|info',
    'field_metering_mode|Metering Mode|info',
    'field_noise_reduction|Noise Reduction|info',
    'field_organization_name|Organization|info',
    'field_original_filename|Original File Name|info',
    'field_project_name|Project|info',
    'field_sensing_method|Sensing Method|info',
    'field_sponsor_name|Sponsor|info',
    'field_spot_feature|Spot Feature|info',
];

export function ImageMetadata(props) {
    const solrdoc = props.solrdoc;
    const nodejson = props.nodejson;
    const sizestr = props.sizestr ? props.sizestr : '';
    const titles = nodejson?.field_image_descriptions?.und?.map((item, n) => {
        return (
            <>
                {item.title}
                <br />
            </>
        );
    });

    const [photographer, setPhotographer] = useState('');

    if (nodejson) {
        nodejson['copyright_statement'] = constructCopyright(nodejson);
        nodejson['location_constructed'] = constructLocation(nodejson);
    }
    const imgsize = '9x10';
    const imgdescs = nodejson?.field_image_descriptions?.und
        ? nodejson.field_image_descriptions.und
        : [];
    return (
        <>
            <Row className={'l-top'}>
                <Col className={'l-first'}>
                    <h5 className={'c-image__colhead'}>Mandala Collections</h5>
                    <div>
                        <CollectionField solrdoc={solrdoc} />
                    </div>
                </Col>
                <Col>
                    <h5 className={'c-image__colhead'}>Classifications</h5>
                    <div className={'c-kmaps-list'}>
                        <KmapsFields nodejson={nodejson} />
                    </div>
                </Col>
            </Row>
            <Row className={'l-meta'}>
                <Col className={'l-first'}>
                    {/* <h5 className={'c-image__metatitle'}>{titles}</h5> */}
                    <ImageRow
                        cls={'c-image__caprow'}
                        icon={'images'}
                        label={'Caption'}
                        value={titles}
                    />

                    <hr />
                    <ImageCreators
                        json={nodejson?.field_image_agents}
                        setMain={setPhotographer}
                    />
                    <ImageRow
                        cls={'u-data'}
                        icon={'agents'}
                        label={'Uploader'}
                        value={solrdoc.node_user_full_s}
                        date={processDate(nodejson.created, 'ts')}
                    />
                    <ImageRow
                        cls={'u-data'}
                        icon={'square-o'}
                        label={'Type'}
                        value={nodejson?.field_image_type?.und[0].value}
                        valclass={'text-capitalize'}
                    />
                    <ImageRow
                        cls={'u-data'}
                        icon={'arrows'}
                        label={'size'}
                        value={sizestr}
                    />
                    <hr />
                    {imgdescs.map((desc, dn) => {
                        return (
                            <ImageDescription
                                data={imgdescs[dn]}
                                defaultauth={photographer}
                            />
                        );
                    })}
                </Col>
                <Col className={'l-second'}>
                    {IMAGE_FIELDS.map((fdstr, i) => {
                        let pts = fdstr.split('|');
                        if (pts.length < 3) {
                            do {
                                pts.push('');
                            } while (pts.length < 3);
                        }
                        return (
                            <ImageInfoField
                                fieldName={pts[0]}
                                label={pts[1]}
                                icon={pts[2]}
                                nodejson={nodejson}
                            />
                        );
                    })}
                </Col>
            </Row>
        </>
    );
}

function constructCopyright(node) {
    let holder = false;
    let stmt = false;
    let crdate = false;
    let crstring = '';
    if (node) {
        if (
            node.field_copyright_holder.und &&
            node.field_copyright_holder.und.length > 0
        ) {
            holder = node.field_copyright_holder.und[0].value;
        }
        if (
            node.field_copyright_statement.und &&
            node.field_copyright_statement.und.length > 0
        ) {
            stmt = node?.field_copyright_statement?.und[0].value;
        }
        if (
            node.field_copyright_date.und &&
            node.field_copyright_date.und.length > 0
        ) {
            crdate = new Date(node?.field_copyright_date?.und[0].value);
            crdate = crdate.getFullYear();
        }
        if (crdate && crdate.toString().length > 0) {
            crdate = crdate + '. ';
        }
        if (holder && holder.length > 0) {
            holder = holder + ',  ';
        }
        if (stmt) {
            crstring = holder + crdate + '|' + stmt;
        }
    }
    return {
        und: [{ value: crstring }],
    };
}

function constructLocation(node) {
    let long = node?.field_longitude?.und
        ? node?.field_longitude?.und[0].value
        : false;
    let lat = node?.field_latitude?.und
        ? node?.field_latitude?.und[0].value
        : false;
    let alt = node?.field_altitude?.und
        ? node?.field_altitude?.und[0].value
        : false;
    let location = false;
    if (node && lat && long) {
        if (!long || !lat || !alt) {
            return {
                und: [],
            };
        }
        if (!isNaN(long * 1)) {
            if (long > 0) {
                long = '+' + long;
            } else {
                long = '-' + long;
            }
        }

        if (!isNaN(lat)) {
            if (lat > 0) {
                lat = '+' + lat;
            } else {
                lat = '-' + lat;
            }
        }
        if (!isNaN(alt)) {
            if (alt > 0) {
                alt = '+' + alt;
            } else {
                alt = '-' + alt;
            }
        }
        location = long + ' ' + lat + ' ' + alt;
    }
    return {
        und: [{ value: location }],
    };
}

function ImageRow(props) {
    const myclass = props.cls ? props.cls : '';
    const icon = props.icon ? props.icon : 'info';
    const label = props.label ? props.label : '';
    const labclass = props.labclass ? ' ' + props.labclass : '';
    const value = props.value ? props.value : '';
    const valclass = props.valclass ? ' ' + props.valclass : '';
    const mydate = props.date ? ' (' + props.date + ')' : '';
    return (
        <Row className={myclass}>
            <Col>
                <span className={'u-icon__' + icon} />{' '}
                <span className={'u-label' + labclass}>{label}</span>{' '}
            </Col>
            <Col className={'u-value' + valclass}>
                {value}
                {mydate}
            </Col>
        </Row>
    );
}

function processDate(dstr, dtype) {
    if (!dstr || dstr === '') {
        return null;
    }
    let mydate = new Date(dstr);
    if (dtype && dtype === 'ts') {
        mydate = new Date(dstr * 1000);
    }
    return mydate.toLocaleString().split(',')[0];
}

function ImageCreators(props) {
    const data = props?.json;
    if (
        !data ||
        typeof data === 'undefined' ||
        !data.und ||
        data.und.length === 0
    ) {
        return (
            <ImageRow
                cls={'u-data'}
                icon={'agents'}
                label={'Creator'}
                value={'Unknown'}
            />
        );
    }
    return (
        <>
            {data.und.map((item, n) => {
                const mydate =
                    item?.field_agent_dates?.und &&
                    item.field_agent_dates.und.length > 0
                        ? processDate(item.field_agent_dates.und[0].value)
                        : '';
                if (
                    item.field_agent_role.und[0].value.toLocaleLowerCase() ===
                    'photographer'
                ) {
                    props.setMain(item.title);
                }
                return (
                    <ImageRow
                        cls={'u-data'}
                        icon={'agents'}
                        label={item.field_agent_role.und[0].value.toUpperCase()}
                        value={item.title}
                        date={mydate}
                    />
                );
            })}
        </>
    );
}

function ImageDescription(props) {
    const desc = props.data;
    const defaultauth = props.defaultauth;
    const descdate = processDate(desc.created, 'ts');
    const author =
        desc?.field_author?.und && desc.field_author.und.length > 0
            ? desc.field_author.und[0].value
            : defaultauth;
    const clsstr = author === '' ? 'byline noauthor' : 'byline';
    return (
        <div className={'o-desc'}>
            <h5 className={'o-desc__title'}>{desc.title}</h5>
            <p className={'o-desc__' + clsstr}>
                {author} ({descdate})
            </p>
            <HtmlCustom markup={desc.field_description.und[0].value} />
        </div>
    );
}

function ImageInfoField(props) {
    const node = props.nodejson;
    const field_name = props.fieldName;
    const icon = props.icon;
    const label = props.label;
    if (!node[field_name]?.und) {
        return null;
    }
    let value = node[field_name]?.und[0].value;
    if (field_name === 'location_constructed' && !value) {
        return null;
    }
    if (value.substr(0, 4) === 'http') {
        value = (
            <a href={value} target={'_blank'}>
                {value}
            </a>
        );
    }
    if (field_name === 'field_image_digital') {
        value = value === '0' ? 'No' : 'Yes';
    }
    if (field_name === 'field_image_rotation') {
        value += '°';
    }
    let rowclass = 'u-data';
    // Special return for copyright statement to put person and date above with full-column-width description below
    if (field_name === 'copyright_statement') {
        let valpts = value.split('|');
        if (valpts[0] === '') {
            return null;
        }
        while (valpts.length < 2) {
            valpts.push('');
        }
        return (
            <>
                <Row className={'o-desc'}>
                    <Col>
                        <span className={'u-icon__' + icon} />{' '}
                        <span className={'u-label'}>{label}</span>{' '}
                    </Col>
                    <Col className={'u-value'}>{valpts[0]}</Col>
                </Row>
                <Row className={'o-desc'}>
                    <Col>{valpts[1]}</Col>
                </Row>
            </>
        );
    }
    if (
        field_name === 'field_original_filename' ||
        field_name === 'field_license_url'
    ) {
        value = <span className={'t-overwrap-any'}>{value}</span>;
    }
    return (
        <ImageRow
            cls={rowclass}
            icon={icon}
            label={label.toUpperCase()}
            value={value}
        />
    );
}
