//@ts-check

import * as Api from "./api.js"
import * as Tsd from "./tsd-generator.js"
import * as ApiFormatter from "./cmd-api-formatter.js"

export function getDoc ()
{
    return (
        Api.DOC +
        ApiFormatter.DOC +
        Tsd.DOC
    )
}