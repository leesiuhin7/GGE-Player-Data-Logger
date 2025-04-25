function filterData(data, filterFuncs) {
    return data.filter(([OID, t, n, an]) => {
        const match1 = filterFuncs[0] === undefined ? true : filterFuncs[0](OID)
        const match2 = filterFuncs[1] === undefined ? true : filterFuncs[1](t)
        const match3 = filterFuncs[2] === undefined ? true : filterFuncs[2](n)
        const match4 = filterFuncs[3] === undefined ? true : filterFuncs[3](an)
        return match1 && match2 && match3 && match4
    })
}

function sortData(data, weightOrder, reverseFlags) {
    const copy = [...data]
    return copy.sort((a, b) => {
        for (let i = 0; i < weightOrder.length; i++) {
            const index = weightOrder[i]
            if (index === 0 || index === 1) {
                const comparison = a[index] - b[index]
                if (comparison !== 0) { return reverseFlags[i] ? -comparison : comparison }
            } else if (index === 2 || index === 3) {
                const comparison = a[index].localeCompare(b[index])
                if (comparison !== 0) { return reverseFlags[i] ? -comparison : comparison }
            }
        }
        return 0
    })
}