# AutoMatica – NFA to DFA Simulator

An interactive Automata Theory project that converts a **Non-Deterministic Finite Automaton (NFA)** into an equivalent **Deterministic Finite Automaton (DFA)** using the **Subset Construction Algorithm**.

## 📌 About the Project

AutoMatica is a web-based simulator designed to help students understand how NFA-to-DFA conversion works.

Users can define their own NFA by entering states, input alphabets, initial state, final states, and transition rules. The simulator then generates the equivalent DFA and displays the conversion process visually.

## ✨ Features

- **NFA Input:** Define states, alphabets, initial state, final states, and transitions.
- **Load Example:** Load a sample NFA to explore the simulator.
- **NFA Transition Table:** Display the original NFA transitions.
- **NFA State Diagram:** Visualize the input NFA with initial and final states.
- **Subset Construction:** Understand the step-by-step conversion process.
- **DFA Generation:** Automatically generate equivalent DFA states and transitions.
- **DFA Transition Table:** Display the generated DFA transition table.
- **DFA State Diagram:** Visualize the generated DFA.
- **String Testing:** Test input strings to check whether they are accepted or rejected by the DFA.
- **Reset Option:** Clear inputs and generated results to start again.

## 🛠️ Technologies Used

- HTML5 – Structure of the application
- CSS3 – Styling and responsive user interface
- JavaScript – NFA-to-DFA conversion logic and interactive functionality
- SVG – State diagram visualization

## 📂 Project Structure

```text
NFA-to-DFA-Simulator/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## 🚀 How to Run the Project

1. Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/NFA-to-DFA-Simulator.git
```

2. Open the project folder:

```bash
cd NFA-to-DFA-Simulator
```

3. Open `index.html` in your web browser.

No additional dependencies or installations are required.

## ⚙️ How It Works

1. Enter the NFA details.
2. Define transitions using the format:

```text
currentState,inputSymbol,nextState
```

Example:

```text
q0,a,q0
q0,a,q1
q0,b,q0
q1,b,q2
```

3. Click **Convert NFA to DFA**.
4. The simulator applies the Subset Construction Algorithm.
5. View the generated DFA transition table and state diagram.
6. Enter a string and click **Test String** to check acceptance or rejection.

## 🎯 Objective

The main objective of this project is to provide an interactive learning environment for understanding finite automata and the conversion of NFA into DFA.

## 👩‍💻 Contributors

- Member 1
- Member 2
- Member 3

---

**AutoMatica – Making Automata Theory Interactive!**
