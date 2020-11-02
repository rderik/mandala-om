import { useSolr } from './useSolr';
const QUERY_BASE = 'kmassets';

const useAsset = (asset_type, nid) => {
    const querySpecs = {
        index: 'assets',
        params: {
            q: `asset_type:${asset_type} AND id:${nid}`,
            rows: 1,
        },
    };
    const query_key = QUERY_BASE + '-' + asset_type + '-' + nid;

    const resource = useSolr(query_key, querySpecs);
    // console.log('useAsset: querySpecs = ', querySpecs);
    // console.log('useAsset: returning resource = ', resource);
    return resource;
};

export default useAsset;