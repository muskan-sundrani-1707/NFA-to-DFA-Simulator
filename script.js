
// ============================================
// 1. GET HTML ELEMENTS
// ============================================

const statesInput = document.getElementById("states");
const alphabetInput = document.getElementById("alphabet");
const startInput = document.getElementById("startState");
const finalInput = document.getElementById("finalStates");
const transitionsInput = document.getElementById("transitions");

const exampleBtn = document.getElementById("exampleBtn");
const convertBtn = document.getElementById("convertBtn");
const resetBtn = document.getElementById("resetBtn");
const testBtn = document.getElementById("testBtn");

const errorMessage = document.getElementById("errorMessage");

const nfaTable = document.getElementById("nfaTable");
const stepsContainer = document.getElementById("stepsContainer");
const dfaSummary = document.getElementById("dfaSummary");
const dfaTable = document.getElementById("dfaTable");

let nfa = null;
let dfa = null;


// ============================================
// 2. LOAD EXAMPLE BUTTON
// ============================================

exampleBtn.addEventListener("click", function () {

    statesInput.value = "q0, q1, q2";
    alphabetInput.value = "a, b";
    startInput.value = "q0";
    finalInput.value = "q2";

    transitionsInput.value = `
q0,a,q0
q0,a,q1
q0,b,q0
q1,b,q2
    `.trim();

    errorMessage.textContent = "";

    try {
        nfa = validateNFA();

        displayNFATable(nfa);
        displayNFADiagram(nfa);

        // Clear old DFA results
        dfa = null;
        stepsContainer.innerHTML =
            '<p class="placeholder">Conversion steps will appear here.</p>';

        dfaSummary.innerHTML = "";

        dfaTable.innerHTML =
            '<p class="placeholder">Generated DFA transition table will appear here.</p>';

        document.getElementById("dfaDiagram").innerHTML =
            '<p class="placeholder">DFA diagram will appear here.</p>';

        document.getElementById("testResult").innerHTML = "";

    } catch (error) {
        errorMessage.textContent = error.message;
    }

});


// ============================================
// 3. RESET BUTTON
// ============================================

resetBtn.addEventListener("click", function () {

    statesInput.value = "";
    alphabetInput.value = "";
    startInput.value = "";
    finalInput.value = "";
    transitionsInput.value = "";

    document.getElementById("testString").value = "";

    errorMessage.textContent = "";

    nfaTable.innerHTML =
        '<p class="placeholder">Enter NFA details and click Convert.</p>';

    stepsContainer.innerHTML =
        '<p class="placeholder">Conversion steps will appear here.</p>';

    dfaSummary.innerHTML = "";

    dfaTable.innerHTML =
        '<p class="placeholder">Generated DFA transition table will appear here.</p>';

    document.getElementById("nfaDiagram").innerHTML =
        '<p class="placeholder">NFA diagram will appear here.</p>';

    document.getElementById("dfaDiagram").innerHTML =
        '<p class="placeholder">DFA diagram will appear here.</p>';

    document.getElementById("testResult").innerHTML = "";

    nfa = null;
    dfa = null;

});


// ============================================
// 4. HELPER FUNCTION: SPLIT INPUT
// ============================================

function splitInput(value) {

    return value
        .split(",")
        .map(item => item.trim())
        .filter(item => item !== "");

}


// ============================================
// 5. VALIDATE NFA INPUT
// ============================================

