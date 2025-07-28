(function() {

    if (!localStorage.getItem('disable_advanced_search')) {
        function addAdvancedSearchLink() {
            let link = document.createElement("a");
            link.href = "/library/advancedsearch";
            link.target = "_blank";
            link.textContent = "Advanced Search";
            link.className = "multiellipsis my-2 flex h-[150px] overflow-hidden p-2 text-center text-lg focus:outline-none focus:ring focus:ring-gray-400 border-2 border-solid border-black bg-white text-black";
            link.setAttribute("q:link", "");
            link.setAttribute("data-prefetch", "");
            link.style.display = "inline-block";
            link.style.maxWidth = "200px";
            link.style.height = "auto";
            link.style.marginRight = "10px";

            let targetDiv = document.querySelector("body > div > main > div.flex.flex-1.flex-col > div.mx-auto.w-full.max-w-7xl > div.relative.my-2.flex.flex-col");
            if (targetDiv) {
                targetDiv.style.flexDirection = "row";
                targetDiv.style.alignItems = "center";
                let inputField = targetDiv.querySelector('input[id^="text-search-rs70xc-"]');
                if (inputField) {
                    inputField.style.flex = "1";
                    inputField.style.width = "auto";
                    targetDiv.insertBefore(link, inputField);
                }
                let searchIcon = targetDiv.querySelector("svg.feather.feather-search");
                if (searchIcon) {
                    searchIcon.remove();
                }
            }
        }

        function checkAndAddLink(mutations, observer) {
            let targetDiv = document.querySelector("body > div > main > div.flex.flex-1.flex-col > div.mx-auto.w-full.max-w-7xl > div.relative.my-2.flex.flex-col");
            if (targetDiv) {
                let advancedSearchExists = targetDiv.querySelector('a[href="/library/advancedsearch"]');
                if (!advancedSearchExists) {
                    addAdvancedSearchLink();
                    observer.disconnect();
                }
            }
        }

        function initObserver() {
            if (document.body) {
                const observer = new MutationObserver(checkAndAddLink);
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                checkAndAddLink(null, observer);
            } else {
                setTimeout(initObserver, 100);
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initObserver);
        } else {
            initObserver();
        }
    }

    if (!localStorage.getItem('disable_uecaps_parsing')) {
        function createFeaturesSection() {
            const targetElement = document.querySelector("body > div > main > div.flex.flex-1.flex-col > div.flex.flex-1.flex-col > div:nth-child(2)");
            if (targetElement && !document.getElementById('featuresSection')) {
                const featuresSection = document.createElement('div');
                featuresSection.id = 'featuresSection';
                featuresSection.className = 'mx-auto w-full max-w-7xl overflow-x-auto';
                featuresSection.innerHTML = `
                    <div class="w-full text-sm sm:w-fit sm:min-w-[32rem] sm:max-w-full md:min-w-[36rem]">
                        <details open="">
                            <div class="flex max-w-full flex-wrap justify-around gap-x-5 sm:justify-between">
                                <div class="min-w-full px-2 lg:min-w-52">
                                    <div class="flex flex-grow basis-0 flex-col">
                                        <button id="toggleRowVisibilityButton" type="button" class="my-2 w-full flex-grow bg-black p-2 text-lg text-white focus:outline-none focus:ring focus:ring-gray-400 disabled:bg-gray-300 disabled:text-gray-400 disabled:opacity-70" preventdefault:click="" data-state="all">Show unsupported</button>
                                    </div>
                                </div>
                            </div>
                            <summary class="mt-10 text-xl font-bold">Features</summary>
                            <table class="w-full table-auto border-collapse border border-gray-500 text-left">
                                <tbody id="featuresTableBody" class="whitespace-pre align-text-top"></tbody>
                            </table>
                        </details>
                    </div>
                `;
                targetElement.insertAdjacentElement('afterend', featuresSection);

                const toggleButton = document.getElementById('toggleRowVisibilityButton');
                toggleButton.addEventListener('click', toggleRowVisibility);
            }
        }

        function toggleRowVisibility() {
            const tableBody = document.getElementById('featuresTableBody');
            const button = document.getElementById('toggleRowVisibilityButton');

            if (tableBody && button) {
                const rows = tableBody.querySelectorAll("tr");
                const currentState = button.getAttribute("data-state");
                let newState;

                switch (currentState) {
                    case "all":
                        newState = "unsupported";
                        button.textContent = "Show supported";
                        break;
                    case "unsupported":
                        newState = "supported";
                        button.textContent = "Show all";
                        break;
                    case "supported":
                        newState = "all";
                        button.textContent = "Show unsupported";
                        break;
                }

                button.setAttribute("data-state", newState);

                rows.forEach(row => {
                    const cell = row.querySelector("td");
                    if (cell) {
                        const cellText = cell.textContent.trim();
                        if (cell.id.startsWith("custom-cell-")) {
                            switch (newState) {
                                case "all":
                                    row.style.display = "table-row";
                                    break;
                                case "unsupported":
                                    row.style.display = cellText.startsWith("❌") ? "table-row" : "none";
                                    break;
                                case "supported":
                                    row.style.display = cellText.startsWith("✅") || cellText.startsWith("ℹ️") ? "table-row" : "none";
                                    break;
                            }
                        } else {
                            row.style.display = "table-row";
                        }
                    }
                });
            }
        }

        function addTableRow(content, headerText = "Lowband EN-DC Combos") {
            const tableBody = document.getElementById('featuresTableBody');
            if (tableBody) {
                const sanitizedHeaderText = headerText.replace(/[^a-z0-9]/gi, '-').toLowerCase();
                let newRow = document.querySelector(`#custom-row-${sanitizedHeaderText}`);
                let newCell;
                if (!newRow) {
                    newRow = document.createElement("tr");
                    newRow.id = `custom-row-${sanitizedHeaderText}`;

                    const newHeader = document.createElement("th");
                    newHeader.className = "border-collapse border border-gray-500 p-1.5";
                    newHeader.style.color = "dodgerblue";
                    newHeader.textContent = headerText;
                    newRow.appendChild(newHeader);

                    newCell = document.createElement("td");
                    newCell.id = `custom-cell-${sanitizedHeaderText}`;
                    newCell.className = "border-collapse border border-gray-500 p-1.5";
                    newCell.style.whiteSpace = 'break-spaces';
                    if (content.startsWith("Log misses")) {
                        newCell.style.color = "darkorange";
                    }
                    if (content.startsWith("❌")) {
                        newCell.style.color = "red";
                    }
                    newCell.textContent = content;
                    newRow.appendChild(newCell);

                    tableBody.appendChild(newRow);
                } else {
                    newCell = document.querySelector(`#custom-cell-${sanitizedHeaderText}`);
                    if (newCell.textContent === "No Lowband EN-DC Support" || newCell.textContent === "No NR-SA UL-MIMO Support" || newCell.textContent === "No NR-SA UL-CA Support" || newCell.textContent === "Log misses NR-CA capabilities." || newCell.textContent === "Log misses EN-DC capabilities." || newCell.textContent === "Log misses LTE-CA capabilities.") {
                        newCell.textContent = content;
                    } else {
                        newCell.textContent += `, ${content}`;
                    }
                    newCell.style.whiteSpace = 'break-spaces';
                }
            } else {
                console.error('Table body element not found');
            }
        }

        function waitForElement(selector, callback) {
            const interval = setInterval(() => {
                const element = document.getElementById('featuresTableBody');
                if (element) {
                    clearInterval(interval);
                    callback(element);
                }
            }, 500);
        }

        function compareModulation(current, newMod) {
            const modOrder = {
                'qam16': 1,
                'qam64': 2,
                'qam256': 3,
                'qam1024': 4
            };

            if (!current) return newMod;
            if (!newMod) return current;

            return modOrder[newMod.toLowerCase()] > modOrder[current.toLowerCase()] ? newMod : current;
        }

        function formatModulation(modString) {
            if (!modString) return '';
            return modString.toLowerCase().replace('qam', '').trim() + 'QAM';
        }

        function generateCombinations(arr) {
            const combinations = [];
            for (let i = 0; i < arr.length; i++) {
                for (let j = i + 1; j < arr.length; j++) {
                    combinations.push([arr[i], arr[j]]);
                }
            }
            return combinations;
        }

        function generateEndcCombinations(lteBands, nrBands) {
            const combinations = [];
            lteBands.forEach(lteBand => {
                nrBands.forEach(nrBand => {
                    combinations.push({
                        lteBand: lteBand,
                        nrBand: nrBand
                    });
                });
            });
            return combinations;
        }

        function sortCombinations(combinations) {
            return combinations.sort((a, b) => {
                const extractNumbers = (combo) => {
                    return combo.match(/\d+/g).map(Number);
                };

                const numsA = extractNumbers(a);
                const numsB = extractNumbers(b);

                if (numsA[0] !== numsB[0]) {
                    return numsA[0] - numsB[0];
                }
                return numsA[1] - numsB[1];
            });
        }

        const lteLowbands = [5, 6, 8, 12, 13, 14, 17, 18, 19, 20, 26, 27, 28, 29, 31, 44, 67, 68, 71, 72, 73, 85, 87, 88, 103, 106, 107, 108];
        const nrLowbands = [5, 8, 12, 13, 14, 18, 20, 26, 28, 29, 31, 67, 71, 72, 81, 82, 83, 85, 89, 91, 92, 93, 94, 100, 105, 106, 109];

        const lteCombosToCheck = generateCombinations(lteLowbands);
        const nrCombosToCheck = generateCombinations(nrLowbands);

        const combinationsToCheck = generateEndcCombinations(lteLowbands, nrLowbands);

        function checkCapabilities(data, isMultiOutput = true) {
            const loggedCombinations = new Set();
            const lteLowbandsToCheck = [5, 6, 8, 12, 13, 14, 17, 18, 19, 20, 26, 27, 28, 29, 31, 44, 67, 68, 71, 72, 73, 85, 87, 88, 103, 106, 107, 108];
            const nrLowbandsToCheck = [5, 8, 12, 13, 14, 18, 20, 26, 28, 29, 31, 67, 71, 72, 81, 82, 83, 85, 89, 91, 92, 93, 94, 100, 105, 106, 109];
            const nrBandsToCheck = [1, 2, 3, 5, 7, 8, 12, 13, 14, 18, 20, 24, 25, 26, 28, 30, 31, 65, 66, 68, 70, 71, 72, 74, 85, 87, 88, 91, 92, 93, 94, 100, 105, 106, 109, 110];
            const nrMmwaveBandsToCheck = [257, 258, 259, 260, 261, 262];
            const nrMmwaveBandsExclude = new Set([257, 258, 259, 260, 261, 262]);
            const nrTddBands = new Set([34, 38, 39, 40, 41, 46, 47, 48, 50, 53, 77, 78, 79, 90, 96, 101, 102, 104]);
            const nrFddBands = new Set([1, 2, 3, 5, 7, 8, 12, 13, 14, 18, 20, 24, 25, 26, 28, 30, 31, 65, 66, 68, 70, 71, 72, 74, 85, 87, 88, 91, 92, 93, 94, 100, 105, 106, 109, 110]);
            const nrSulBandsToCheck = [80, 81, 82, 83, 84, 86, 89, 95, 97, 98, 99];
            const sulBandMapping = {
                80: 3,
                81: 8,
                82: 20,
                83: 28,
                84: 1,
                86: 66,
                89: 5,
                95: 34,
                97: 40,
                98: 39,
                99: 24
            };
            const nrMmwaveBandwidths = new Set();
            const validMmwaveBandwidths = [50, 100, 200, 400, 800, 1600, 2000];

            let foundLowbandSupport = false;
            let foundLteCaSupport = false;
            let foundNrCaSupport = false;
            let foundNrMmwaveSupport = false;
            let foundNrTxSwitchingSupport = false;
            let nrUlmimoBands = new Set();
            let nrUlcaCombos = new Set();
            let lteCaCombos = new Set();
            let nrCaCombos = new Set();
            let nrMmwaveBands = new Set();
            let nrTxSwitchingCombos = new Set();
            let foundNrUlMimo = false;
            let foundNrUlCa = false;
            let hasNrca = false;
            let hasEndc = false;
            let hasNrdc = false;
            let lte4RxBands = new Set();
            let nr4RxBands = new Set();
            let foundLte4Rx = false;
            let foundNr4Rx = false;
            let nr6RxBands = new Set();
            let foundNr6Rx = false;
            let nrMaxBwSupport = {};
            let foundNrMaxBwSupport = false;
            let foundNrUlMimoInEndc = false;
            let nrUlmimoBandsEndc = new Set();
            let maxNrTddBandwidth = 0;
            let maxNrFddBandwidth = 0;
            let maxTddBandwidth = {
                2: 0,
                3: 0,
                4: 0,
                5: 0,
                6: 0,
                7: 0,
                8: 0,
                9: 0,
                10: 0
            };
            let maxSupportedBands = 0;
            let maxLteMimo = 0;
            let maxNrMimo = 0;
            let nrSulBandsSupported = new Set();
            let maxSupportedComboSize = 0;
            let has100MHzOrMoreInHigherCombo = false;
            let maxLteCaMimoStreams = 0;
            let maxEndcMimoStreams = 0;
            let maxNrCaMimoStreams = 0;
            let maxLteDlModulation = '';
            let maxLteUlModulation = '';
            let maxNrDlModulation = '';
            let maxNrUlModulation = '';
            let maxNrFr2DlModulation = '';
            let maxNrFr2UlModulation = '';
            let hasLteCaData = false;
            let hasFoundLteCaCombos = false;

            function checkMmwaveBandwidth(component) {
                if (nrMmwaveBandsToCheck.includes(component.band) && component.maxBwDl && component.maxBwDl.value) {
                    const bandwidth = component.maxBwDl.value;
                    if (validMmwaveBandwidths.includes(bandwidth)) {
                        nrMmwaveBandwidths.add(bandwidth);
                    }
                }
            }

            function calculateMimoStreams(component) {
                if (component.mimoDl && component.mimoDl.value && !isNaN(component.mimoDl.value)) {
                    let multiplier = 1;
                    if (component.bwClassDl === 'B' || component.bwClassDl === 'C') {
                        multiplier = 2;
                    } else if (component.bwClassDl === 'D') {
                        multiplier = 3;
                    } else if (component.bwClassDl === 'E') {
                        multiplier = 4;
                    }
                    return component.mimoDl.value * multiplier;
                }
                return 0;
            }

            function updateMaxMimo(mimoValue, currentMax) {
                if (typeof mimoValue === 'number' && !isNaN(mimoValue)) {
                    return Math.max(currentMax, mimoValue);
                }
                return currentMax;
            }

            function calculateBandwidth(component) {
                if (!component.maxBwDl) return 0;

                let bandwidth = 0;
                const multiplier = {
                    'A': 1,
                    'B': 2,
                    'C': 2,
                    'D': 3,
                    'E': 4
                };

                if (component.maxBwDl.type === "single") {
                    bandwidth = component.maxBwDl.value * (multiplier[component.bwClassDl] || 1);
                } else if (component.maxBwDl.type === "mixed" && Array.isArray(component.maxBwDl.value)) {
                    bandwidth = component.maxBwDl.value.reduce((sum, bw) => sum + bw, 0);
                }

                return Math.min(bandwidth, 400);
            }

            function calculateVirtualBands(component) {
                const multiplier = {
                    'A': 1,
                    'B': 2,
                    'C': 2,
                    'D': 3,
                    'E': 4
                };
                return multiplier[component.bwClassDl] || 1;
            }

            const capabilitiesList = isMultiOutput ? data.capabilitiesList : [data];

            if (capabilitiesList && Array.isArray(capabilitiesList)) {
                capabilitiesList.forEach(capability => {
                    if (capability.endc && Array.isArray(capability.endc)) {
                        hasEndc = true;
                        capability.endc.forEach(endcItem => {

                            let totalMimoStreams = 0;

                            if (endcItem.componentsLte && Array.isArray(endcItem.componentsLte)) {

                                totalMimoStreams += endcItem.componentsLte.reduce((sum, component) =>
                                    sum + calculateMimoStreams(component), 0);

                                endcItem.componentsLte.forEach(component => {
                                    if (lteLowbandsToCheck.includes(component.band) && component.mimoDl && component.mimoDl.value === 4) {
                                        lte4RxBands.add(component.band);
                                        foundLte4Rx = true;
                                    }
                                });

                                lteCombosToCheck.forEach(combo => {
                                    const [band1, band2] = combo;
                                    const hasBand1 = endcItem.componentsLte.some(component =>
                                        component.band === band1 && component.bwClassDl === "A");
                                    const hasBand2 = endcItem.componentsLte.some(component =>
                                        component.band === band2 && component.bwClassDl === "A");

                                    if (hasBand1 && hasBand2) {
                                        const comboString = `${band1}+${band2}`;
                                        if (!lteCaCombos.has(comboString)) {
                                            lteCaCombos.add(comboString);
                                            hasFoundLteCaCombos = true;
                                        }
                                    }
                                });

                            }

                            if (endcItem.componentsNr && Array.isArray(endcItem.componentsNr)) {

                                endcItem.componentsNr.forEach(checkMmwaveBandwidth);

                                totalMimoStreams += endcItem.componentsNr.reduce((sum, component) =>
                                    sum + calculateMimoStreams(component), 0);

                                endcItem.componentsNr.forEach(component => {

                                    if (nrMmwaveBandsToCheck.includes(component.band)) {
                                        if (component.modulationDl && component.modulationDl.value) {
                                            maxNrFr2DlModulation = compareModulation(maxNrFr2DlModulation,
                                                component.modulationDl.value);
                                        }
                                        if (component.modulationUl && component.modulationUl.value) {
                                            maxNrFr2UlModulation = compareModulation(maxNrFr2UlModulation,
                                                component.modulationUl.value);
                                        }
                                    }

                                    if (nrSulBandsToCheck.includes(component.band)) {
                                        nrSulBandsSupported.add(component.band);
                                    }

                                    if (component.mimoDl && component.mimoDl.value) {
                                        maxNrMimo = updateMaxMimo(component.mimoDl.value, maxNrMimo);
                                    }

                                    if (component.mimoUl && component.mimoUl.value === 2) {
                                        nrUlmimoBandsEndc.add(`n${component.band}`);
                                        foundNrUlMimoInEndc = true;
                                    }

                                    if (component.modulationDl && component.modulationDl.value) {
                                        maxNrDlModulation = compareModulation(maxNrDlModulation, component.modulationDl.value);
                                    }
                                    if (component.modulationUl && component.modulationUl.value) {
                                        maxNrUlModulation = compareModulation(maxNrUlModulation, component.modulationUl.value);
                                    }

                                });
                            }

                            maxEndcMimoStreams = Math.max(maxEndcMimoStreams, totalMimoStreams);

                            combinationsToCheck.forEach(combination => {
                                const {
                                    lteBand,
                                    nrBand
                                } = combination;

                                const lteComponent = endcItem.componentsLte && endcItem.componentsLte.find(component => component.band === lteBand && component.bwClassUl === "A");
                                const nrComponent = endcItem.componentsNr && endcItem.componentsNr.find(component => component.band === nrBand && component.bwClassUl === "A");

                                if (lteComponent && nrComponent) {
                                    const combinationString = `${lteBand}_n${nrBand}`;
                                    if (!loggedCombinations.has(combinationString)) {
                                        loggedCombinations.add(combinationString);
                                        foundLowbandSupport = true;
                                    }
                                }
                            });

                            nrLowbandsToCheck.forEach(band => {
                                const nr4RxComponent = endcItem.componentsNr && endcItem.componentsNr.find(component => component.band === band && component.mimoDl && component.mimoDl.value === 4);
                                if (nr4RxComponent) {
                                    nr4RxBands.add(band);
                                    foundNr4Rx = true;
                                }
                            });

                            [...nrTddBands, ...nrFddBands].forEach(band => {
                                const nr6RxComponent = endcItem.componentsNr && endcItem.componentsNr.find(component => component.band === band && component.mimoDl && component.mimoDl.value === 6);
                                if (nr6RxComponent) {
                                    nr6RxBands.add(band);
                                    foundNr6Rx = true;
                                }
                            });

                            nrBandsToCheck.forEach(band => {
                                const nrComponent = endcItem.componentsNr && endcItem.componentsNr.find(component => component.band === band && component.maxBwDl && component.maxBwDl.value > 20);
                                if (nrComponent) {
                                    if (!nrMaxBwSupport[band] || nrMaxBwSupport[band] < nrComponent.maxBwDl.value) {
                                        nrMaxBwSupport[band] = nrComponent.maxBwDl.value;
                                        foundNrMaxBwSupport = true;
                                    }
                                }
                            });

                            nrMmwaveBandsToCheck.forEach(band => {
                                const nrMmwaveComponent = endcItem.componentsNr && endcItem.componentsNr.find(component => component.band === band);
                                if (nrMmwaveComponent) {
                                    nrMmwaveBands.add(`n${band}`);
                                    foundNrMmwaveSupport = true;
                                }
                            });
                        });
                    }

                    if (capability.nrca && Array.isArray(capability.nrca)) {
                        hasNrca = true;
                        capability.nrca.forEach(nrcaItem => {
                            if (nrcaItem.components && Array.isArray(nrcaItem.components)) {
                                let ulMimoBandsInComponent = new Set();
                                let ulCaBandsInComponent = [];

                                let totalFddBandwidth = 0;
                                let hasFddBand = false;
                                let totalTddBandwidth = 0;
                                let totalVirtualBands = 0;
                                let hasTddBand = false;
                                let tddBandwidths = [];

                                nrcaItem.components.forEach(checkMmwaveBandwidth);

                                const totalMimoStreams = nrcaItem.components.reduce((sum, component) =>
                                    sum + calculateMimoStreams(component), 0);
                                maxNrCaMimoStreams = Math.max(maxNrCaMimoStreams, totalMimoStreams);

                                nrcaItem.components.forEach(component => {

                                    if (nrSulBandsToCheck.includes(component.band)) {
                                        nrSulBandsSupported.add(component.band);
                                    }

                                    if (component.mimoDl && component.mimoDl.value) {
                                        maxNrMimo = updateMaxMimo(component.mimoDl.value, maxNrMimo);
                                    }

                                    if (nrTddBands.has(component.band)) {
                                        hasTddBand = true;
                                        const bandwidth = calculateBandwidth(component);
                                        totalTddBandwidth += bandwidth;
                                        tddBandwidths.push(bandwidth);
                                        totalVirtualBands += calculateVirtualBands(component);
                                    } else if (nrFddBands.has(component.band)) {
                                        hasFddBand = true;
                                        const bandwidth = calculateBandwidth(component);
                                        totalFddBandwidth += bandwidth;
                                        totalVirtualBands += calculateVirtualBands(component);
                                    }

                                    if (component.modulationDl && component.modulationDl.value) {
                                        maxNrDlModulation = compareModulation(maxNrDlModulation, component.modulationDl.value);
                                    }
                                    if (component.modulationUl && component.modulationUl.value) {
                                        maxNrUlModulation = compareModulation(maxNrUlModulation, component.modulationUl.value);
                                    }

                                });

                                if (hasTddBand) {
                                    maxNrTddBandwidth = Math.max(maxNrTddBandwidth, totalTddBandwidth);
                                }
                                if (hasFddBand) {
                                    maxNrFddBandwidth = Math.max(maxNrFddBandwidth, totalFddBandwidth);
                                }

                                if (hasTddBand && hasFddBand) {
                                    const comboSize = totalVirtualBands;
                                    if (comboSize >= 2 && comboSize <= 10) {
                                        maxTddBandwidth[comboSize] = Math.max(
                                            maxTddBandwidth[comboSize],
                                            totalTddBandwidth
                                        );
                                        maxSupportedComboSize = Math.max(maxSupportedComboSize, comboSize);

                                        if (comboSize > 2 && totalTddBandwidth >= 100) {
                                            has100MHzOrMoreInHigherCombo = true;
                                        }
                                    }
                                }

                                nrcaItem.components.forEach(component => {
                                    if (component.mimoUl && component.mimoUl.value === 2) {
                                        nrUlmimoBands.add(`n${component.band}`);
                                        foundNrUlMimo = true;
                                    }

                                    if (component.bwClassUl) {
                                        if (component.bwClassUl === 'A') {
                                            ulCaBandsInComponent.push(`n${component.band}`);
                                        } else {
                                            const bandConfig = `n${component.band}${component.bwClassUl}`;
                                            ulCaBandsInComponent.push(bandConfig);
                                            if (!nrUlcaCombos.has(bandConfig)) {
                                                nrUlcaCombos.add(bandConfig);
                                                foundNrUlCa = true;
                                            }
                                        }
                                    }

                                    if (nrLowbandsToCheck.includes(component.band) && component.mimoDl && component.mimoDl.value === 4) {
                                        nr4RxBands.add(component.band);
                                        foundNr4Rx = true;
                                    }

                                    if ((nrTddBands.has(component.band) || nrFddBands.has(component.band)) && component.mimoDl && component.mimoDl.value === 6) {
                                        nr6RxBands.add(component.band);
                                        foundNr6Rx = true;
                                    }

                                    if (nrBandsToCheck.includes(component.band) && component.maxBwDl && component.maxBwDl.value > 20) {
                                        if (!nrMaxBwSupport[component.band] || nrMaxBwSupport[component.band] < component.maxBwDl.value) {
                                            nrMaxBwSupport[component.band] = component.maxBwDl.value;
                                            foundNrMaxBwSupport = true;
                                        }
                                    }

                                    if (nrMmwaveBandsToCheck.includes(component.band)) {
                                        nrMmwaveBands.add(`n${component.band}`);
                                        foundNrMmwaveSupport = true;
                                    }
                                });

                                if (ulCaBandsInComponent.length > 1) {
                                    const combo = ulCaBandsInComponent.join('+');
                                    if (!nrUlcaCombos.has(combo)) {
                                        nrUlcaCombos.add(combo);
                                        foundNrUlCa = true;
                                    }
                                }

                                nrCombosToCheck.forEach(combo => {
                                    const [band1, band2] = combo;
                                    const hasBand1 = nrcaItem.components.some(component => component.band === band1 && component.bwClassDl === "A");
                                    const hasBand2 = nrcaItem.components.some(component => component.band === band2 && component.bwClassDl === "A");

                                    if (hasBand1 && hasBand2) {
                                        const comboString = `n${band1}+n${band2}`;
                                        if (!nrCaCombos.has(comboString)) {
                                            nrCaCombos.add(comboString);
                                            foundNrCaSupport = true;
                                        }
                                    }
                                });

                                if (nrcaItem.uplinkTxSwitch && Array.isArray(nrcaItem.uplinkTxSwitch)) {
                                    const hasValidTxSwitching = nrcaItem.uplinkTxSwitch.some(txSwitch =>
                                        txSwitch.option === "BOTH" ||
                                        txSwitch.option === "DUAL_UL" ||
                                        txSwitch.option === "SWITCHED_UL"
                                    );

                                    if (hasValidTxSwitching) {
                                        const ulBands = nrcaItem.components
                                            .filter(component => component.bwClassUl)
                                            .map(component => component.band);

                                        if (ulBands.length > 1) {
                                            const sortedBands = ulBands.sort((a, b) => a - b);
                                            const comboString = sortedBands.map(band => `n${band}`).join('+');

                                            if (!nrTxSwitchingCombos.has(comboString)) {
                                                nrTxSwitchingCombos.add(comboString);
                                                foundNrTxSwitchingSupport = true;
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }

                    if (has100MHzOrMoreInHigherCombo && maxTddBandwidth[2] < 100) {
                        maxTddBandwidth[2] = 100;
                    }

                    if (capability.nrdc && Array.isArray(capability.nrdc)) {
                        hasNrdc = true;
                        capability.nrdc.forEach(nrdcItem => {
                            if (nrdcItem.componentsFr2 && Array.isArray(nrdcItem.componentsFr2)) {

                                nrdcItem.componentsFr2.forEach(checkMmwaveBandwidth);

                                nrdcItem.componentsFr2.forEach(component => {

                                    if (component.modulationDl && component.modulationDl.value) {
                                        maxNrFr2DlModulation = compareModulation(maxNrFr2DlModulation,
                                            component.modulationDl.value);
                                    }
                                    if (component.modulationUl && component.modulationUl.value) {
                                        maxNrFr2UlModulation = compareModulation(maxNrFr2UlModulation,
                                            component.modulationUl.value);
                                    }

                                    if (nrMmwaveBandsToCheck.includes(component.band)) {
                                        nrMmwaveBands.add(`n${component.band}`);
                                        foundNrMmwaveSupport = true;
                                    }
                                });
                            }
                        });
                    }

                    if (capability.lteca && Array.isArray(capability.lteca)) {
                        hasLteCaData = true;
                        capability.lteca.forEach(ltecaItem => {
                            if (ltecaItem.components && Array.isArray(ltecaItem.components)) {

                                const totalMimoStreams = ltecaItem.components.reduce((sum, component) =>
                                    sum + calculateMimoStreams(component), 0);
                                maxLteCaMimoStreams = Math.max(maxLteCaMimoStreams, totalMimoStreams);

                                ltecaItem.components.forEach(component => {

                                    if (component.mimoDl && component.mimoDl.value) {
                                        maxLteMimo = updateMaxMimo(component.mimoDl.value, maxLteMimo);
                                    }

                                    if (component.modulationDl && component.modulationDl.value) {
                                        maxLteDlModulation = compareModulation(maxLteDlModulation, component.modulationDl.value);
                                    }
                                    if (component.modulationUl && component.modulationUl.value) {
                                        maxLteUlModulation = compareModulation(maxLteUlModulation, component.modulationUl.value);
                                    }

                                });

                                lteCombosToCheck.forEach(combo => {
                                    const [band1, band2] = combo;
                                    const hasBand1 = ltecaItem.components.some(component => component.band === band1 && component.bwClassDl === "A");
                                    const hasBand2 = ltecaItem.components.some(component => component.band === band2 && component.bwClassDl === "A");

                                    if (hasBand1 && hasBand2) {
                                        const comboString = `${band1}+${band2}`;
                                        if (!lteCaCombos.has(comboString)) {
                                            lteCaCombos.add(comboString);
                                            hasFoundLteCaCombos = true;
                                        }
                                    }
                                });

                                lteLowbandsToCheck.forEach(band => {
                                    const lte4RxComponent = ltecaItem.components.find(component => component.band === band && component.mimoDl && component.mimoDl.value === 4);
                                    if (lte4RxComponent) {
                                        lte4RxBands.add(band);
                                        foundLte4Rx = true;
                                    }
                                });
                            }
                        });
                    }
                });
            }

            const addSupportRow = (condition, foundSupport, foundSupportText, notFoundSupportText, headerText, logMissesText = '', useInfoIcon = false) => {
                waitForElement('featuresTableBody', function() {
                    if (condition) {
                        if (foundSupport) {
                            const icon = useInfoIcon ? 'ℹ️' : '✅';
                            addTableRow(`${icon} ${foundSupportText}`, headerText);
                        } else {
                            addTableRow(`❌ ${notFoundSupportText}`, headerText);
                        }
                    } else {
                        addTableRow(logMissesText, headerText);
                    }
                });
            };

            addSupportRow(hasLteCaData || hasFoundLteCaCombos, hasFoundLteCaCombos, sortCombinations([...lteCaCombos]).join(', '), "No lowband LTE-CA combo support", "Lowband LTE-CA combos", "Log misses LTE-CA capabilities.");
            addSupportRow(hasEndc, foundLowbandSupport, sortCombinations([...loggedCombinations]).join(', '), "No lowband EN-DC support", "Lowband EN-DC combos", "Log misses EN-DC capabilities.");
            addSupportRow(hasNrca, foundNrCaSupport, sortCombinations([...nrCaCombos]).join(', '), "No lowband NR-CA combo support", "Lowband NR-CA combos", "Log misses NR-CA capabilities.");
            addSupportRow(hasLteCaData || hasEndc, foundLte4Rx, [...lte4RxBands].sort((a, b) => a - b).join(', '), "No lowband LTE 4Rx support", "Lowband LTE 4Rx support", "Log misses EN-DC and NR-CA capabilities.");
            addSupportRow(hasEndc || hasNrca, foundNr4Rx, [...nr4RxBands].sort((a, b) => a - b).map(band => `n${band}`).join(', '), "No lowband NR 4Rx support", "Lowband NR 4Rx support", "Log misses EN-DC and NR-CA capabilities.");
            addSupportRow(hasEndc || hasNrca, foundNr6Rx, [...nr6RxBands].sort((a, b) => a - b).map(band => `n${band}`).join(', '), "No NR 6Rx support", "NR 6Rx bands", "Log misses EN-DC and NR-CA capabilities.");
            addSupportRow(hasLteCaData, maxLteMimo > 0, `${maxLteMimo} Rx`, "No LTE MIMO support found", "LTE max MIMO Rx", "Log misses LTE-CA capabilities.", true);
            addSupportRow(hasEndc || hasNrca, maxNrMimo > 0, `${maxNrMimo} Rx`, "No NR MIMO support found", "NR max MIMO Rx", "Log misses EN-DC and NR-CA capabilities.", true);
            addSupportRow(hasLteCaData, maxLteCaMimoStreams > 0, `${maxLteCaMimoStreams} Streams`, "No LTE CA MIMO stream information found", "LTE max DL streams", "Log misses LTE-CA capabilities.", true);
            addSupportRow(hasEndc, maxEndcMimoStreams > 0, `${maxEndcMimoStreams} Streams`, "No ENDC MIMO stream information found", "NR-NSA max DL streams", "Log misses EN-DC capabilities.", true);
            addSupportRow(hasNrca, maxNrCaMimoStreams > 0, `${maxNrCaMimoStreams} Streams`, "No NR-SA CA MIMO stream information found", "NR-SA max DL streams", "Log misses NR-CA capabilities.", true);
            addSupportRow(hasLteCaData, maxLteDlModulation, formatModulation(maxLteDlModulation), "No LTE DL modulation information found", "LTE max DL modulation", "Log misses LTE-CA capabilities.", true);
            addSupportRow(hasLteCaData, maxLteUlModulation, formatModulation(maxLteUlModulation), "No LTE UL modulation information found", "LTE max UL modulation", "Log misses LTE-CA capabilities.", true);
            addSupportRow(hasEndc || hasNrca, maxNrDlModulation, formatModulation(maxNrDlModulation), "No NR DL modulation information found", "NR max DL modulation", "Log misses EN-DC and NR-CA capabilities.", true);
            addSupportRow(hasEndc || hasNrca, maxNrUlModulation, formatModulation(maxNrUlModulation), "No NR UL modulation information found", "NR max UL modulation", "Log misses EN-DC and NR-CA capabilities.", true);
            addSupportRow(hasEndc || hasNrdc, maxNrFr2DlModulation, formatModulation(maxNrFr2DlModulation), "No NR FR2 DL modulation information found", "NR FR2 max DL modulation", "Log misses EN-DC and NR-DC capabilities.", true);
            addSupportRow(hasEndc || hasNrdc, maxNrFr2UlModulation, formatModulation(maxNrFr2UlModulation), "No NR FR2 UL modulation information found", "NR FR2 max UL modulation", "Log misses EN-DC and NR-DC capabilities.", true);
            addSupportRow(hasEndc || hasNrca, foundNrMaxBwSupport, Object.entries(nrMaxBwSupport).filter(([band, bw]) => bw > 20).map(([band, bw]) => `n${band}@${bw}MHz`).join(', '), "No extended NR FDD bandwidth support", "NR FDD extended bw support", "Log misses EN-DC and NR-CA capabilities.");
            addSupportRow(hasEndc || hasNrca, nrSulBandsSupported.size > 0, [...nrSulBandsSupported].sort((a, b) => a - b).map(band => `n${band}(n${sulBandMapping[band]})`).join(', '), "No NR SUL bands support", "NR SUL bands", "Log misses EN-DC and NR-CA capabilities.");
            addSupportRow(hasEndc, foundNrUlMimoInEndc, [...nrUlmimoBandsEndc].map(band => band.replace('n', '')).sort((a, b) => a - b).map(band => `n${band}`).join(', '), "No NR-NSA UL-MIMO support", "NR-NSA UL MIMO", "Log misses EN-DC capabilities.");
            addSupportRow(hasNrca, foundNrUlMimo, [...nrUlmimoBands].map(band => band.replace('n', '')).sort((a, b) => a - b).map(band => `n${band}`).join(', '), "No NR-SA UL-MIMO support", "NR-SA UL MIMO", "Log misses NR-CA capabilities.");
            addSupportRow(hasNrca, foundNrUlCa, sortCombinations([...nrUlcaCombos]).join(', '), "No NR-SA UL-CA support", "NR-SA ULCA", "Log misses NR-CA capabilities.");
            addSupportRow(hasNrca, foundNrTxSwitchingSupport, sortCombinations([...nrTxSwitchingCombos]).join(', '), "No NR-SA uplink TX switching support", "NR-SA uplink TX switching", "Log misses NR-CA capabilities.");
            addSupportRow(hasNrca, maxNrFddBandwidth > 0, `${maxNrFddBandwidth}MHz`, "No NR-SA max overall FR1 FDD bandwidth support", "NR-SA max overall FR1 FDD bandwidth", "Log misses NR-CA capabilities.");
            addSupportRow(hasNrca, maxNrTddBandwidth > 0, `${maxNrTddBandwidth}MHz`, "No NR-SA max overall FR1 TDD bandwidth support", "NR-SA max overall FR1 TDD bandwidth", "Log misses NR-CA capabilities.");
            for (let i = 2; i <= maxSupportedComboSize; i++) {
                addSupportRow(hasNrca, maxTddBandwidth[i] > 0, `${maxTddBandwidth[i]}MHz`, `No ${i}xCA NR-CA with mixed TDD/FDD support`, `NR-SA max TDD bandwidth (FR1 ${i}xCA F+T)`, "Log misses NR-CA capabilities.");
            }
            addSupportRow(hasEndc || hasNrca, foundNrMmwaveSupport, [...nrMmwaveBands].map(band => band.replace('n', '')).sort((a, b) => a - b).map(band => `n${band}`).join(', '), "No NR mmWave support", "NR mmWave bands", "Log misses EN-DC and NR-CA capabilities.");
            addSupportRow(hasEndc || hasNrca || hasNrdc, nrMmwaveBandwidths.size > 0, [...nrMmwaveBandwidths].sort((a, b) => a - b).map(bw => `${bw}MHz`).join(', '), "No NR mmWave bandwidth support found", "NR mmWave supported bandwidth per CC", "Log misses EN-DC, NR-CA and NR-DC capabilities.");

        }

        function observeTableCreation() {
            const config = {
                childList: true,
                subtree: true
            };

            const callback = function(mutationsList, observer) {
                for (let mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        const targetElement = document.querySelector("body > div > main > div.flex.flex-1.flex-col > div.flex.flex-1.flex-col > div:nth-child(2)");
                        if (targetElement) {
                            createFeaturesSection();
                            observer.disconnect();
                            break;
                        }
                    }
                }
            };

            const observer = new MutationObserver(callback);

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    if (document.body) {
                        observer.observe(document.body, config);
                    }
                });
            } else {
                if (document.body) {
                    observer.observe(document.body, config);
                }
            }
        }

        observeTableCreation();

        const originalXhrSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function(...args) {
            this.addEventListener("load", function() {
                const url = this.responseURL;
                if (url.includes("getMultiOutput") || url.includes("getOutput")) {
                    try {
                        const data = JSON.parse(this.responseText);
                        if (url.includes("getMultiOutput")) {
                            checkCapabilities(data, true);
                        } else if (url.includes("getOutput")) {
                            checkCapabilities(data, false);
                        }
                    } catch (err) {
                        console.error('Failed to parse JSON response:', err);
                    }
                }
            });

            return originalXhrSend.apply(this, args);
        };
    }
})();
