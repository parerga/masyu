# Masyu
Application for creating, editing and solving [Masyu puzzle](https://en.wikipedia.org/wiki/Masyu).

**Puzzle rules**
>Masyu is played on a rectangular grid of squares, some of which contain circles; each circle is either "white" (empty) or "black" (filled). The goal is to draw a single continuous non-intersecting loop that properly passes through all circled cells. The loop must "enter" each cell it passes through from the center of one of its four sides and "exit" from a different side; all turns are therefore 90 degrees.
> 
>The two varieties of circle have differing requirements for how the loop must pass through them:
> 
>* White circles must be traveled straight through, but the loop must turn in the previous and/or next cell in its path.
>* Black circles must be turned upon, but the loop must travel straight through the next and previous cells in its path.

**Note:** Generating and solving puzzle can take several minutes, especially for large boards.

## Build
To compile the project, you need [Node.js](https://nodejs.org/) 12 or 14+ and [TypeScript](https://www.typescriptlang.org/) compiler version 4.3.5 or higher.

To install the TypeScript compiler locally:
```
npm install
```

To compile the project (the result of compilation will be in the `dist` directory):
```
npm run build
```

To launch:
```
npm run start
```