function validateNFA() {

    const states = splitInput(statesInput.value);
    const alphabet = splitInput(alphabetInput.value);
    const startState = startInput.value.trim();
    const finalStates = splitInput(finalInput.value);

    const transitionLines = transitionsInput.value
        .split("\n")
        .map(line => line.trim())
        .filter(line => line !== "");

    // Check empty fields

    if (states.length === 0) {
        throw new Error("Please enter at least one state.");
    }

    if (alphabet.length === 0) {
        throw new Error("Please enter the input alphabet.");
    }

    if (!startState) {
        throw new Error("Please enter the initial state.");
    }

    if (!states.includes(startState)) {
        throw new Error("Initial state must be one of the defined states.");
    }

    if (finalStates.length === 0) {
        throw new Error("Please enter at least one final state.");
    }

    // Check duplicate states and symbols

    if (new Set(states).size !== states.length) {
        throw new Error("Duplicate states are not allowed.");
    }

    if (new Set(alphabet).size !== alphabet.length) {
        throw new Error("Duplicate alphabet symbols are not allowed.");
    }

    if (states.some(state => state.includes(","))) {
        throw new Error("State names cannot contain commas.");
    }

    if (alphabet.some(symbol => symbol.includes(","))) {
        throw new Error("Invalid alphabet symbol.");
    }

    // Check final states

    for (let state of finalStates) {

        if (!states.includes(state)) {
            throw new Error(
                `Final state ${state} is not defined in the states list.`
            );
        }

    }

    // Create transition object

    let transitions = {};

    // Read every transition line

    for (let line of transitionLines) {

        const parts = line.split(",").map(item => item.trim());

        if (parts.length !== 3 || parts.some(item => item === "")) {
            throw new Error(
                `Invalid transition: "${line}". Use format: q0,a,q1`
            );
        }

        const [from, symbol, to] = parts;

        if (!states.includes(from)) {
            throw new Error(`Unknown source state: ${from}`);
        }

        if (!alphabet.includes(symbol)) {
            throw new Error(`Invalid input symbol: ${symbol}`);
        }

        if (!states.includes(to)) {
            throw new Error(`Unknown destination state: ${to}`);
        }

        // Store multiple destinations

        const key = from + "," + symbol;

        if (!transitions[key]) {
            transitions[key] = [];
        }

        if (!transitions[key].includes(to)) {
            transitions[key].push(to);
        }

    }

    return {
        states,
        alphabet,
        startState,
        finalStates,
        transitions
    };

}


// ============================================
// 6. DISPLAY NFA TRANSITION TABLE
// ============================================

function displayNFATable(nfa) {

    let html = `
        <table>
            <thead>
                <tr>
                    <th>State</th>
    `;

    nfa.alphabet.forEach(symbol => {
        html += `<th>${escapeHTML(symbol)}</th>`;
    });

    html += `
                </tr>
            </thead>
            <tbody>
    `;

    nfa.states.forEach(state => {

        html += `<tr><td>${escapeHTML(state)}</td>`;

        nfa.alphabet.forEach(symbol => {

            const key = state + "," + symbol;
            const destinations = nfa.transitions[key] || [];

            const result = destinations.length
                ? `{${destinations.map(escapeHTML).join(", ")}}`
                : "∅";

            html += `<td>${result}</td>`;

        });

        html += "</tr>";

    });

    html += `
            </tbody>
        </table>
    `;

    nfaTable.innerHTML = html;

}


// ============================================
// 7. DISPLAY NFA STATE DIAGRAM
// ============================================

