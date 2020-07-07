import React, {useRef} from "react";
import * as PropTypes from "prop-types";
import _ from "lodash";

export function BasicSearch(props) {
    const inputEl = useRef(null);
    const currText="";
    // const [state, setState] = useState({searchString: {currText}});
    const clearInput = () => {
        inputEl.current.value = "";
        props.onSubmit(inputEl.current.value);
    };
    const handleSubmit = () => {
        props.onSubmit(inputEl.current.value);
    }
    const handleChange =
        // To be used for completions if desired
        _.debounce(() => {
            console.log("handleChange: ",inputEl.current.value);
        }, 300)

    const handleKey = (x) => {
        // submit on return
        if (x.keyCode === 13) {
            handleSubmit();
        }
    }
    return <>
        <div className='sui-search1'>
            <input type='text' id='sui-search' className='sui-search2'
                   defaultValue={currText}
                   placeholder='Enter Search'
                   onChange={handleChange}
                   onKeyDownCapture={handleKey}
                   ref={inputEl}/>
            <div id='sui-clear' className='sui-search3' onClick={clearInput}>&#xe610;</div>
        </div>
        <div id='sui-searchgo' className='sui-search4' onClick={handleSubmit}>&#xe623;</div>
    </>

}

BasicSearch.propTypes = {onChange: PropTypes.func};