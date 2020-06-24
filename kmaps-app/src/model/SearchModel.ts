import {Action, action, Computed, computed, thunk, Thunk, ThunkOn, thunkOn} from 'easy-peasy';
import {search} from '../logic/searchapi';
import {StoreModel} from "./StoreModel";

interface Results {
    numFound: number | number;
    docs: string[];
    facets: string[];
}

interface Query {
    searchText: string;
    filters: Filter[];
    facetConfigs: FacetConfig[];
}

interface Page {
    current: number;
    start: number;
    rows: number;
    maxStart: number;
}

export interface SearchModel {
    loadingState: boolean,
    results: Results,
    query: Query,
    page: Page

    // PAGING ACTIONS
    gotoPage: Action<SearchModel, number>
    nextPage: Action<SearchModel, number>
    prevPage: Action<SearchModel, number>
    firstPage: Action<SearchModel, number>
    lastPage: Action<SearchModel, number>
    setPageSize: Action<SearchModel, number>

    // QUERY ACTIONS
    setSearchText: Action<SearchModel, string>
    update: Thunk<SearchModel,
        void,
        any,
        StoreModel,
        any>
    receiveResults: Action<SearchModel, Results>
    addFilters: Action<SearchModel, Filter[]>
    removeFilters: Action<SearchModel, Filter[]>

    // can clearFilters of a certain type
    clearFilters: Action<SearchModel, string>

    onUpdate: ThunkOn<SearchModel, StoreModel>
}

enum AssetType {
    Places = "places",
    Subjects = "subjects",
    Terms = "terms",
    AudioVideo = "audio-video",
    Images = "images",
    Visuals = "visuals",
    Sources = "sources"
}

enum Oper {
    Not = "NOT",
    And = "AND",
    Or = "OR"
}

interface Filter {
    id: string;
    label: string;
    asset_type?: AssetType;
    operator: Oper;
    field: string;
    match: string;
}

interface FacetConfig {
    id: string;
    jsonFacet: string;
}

export const searchModel: SearchModel = {
    loadingState: false,
    results: {
        numFound: 0,
        docs: [],
        facets: []
    },
    query: {
        searchText: "",
        filters: [
            {
                id: "places",
                label: "Places",
                operator: Oper.Or,
                field: "asset_type",
                match: AssetType.Places,
            }
        ],
        facetConfigs: [],
    },
    page: {
        current: 0,
        start: 0,
        rows: 10,
        maxStart: 219
    },
    gotoPage: action((state, pageNum) => {
        if (pageNum * state.page.rows > state.page.maxStart) {
            pageNum = Math.floor(state.page.maxStart / state.page.rows)
        } else if (pageNum < 0) {
            pageNum = 0;
        }

        console.error("gotoPage() pageNum = ", pageNum);

        state.page.start = state.page.rows * pageNum
        state.page.current = pageNum;
    }),
    nextPage: action((state, increment) => {
        increment |=1;
        console.log("SearchModel: pager.nextPage() ", increment);
        console.log("SearchModel: state.page ", state.page);

        let oldPage = state.page.current;
        let newStart = state.page.start + increment * state.page.rows;
        if (newStart > state.page.maxStart) {
            newStart = state.page.rows * Math.floor(state.page.maxStart / state.page.rows)
        }

        console.log("SearchModel: newStart ", newStart);
        state.page.start = newStart;
        state.page.current = Math.floor(newStart / state.page.rows);
    }),
    prevPage: action((state, decrement) => {
        decrement |=1;
        console.log("SearchModel: pager.prevPage() ", decrement);
        console.log("SearchModel: state.page ", state.page);

        let newStart = state.page.start - decrement * state.page.rows;
        if (newStart < 0) {
            newStart = 0
        }
        console.log("SearchModel: newStart ", newStart);
        state.page.start = newStart;
        state.page.current = Math.floor((newStart + 1) / state.page.rows);
    }),
    lastPage: action((state) => {
        state.page.start = state.page.rows * Math.floor(state.page.maxStart / state.page.rows);
        state.page.current = Math.floor(state.page.maxStart / state.page.rows);
    }),
    firstPage: action((state) => {
        state.page.start = 0;
        state.page.current = 0;
    }),

    setPageSize: action((state, pageSize) => {
        if (pageSize < 1) {
            pageSize = 1
        }
        state.page.rows = pageSize;
    }),

    update: thunk(async (actions, payload, helpers) => {
        const searchState = helpers.getStoreState().search

        searchState.loadingState=true;
        console.log("SEARCH START: ", searchState.page.current);
        const results = await search(searchState);
        console.log("SEARCH DONE: ", searchState.page.current);
        searchState.loadingState=false;

        actions.receiveResults(results)
    }),

    receiveResults: action((state, results) => {
        console.log("SEARCH Receive RESULTS: ", results);

        // Is it as simple as that?
        if (state.page.maxStart !== results.numFound) {
            state.page.maxStart = results.numFound;
        }

        if (state.results !== results) {
            state.results = results;
        }
    }),
    setSearchText: action((state, payload) => {

        // console.log(" ACTION TIME: setSearchText() payload = ", payload);

        // TODO: ,ight need to insert sanity checks here.
        state.query.searchText = payload;

    }),

    addFilters: action((state, payload) => {
    }),
    removeFilters: action((state, payload) => {
    }),
    clearFilters: action((state, payload) => {
    }),

    // LISTENERS
    onUpdate: thunkOn(
        // targetResolver:
        (actions, storeActions) => [
            actions.setPageSize,
            actions.nextPage,
            actions.prevPage,
            actions.gotoPage,
            actions.lastPage,
            actions.firstPage,
            actions.removeFilters,
            actions.clearFilters,
            actions.addFilters,
            actions.setSearchText
        ],
        // handler:
        async (actions, target) => {
            actions.update();
        }
    )
}