function displayNFADiagram(nfa) {

    const container = document.getElementById("nfaDiagram");

    const states = nfa.states;
    const total = states.length;

    const width = Math.max(650, total * 170);
    const height = 300;

    const centerX = width / 2;
    const centerY = 145;

    const radius = total === 1 ? 0 : Math.min(110, total * 30);

    const positions = {};

    states.forEach((state, i) => {

        const angle = (2 * Math.PI * i / total) - Math.PI / 2;

        positions[state] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };

    });

    let svg = `
    <svg viewBox="0 0 ${width} ${height}"
         width="100%"
         xmlns="http://www.w3.org/2000/svg">

        <defs>
            <marker id="nfaArrow"
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="3"
                orient="auto">
                <path d="M0,0 L0,6 L9,3 z" fill="#a78bfa"/>
            </marker>
        </defs>
    `;

    // Draw transitions

    for (const [key, destinations] of Object.entries(nfa.transitions)) {

        const [from, symbol] = key.split(",");
        const start = positions[from];

        destinations.forEach((to, index) => {

            const end = positions[to];

            if (!start || !end) return;

            // Self loop

            if (from === to) {

                svg += `
                    <path
                        d="M ${start.x - 12} ${start.y - 20}
                           C ${start.x - 65} ${start.y - 85},
                             ${start.x + 65} ${start.y - 85},
                             ${start.x + 12} ${start.y - 20}"
                        fill="none"
                        stroke="#a78bfa"
                        stroke-width="2"
                        marker-end="url(#nfaArrow)"
                    />

                    <text
                        x="${start.x}"
                        y="${start.y - 70}"
                        fill="#ffffff"
                        text-anchor="middle"
                        font-size="13">
                        ${escapeHTML(symbol)}
                    </text>
                `;

            } else {

                const dx = end.x - start.x;
                const dy = end.y - start.y;

                const length = Math.sqrt(dx * dx + dy * dy);

                const offset = (index % 2 === 0 ? 1 : -1) * 15;

                const sx = start.x + (dx / length) * 25;
                const sy = start.y + (dy / length) * 25;

                const ex = end.x - (dx / length) * 29;
                const ey = end.y - (dy / length) * 29;

                const mx = (sx + ex) / 2 - (dy / length) * offset;
                const my = (sy + ey) / 2 + (dx / length) * offset;

                svg += `
                    <path
                        d="M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}"
                        fill="none"
                        stroke="#a78bfa"
                        stroke-width="2"
                        marker-end="url(#nfaArrow)"
                    />

                    <text
                        x="${mx}"
                        y="${my - 8}"
                        fill="#ffffff"
                        text-anchor="middle"
                        font-size="13">
                        ${escapeHTML(symbol)}
                    </text>
                `;

            }

        });

    }

    // Draw initial state arrow

    const initial = positions[nfa.startState];

    svg += `
        <path
            d="M ${initial.x - 65} ${initial.y}
               L ${initial.x - 27} ${initial.y}"
            stroke="#22c55e"
            stroke-width="2"
            fill="none"
            marker-end="url(#nfaArrow)"
        />
    `;

    // Draw states

    states.forEach(state => {

        const { x, y } = positions[state];
        const isFinal = nfa.finalStates.includes(state);

        svg += `
            <circle
                cx="${x}"
                cy="${y}"
                r="25"
                fill="#1e1b4b"
                stroke="#a78bfa"
                stroke-width="2"
            />
        `;

        // Double circle for final state

        if (isFinal) {

            svg += `
                <circle
                    cx="${x}"
                    cy="${y}"
                    r="20"
                    fill="none"
                    stroke="#a78bfa"
                    stroke-width="1.5"
                />
            `;

        }

        svg += `
            <text
                x="${x}"
                y="${y + 5}"
                text-anchor="middle"
                fill="white"
                font-size="13">
                ${escapeHTML(state)}
            </text>
        `;

    });

    svg += `</svg>`;

    container.innerHTML = svg;

}


// ============================================
// 8. HELPER: ESCAPE HTML
// ============================================

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function (char) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];

    });

}


// ============================================
// 9. NFA TO DFA: SUBSET CONSTRUCTION
// ============================================

function convertNFAtoDFA(nfa) {

    const startSet = [nfa.startState];

    let dfaStates = [startSet];
    let queue = [startSet];

    let dfaTransitions = {};
    let steps = [];

    while (queue.length > 0) {

        const current = queue.shift();
        const currentName = current.join(",");

        dfaTransitions[currentName] = {};

        // Process every alphabet symbol

        for (let symbol of nfa.alphabet) {

            let nextStates = new Set();

            // Find all possible NFA destinations

            for (let state of current) {

                const key = state + "," + symbol;
                const destinations = nfa.transitions[key] || [];

                destinations.forEach(nextState => {
                    nextStates.add(nextState);
                });

            }

            const nextSet = [...nextStates].sort();
            const nextName = nextSet.join(",");

            dfaTransitions[currentName][symbol] = nextName;

            // Check whether DFA state already exists

            const alreadyExists = dfaStates.some(
                state => state.join(",") === nextName
            );

            // Add new DFA state

            if (!alreadyExists) {

                dfaStates.push(nextSet);
                queue.push(nextSet);

            }

            // Save conversion step

            steps.push({
                current: currentName || "∅",
                symbol: symbol,
                next: nextName || "∅"
            });

        }

    }

    // Identify DFA final states

    const dfaFinalStates = dfaStates.filter(state =>

        state.some(nfaState =>
            nfa.finalStates.includes(nfaState)
        )

    );

    return {
        states: dfaStates,
        transitions: dfaTransitions,
        startState: startSet,
        finalStates: dfaFinalStates,
        steps: steps
    };

}


