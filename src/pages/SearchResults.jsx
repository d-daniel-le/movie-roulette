import { useSearchParams } from "react-router-dom";

function SearchResults (){

    const [queryParameters] = useSearchParams()
    const query = queryParameters.get("q")

    return (
        <div>
            <h1>This is the search results</h1>
        </div>
    )
}

export default SearchResults;