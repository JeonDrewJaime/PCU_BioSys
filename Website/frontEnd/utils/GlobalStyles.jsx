import { createGlobalStyle } from 'styled-components';
import OldEnglishFont from '../src/assets/fonts/OldEnglish.ttf';

const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: 'OldEnglish';
    src: url(${OldEnglishFont}) format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  
  :root {
    --pri: #012763;
    --sec: #FFC800;
    --gray: #606369;


    /* Font Size Variables */
    --big-font: 4.5rem;
    --h2-font: 2.3rem;
    --p-font: 1.1rem;
  }

  body {
    font-family: sans-serif; 
    color: var(--text-color); 
    background-color: var(--white); 
    margin: 0;

  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'OneTrickPony'; /* Use OneTrickPony for headings */
    font-weight: 20; /* Lessen font weight for titles */
    color: var(--sec); /* Heading color */
  }

  h1 {
    font-size: var(--big-font); /* Use big font size */
  }

  h2 {
    font-size: var(--h2-font); /* Use h2 font size */
  }

  p {
    font-size: var(--p-font); /* Use paragraph font size */
    font-weight: 400; /* Set a specific font weight */
    color: var(--gray); /* Set paragraph color */
  }
`;

export default GlobalStyles;