// ============================================
// 10. GENERATE DFA STATE DIAGRAM USING SVG
// ============================================

function displayDFADiagram(nfa, dfa) {

    const container = document.getElementById("dfaDiagram");

    const states = dfa.states;
    const total = states.length;

    const width = Math.max(750, total * 190);
    const height = 400;

    const centerX = width / 2;
    const centerY = 190;

    const radius = total === 1 ? 0 : Math.min(110, total * 25);

    const stateRadius = 32;

    // Generate positions for DFA states

    const positions = states.map((state, index) => {

        if (total === 1) {
            return {
                x: centerX,
                y: centerY
            };
        }

        const angle =
            (2 * Math.PI * index / total) - Math.PI / 2;

        return {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };

    });

    // Check final state

    function isFinal(state) {

        return dfa.finalStates.some(
            finalState => finalState.join(",") === state.join(",")
        );

    }

    // Generate names A, B, C...

    function stateName(index) {

        let name = "";

        index++;

        while (index > 0) {

            index--;

            name = String.fromCharCode(65 + index % 26) + name;

            index = Math.floor(index / 26);

        }

        return name;

    }

    let svg = `
    <svg
        width="${width}"
        height="${height}"
        viewBox="0 0 ${width} ${height}"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Generated DFA state diagram">

        <defs>
            <marker
                id="dfaArrow"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth">

                <path
                    d="M0,0 L0,6 L9,3 z"
                    fill="#a69cff"
                />

            </marker>
        </defs>
    `;

    // Draw transitions

    states.forEach((fromState, fromIndex) => {

        const fromName = fromState.join(",");
        const fromPosition = positions[fromIndex];

        // Group symbols with same destination

        const groupedTransitions = {};

        nfa.alphabet.forEach(symbol => {

            const destination =
                dfa.transitions[fromName][symbol];

            if (!groupedTransitions[destination]) {
                groupedTransitions[destination] = [];
            }

            groupedTransitions[destination].push(symbol);

        });

        Object.entries(groupedTransitions).forEach(
            ([destination, symbols]) => {

                const toIndex = states.findIndex(
                    state => state.join(",") === destination
                );

                if (toIndex === -1) return;

                const toPosition = positions[toIndex];

                // Self loop

                if (fromIndex === toIndex) {

                    const loopY = fromPosition.y - 50;

                    svg += `
                        <path
                            d="
                                M ${fromPosition.x - 16} ${fromPosition.y - 27}
                                C ${fromPosition.x - 75} ${loopY - 45},
                                  ${fromPosition.x + 75} ${loopY - 45},
                                  ${fromPosition.x + 16} ${fromPosition.y - 27}
                            "
                            fill="none"
                            stroke="#a69cff"
                            stroke-width="2"
                            marker-end="url(#dfaArrow)"
                        />

                        <text
                            x="${fromPosition.x}"
                            y="${fromPosition.y - 88}"
                            fill="#ffffff"
                            font-size="14"
                            text-anchor="middle">
                            ${escapeHTML(symbols.join(", "))}
                        </text>
                    `;

                } else {

                    const dx = toPosition.x - fromPosition.x;
                    const dy = toPosition.y - fromPosition.y;

                    const distance = Math.sqrt(dx * dx + dy * dy);

                    const unitX = dx / distance;
                    const unitY = dy / distance;

                    const startX =
                        fromPosition.x + unitX * stateRadius;

                    const startY =
                        fromPosition.y + unitY * stateRadius;

                    const endX =
                        toPosition.x - unitX * (stateRadius + 8);

                    const endY =
                        toPosition.y - unitY * (stateRadius + 8);

                    const curveDirection =
                        fromIndex < toIndex ? 1 : -1;

                    const curve = 28 * curveDirection;

                    const midX = (startX + endX) / 2;
                    const midY = (startY + endY) / 2;

                    const controlX =
                        midX - unitY * curve;

                    const controlY =
                        midY + unitX * curve;

                    svg += `
                        <path
                            d="
                                M ${startX} ${startY}
                                Q ${controlX} ${controlY}
                                  ${endX} ${endY}
                            "
                            fill="none"
                            stroke="#a69cff"
                            stroke-width="2"
                            marker-end="url(#dfaArrow)"
                        />

                        <text
                            x="${controlX}"
                            y="${controlY - 8}"
                            fill="#ffffff"
                            font-size="14"
                            text-anchor="middle">
                            ${escapeHTML(symbols.join(", "))}
                        </text>
                    `;

                }

            }

        );

    });

    // Draw initial state arrow

    const initialPosition = positions[0];

    svg += `
        <path
            d="
                M ${initialPosition.x - 85}
                  ${initialPosition.y}
                L ${initialPosition.x - stateRadius - 5}
                  ${initialPosition.y}
            "
            stroke="#25c58a"
            stroke-width="2.5"
            fill="none"
            marker-end="url(#dfaArrow)"
        />

        <text
            x="${initialPosition.x - 87}"
            y="${initialPosition.y - 12}"
            fill="#25c58a"
            font-size="12"
            text-anchor="middle">
            START
        </text>
    `;

    // Draw DFA states

    states.forEach((state, index) => {

        const position = positions[index];
        const final = isFinal(state);
        const label = stateName(index);

        const subset = state.length
            ? state.join(",")
            : "∅";

        // Outer circle

        svg += `
            <circle
                cx="${position.x}"
                cy="${position.y}"
                r="${stateRadius}"
                fill="#24234d"
                stroke="${final ? "#25c58a" : "#a69cff"}"
                stroke-width="2.5"
            />
        `;

        // Inner circle for final state

        if (final) {

            svg += `
                <circle
                    cx="${position.x}"
                    cy="${position.y}"
                    r="${stateRadius - 6}"
                    fill="none"
                    stroke="#25c58a"
                    stroke-width="2"
                />
            `;

        }

        // DFA state name

        svg += `
            <text
                x="${position.x}"
                y="${position.y + 5}"
                fill="#ffffff"
                font-size="17"
                font-weight="bold"
                text-anchor="middle">
                ${label}
            </text>

            <text
                x="${position.x}"
                y="${position.y + 53}"
                fill="#c4bdff"
                font-size="13"
                text-anchor="middle">
                {${escapeHTML(subset)}}
            </text>
        `;

    });

    svg += "</svg>";

    container.innerHTML = svg;

}


