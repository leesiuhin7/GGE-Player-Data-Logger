const showFilter = () => {
    document.getElementById("filter-container").style.display = "block";
};
const removeFilter = () => {
    document.getElementById("filter-container").style.display = "none";
};

const showSorting = () => {
    document.getElementById("sorting-container").style.display = "block";
};
const removeSorting = () => {
    document.getElementById("sorting-container").style.display = "none";
};

// #region ***  Event Listeners - listenTo___            ***********
const listenToButton = () => {
    const arrButtons = document.querySelectorAll('.js-button');
    for (const button of arrButtons) {
        button.addEventListener('click', (e) => {
            if (e.currentTarget.dataset.what == 'filter') {
                e.currentTarget.classList.toggle('c-button__red');
                if (e.currentTarget.classList.contains('c-button__red')) {
                    showFilter();
                } else {
                    removeFilter();
                }
            } else if (e.currentTarget.dataset.what == 'Sort') {
                e.currentTarget.classList.toggle('c-button__red');
                if (e.currentTarget.classList.contains('c-button__red')) {
                    showSorting();
                } else {
                    removeSorting();
                }
            } else {
                console.debug('error');
            }
        });
    }
};
const listenToChecker = () => {
    const oidInput = document.getElementById('OID-filter');
    const oidCheck = document.getElementById('OID-filter-enable');
    oidInput.addEventListener('input', function () {
        oidCheck.checked = oidInput.value.trim() !== '';
    });
    const nameInput = document.getElementById('name-filter');
    const nameCheck = document.getElementById('name-filter-enable');
    nameInput.addEventListener('input', function () {
        nameCheck.checked = nameInput.value.trim() !== '';
    });
    const anInput = document.getElementById('AN-filter');
    const anCheck = document.getElementById('AN-filter-enable');
    anInput.addEventListener('input', function () {
        anCheck.checked = anInput.value.trim() !== '';
    });
    const timeFrom = document.getElementById('time-filter-from');
    const timeTo = document.getElementById('time-filter-to');
    const timeCheck = document.getElementById('time-filter-enable');
    function updateTimeCheck() {
        timeCheck.checked = timeFrom.value.trim() !== '' || timeTo.value.trim() !== '';
    }
    timeFrom.addEventListener('input', updateTimeCheck);
    timeTo.addEventListener('input', updateTimeCheck);
};
// #endregion

// #region ***  Init / DOMContentLoaded                  ***********
const init = () => {
    listenToButton();
    listenToChecker();
    removeSorting();
};

document.addEventListener('DOMContentLoaded', init);
// #endregion
