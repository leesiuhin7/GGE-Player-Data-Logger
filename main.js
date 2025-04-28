let playerData = null
fetchData("https://raw.githubusercontent.com/leesiuhin7/GGE-Player-Data-Logger/refs/heads/data/data.json")

let displayedResults = []


function updateResults(results) {
    const table = document.getElementById("result-table")
    displayedResults = results

    while (table.rows.length > 1) {
        table.deleteRow(1)
    }

    let i = 0
    const colours = [
        "#404040",
        "#606060"
    ]
    for (row of results) {
        let newRow = table.insertRow()
        newRow.style.backgroundColor = colours[i % colours.length]

        newRow.insertCell(0).textContent = row[0]
        newRow.insertCell(1).textContent = formatDate(row[1])
        newRow.insertCell(2).textContent = row[2]
        newRow.insertCell(3).textContent = row[3]

        i += 1
    }
}


function unpackData(data) {
    const result = Object.entries(data["player data"])
        .flatMap(([key, rows]) => 
            rows.map(([t, n, an]) => [key, t, n, an])
        )
    return result
}

function fetchData(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => unpackData(data))
        .then(unpacked => {
            playerData = unpacked
        })
        .catch(error => console.error("Error while fetching:", error))
}

function formatDate(timestamp) {
    const date = new Date(timestamp * 1000) // seconds (timestamp) -> ms

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, '0')

    const hours = String(date.getHours()).padStart(2, '0')
    const mins = String(date.getMinutes()).padStart(2, '0')
    const secs = String(date.getSeconds()).padStart(2, '0')

    const offsetMinutes = -date.getTimezoneOffset()
    const sign = offsetMinutes >= 0 ? "+" : "-"
    const absOffset = Math.abs(offsetMinutes)
    const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, "0")
    const offsetMins = String(absOffset % 60).padStart(2, "0")
    const gmt = `GMT${sign}${offsetHours}:${offsetMins}`

    return `${year}-${month}-${day} ${hours}:${mins}:${secs} (${gmt})`
}

function localtimeToUTC(localtime) {
    return new Date(
        Number(localtime) + localtime.getTimezoneOffset() * 60000
    )
}

function applyFilters() {
    const OIDCheckbox = document.getElementById("OID-filter-enable")
    const timeCheckbox = document.getElementById("time-filter-enable")
    const nameCheckbox = document.getElementById("name-filter-enable")
    const ANCheckbox = document.getElementById("AN-filter-enable")

    const filterFuncs = []
    if (OIDCheckbox.checked) {
        const OIDFilterValue = document.getElementById("OID-filter").value
        filterFuncs[0] = (OID) => OID === OIDFilterValue
    }
    if (timeCheckbox.checked) {
        const fromDateInput = document.getElementById("time-filter-from")
        const toDateInput = document.getElementById("time-filter-to")
        const fromTime = fromDateInput.valueAsDate
        const toTime = toDateInput.valueAsDate
        
        let fromTimeFunc = (t) => true
        let toTimeFunc = (t) => true
        if (fromTime !== null) {
            const fromTimeUTC = localtimeToUTC(fromDateInput.valueAsDate) / 1000
            fromTimeFunc = (t) => fromTimeUTC <= t
        }
        if (toTime !== null) {
            const toTimeUTC = localtimeToUTC(toDateInput.valueAsDate) / 1000
            toTimeFunc = (t) => t < toTimeUTC
        }
        filterFuncs[1] = (t) => fromTimeFunc(t) && toTimeFunc(t)
    }
    if (nameCheckbox.checked) {
        const nameFilterValue = document.getElementById("name-filter").value
        filterFuncs[2] = (n) => nameFilterValue.localeCompare(n, undefined, { sensitivity: "base" }) === 0
    }
    if (ANCheckbox.checked) {
        const ANFilterValue = document.getElementById("AN-filter").value
        filterFuncs[3] = (an) => ANFilterValue.localeCompare(an, undefined, { sensitivity: "base" }) === 0
    }

    const result = filterData(playerData, filterFuncs)
    updateResults(result)
}

function applySorting() {
    const OIDSelectedRadio = document.querySelector(
        'input[name="OID-sort-priority"]:checked'
    )
    const timeSelectedRadio = document.querySelector(
        'input[name="time-sort-priority"]:checked'
    )
    const nameSelectedRadio = document.querySelector(
        'input[name="name-sort-priority"]:checked'
    )
    const ANSelectedRadio = document.querySelector(
        'input[name="AN-sort-priority"]:checked'
    )
    const checkboxes = [
        document.getElementById("OID-sort-reverse"),
        document.getElementById("time-sort-reverse"),
        document.getElementById("name-sort-reverse"),
        document.getElementById("AN-sort-reverse")
    ]

    const priority = [3, 3, 3, 3]
    const reverseFlags = []

    if (OIDSelectedRadio) {
        priority[0] = parseInt(OIDSelectedRadio.value)
    }
    if (timeSelectedRadio) {
        priority[1] = parseInt(timeSelectedRadio.value)
    }
    if (nameSelectedRadio) {
        priority[2] = parseInt(nameSelectedRadio.value)
    }
    if (ANSelectedRadio) {
        priority[3] = parseInt(ANSelectedRadio.value)
    }

    const priorityOrder = argsort(priority)

    for (let i = 0; i < 4; i++) {
        reverseFlags[i] = checkboxes[priorityOrder[i]].checked
    }
    
    const result = sortData(
        displayedResults, priorityOrder, reverseFlags
    )
    updateResults(result)
}

function argsort(arr) {
    return arr
        .map((value, index) => ({ value, index }))
        .sort((a, b) => a.value - b.value)
        .map(pair => pair.index)
}