// ============================================
// 11. DISPLAY SUBSET CONSTRUCTION STEPS
// ============================================

function displaySteps(dfa) {

    let html = "";

    dfa.steps.forEach((step, index) => {

        html += `
            <div class="step-card">

                <h3>Step ${index + 1}</h3>

                <p>
                    Current DFA State:
                    <b>{${escapeHTML(step.current)}}</b>
                </p>

                <p>
                    Input Symbol:
                    <b>${escapeHTML(step.symbol)}</b>
                </p>

                <p>
                    Next DFA State:
                    <b>{${escapeHTML(step.next)}}</b>
                </p>

            </div>
        `;

    });

    stepsContainer.innerHTML = html;

}


// ============================================
// 12. DISPLAY GENERATED DFA SUMMARY
// ============================================

function displayDFASummary(dfa) {

    const finalCount = dfa.finalStates.length;

    dfaSummary.innerHTML = `

        <div class="summary-grid">

            <div class="summary-card">
                <p>Total DFA States</p>
                <h3>${dfa.states.length}</h3>
            </div>

            <div class="summary-card">
                <p>Initial State</p>
                <h3>{${escapeHTML(dfa.startState.join(","))}}</h3>
            </div>

            <div class="summary-card">
                <p>Final States</p>
                <h3>${finalCount}</h3>
            </div>

        </div>
    `;

}


// ============================================
// 13. DISPLAY DFA TRANSITION TABLE
// ============================================

