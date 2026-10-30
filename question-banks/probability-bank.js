// ============================================
// PROBABILITY I — question bank
// ============================================
// Pushed into window.CBT_SUBJECT_BANKS for processing by
// question-banks/question-loader.js.
//
// Format:
//   Subject: <name>
//   Topic:   <name>
//   Type:    MCQ | Theory | Fill
//   Q###:    <question text>
//   Option:  A: <text>   (MCQ only)
//   Answer:  <A|B|C|D|text>
//   Marks:   <number>    (Theory only)
//   Explanation: <text>  (multi-line OK)
// ============================================

window.CBT_SUBJECT_BANKS = window.CBT_SUBJECT_BANKS || [];
window.CBT_SUBJECT_BANKS.push(`

Subject: Probability I
Topic: Probability Space & Theorems
Type: MCQ
Q001: Define a sample space. What is the sample space for tossing a single fair coin?
Option: A: The set of all possible outcomes of an experiment; {Heads, Tails}
Option: B: The set of all possible outcomes of an experiment; {Tails}
Option: C: The set of favorable outcomes; {Heads, Tails}
Option: D: The set of all possible outcomes of an experiment; {Heads}
Answer: A
Explanation: A sample space is defined as the set of all possible outcomes of a random experiment. For a single fair coin toss, there are exactly two possible outcomes: Heads and Tails. Therefore, the sample space is {Heads, Tails}.

Type: MCQ
Q002: What is an event in probability? Give an example using a standard six-sided die.
Option: A: A subset of the sample space; Rolling a number greater than 4 is {5, 6}
Option: B: The complement of an outcome; Rolling a number greater than 4 is {1, 2, 3, 4}
Option: C: The total number of outcomes; Rolling a number greater than 4 is 2
Option: D: The probability of an outcome; Rolling a number greater than 4 is \\( \\frac{1}{3} \\)
Answer: A
Explanation: An event is defined as any subset of the sample space. For a six-sided die, the sample space is {1, 2, 3, 4, 5, 6}. Rolling a number greater than 4 includes the outcomes {5, 6}, which is a valid subset.

Topic: Probability Spacious
Type: MCQ
Q001: Define a sample space. What is the sample space for tossing a single fair coin?
Option: A: The set of all possible outcomes of an experiment; {Heads, Tails}
Option: B: The set of all possible outcomes of an experiment; {Tails}
Option: C: The set of favorable outcomes; {Heads, Tails}
Option: D: The set of all possible outcomes of an experiment; {Heads}
Answer: A
Explanation: A sample space is defined as the set of all possible outcomes of a random experiment. For a single fair coin toss, there are exactly two possible outcomes: Heads and Tails. Therefore, the sample space is {Heads, Tails}.

Type: MCQ
Q002: What is an event in probability? Give an example using a standard six-sided die.
Option: A: A subset of the sample space; Rolling a number greater than 4 is {5, 6}
Option: B: The complement of an outcome; Rolling a number greater than 4 is {1, 2, 3, 4}
Option: C: The total number of outcomes; Rolling a number greater than 4 is 2
Option: D: The probability of an outcome; Rolling a number greater than 4 is \\( \\frac{1}{3} \\)
Answer: A
Explanation: An event is defined as any subset of the sample space. For a six-sided die, the sample space is {1, 2, 3, 4, 5, 6}. Rolling a number greater than 4 includes the outcomes {5, 6}, which is a valid subset.

Type: Theory
Q001: Explain the concept of a sample space in probability.
Marks: 10
Explanation: A sample space, often denoted by the symbol S or Ω, is the fundamental foundation of probability theory. It is defined as the set of all possible, distinct outcomes that can result from a random experiment or procedure. For example, when tossing a single fair coin, the sample space consists of exactly two possibilities: {Heads, Tails}. Another example is rolling a standard six-sided die, where the sample space is {1, 2, 3, 4, 5, 6}. It is important to note that the sample space must be mutually exclusive and collectively exhaustive, meaning every possible outcome is listed, and no two outcomes can happen at the same time.

`);