function displayDFATable(nfa, dfa) {

    let html = `
        <table>
            <thead>
                <tr>
                    <th>DFA State</th>
    `;

    nfa.alphabet.forEach(symbol => {
        html += `<th>${escapeHTML(symbol)}</th>`;
    });

    html += `
                    <th>Type</th>
                </tr>
            </thead>
            <tbody>
    `;

    dfa.states.forEach((state, index) => {

        const name = state.join(",");

        const isStart = index === 0;

        const isFinal = dfa.finalStates.some(
            finalState => finalState.join(",") === name
        );

        let type = [];

        if (isStart) type.push("Start");
        if (isFinal) type.push("Final");

        if (type.length === 0) {
            type.push("Normal");
        }

        html += `
            <tr>
                <td>{${escapeHTML(name) || "∅"}}</td>
        `;

        nfa.alphabet.forEach(symbol => {

            const next = dfa.transitions[name][symbol];

            html += `<td>{${escapeHTML(next) || "∅"}}</td>`;

        });

        html += `
                <td>${type.join(" / ")}</td>
            </tr>
        `;

    });

    html += `
            </tbody>
        </table>
    `;

    dfaTable.innerHTML = html;

}


// ============================================
// 14. CONVERT BUTTON
// ============================================

convertBtn.addEventListener("click", function () {

    try {

        errorMessage.textContent = "";

        // Validate NFA

        nfa = validateNFA();

        // Display original NFA table and diagram

        displayNFATable(nfa);
        displayNFADiagram(nfa);

        // Apply subset construction

        dfa = convertNFAtoDFA(nfa);

        // Display generated DFA

        displaySteps(dfa);
        displayDFASummary(dfa);
        displayDFATable(nfa, dfa);

        // Generate DFA diagram

        displayDFADiagram(nfa, dfa);

        // Clear previous testing result

        document.getElementById("testResult").innerHTML = "";

    } catch (error) {

        errorMessage.textContent = error.message;

        nfa = null;
        dfa = null;

        nfaTable.innerHTML = "";
        stepsContainer.innerHTML = "";
        dfaSummary.innerHTML = "";
        dfaTable.innerHTML = "";

        document.getElementById("nfaDiagram").innerHTML =
            '<p class="placeholder">NFA diagram will appear here.</p>';

        document.getElementById("dfaDiagram").innerHTML =
            '<p class="placeholder">DFA diagram will appear here.</p>';

    }

});


// ============================================
// 15. TEST STRING USING GENERATED DFA
// ============================================

testBtn.addEventListener("click", function () {

    const input = document.getElementById("testString").value;
    const resultBox = document.getElementById("testResult");

    // Check whether DFA is generated

    if (!dfa || !nfa) {

        resultBox.innerHTML = `
            <div class="test-result rejected">
                <h3>Please generate DFA first!</h3>
                <p>Click Convert NFA to DFA before testing.</p>
            </div>
        `;

        return;
    }

    // Check invalid input symbols

    for (let symbol of input) {

        if (!nfa.alphabet.includes(symbol)) {

            resultBox.innerHTML = `
                <div class="test-result rejected">
                    <h3>Invalid Input!</h3>
                    <p>
                        Symbol "${escapeHTML(symbol)}" is not in the alphabet.
                    </p>
                </div>
            `;

            return;
        }

    }

    // Start from initial DFA state

    let currentState = dfa.startState.join(",");

    let path = [currentState || "∅"];

    // Process every input symbol

    for (let symbol of input) {

        currentState = dfa.transitions[currentState][symbol];

        path.push(currentState || "∅");

    }

    // Check final state

    const accepted = dfa.finalStates.some(
        state => state.join(",") === currentState
    );

    // Display state traversal

    let pathHTML = path.map((state, index) => {

        return `
            <p>
                Step ${index + 1}:
                <b>{${escapeHTML(state)}}</b>
                ${index < path.length - 1 ? " →" : ""}
            </p>
        `;

    }).join("");

    // Display result

    resultBox.innerHTML = `

        <div class="test-result ${accepted ? "" : "rejected"}">

            <h3>
                ${accepted ? "✓ String Accepted!" : "✗ String Rejected!"}
            </h3>

            <p>
                Input String:
                ${input === "" ? "ε (Empty String)" : escapeHTML(input)}
            </p>

            <p>
                Final DFA State:
                {${escapeHTML(currentState) || "∅"}}
            </p>

            <br>

            <h4>State Traversal:</h4>

            ${pathHTML}

        </div>
    `;

});
