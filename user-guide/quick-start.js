import {LitElement, css, html} from '../vendor/lit-element.min.js'
import {registerContextChangeHandler, useContext} from './context.js'
import {ApiFetch, hasDebugBackend} from './api-fetch.js'
import {updateCredentials} from './snapshot.js'

export class QuickStart extends LitElement {
  static get styles() {
    return css`
article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
main,
nav,
section,
summary {
    display: block
}

audio,
canvas,
video {
    display: inline-block
}

audio:not([controls]) {
    display: none;
    height: 0
}

[hidden] {
    display: none
}

html {
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%
}

body,
figure {
    margin: 0
}

a:focus {
    outline: thin dotted
}

a:active,
a:hover {
    outline: 0
}

h1 {
    font-size: 2em;
    margin: .67em 0
}

abbr[title] {
    border-bottom: 1px dotted
}

b,
strong {
    font-weight: 700
}

dfn {
    font-style: italic
}

hr {
    box-sizing: content-box;
    height: 0
}

mark {
    background: #ff0;
    color: #000
}

code,
kbd,
pre,
samp {
    font-family: monospace, serif;
    font-size: 1em
}

pre {
    white-space: pre-wrap
}

q {
    quotes: "\\201C" "\\201D" "\\2018" "\\2019"
}

small {
    font-size: 80%
}

sub,
sup {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline
}

sup {
    top: -.5em
}

sub {
    bottom: -.25em
}

img {
    border: 0
}

svg:not(:root) {
    overflow: hidden
}

fieldset {
    border: 1px solid silver;
    margin: 0 2px;
    padding: .35em .625em .75em
}

legend {
    border: 0;
    padding: 0
}

button,
input,
select,
textarea {
    font-family: inherit;
    font-size: 100%;
    margin: 0
}

button,
input {
    line-height: normal
}

button,
select {
    text-transform: none
}

button,
html input[type=button],
input[type=reset],
input[type=submit] {
    -webkit-appearance: button;
    cursor: pointer
}

button[disabled],
html input[disabled] {
    cursor: default
}

input[type=checkbox],
input[type=radio] {
    box-sizing: border-box;
    padding: 0
}

input[type=search] {
    -webkit-appearance: textfield;
    box-sizing: content-box
}

input[type=search]::-webkit-search-cancel-button,
input[type=search]::-webkit-search-decoration {
    -webkit-appearance: none
}

button::-moz-focus-inner,
input::-moz-focus-inner {
    border: 0;
    padding: 0
}

*,
textarea {
    vertical-align: top
}

textarea {
    overflow: auto
}

table {
    border-collapse: collapse;
    border-spacing: 0
}

* {
    margin: 0;
    padding: 0;
    border: 0;
    position: relative;
    box-sizing: border-box
}

.alpha .col_left .logo,
body,
html,
navigation a,
navigation a .label,
navigation a .label .icon {
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center
}

body,
html {
    height: 100%;
    color: #000;
    font-family: 'Source Sans Pro', sans-serif;
    font-size: 16px;
    background: #000;
    -webkit-font-smoothing: antialiased
}

a {
    color: #333;
    text-decoration: none
}

.login .content_con .card_con .card .cta_download:hover,
a:hover {
    color: #5f3eff
}

.alpha,
.alpha .col_left,
.alpha .col_right {
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex
}

.alpha {
    padding: 0;
    margin: auto;
    max-width: 1440px;
    position: relative;
    -webkit-flex: 1 1 auto;
    -ms-flex: 1 1 auto;
    flex: 1 1 auto;
    min-height: 100%
}

.alpha .col_left,
.alpha .col_right {
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column
}

.alpha .col_left {
    background: #2e3147;
    -webkit-flex: 0 0 250px;
    -ms-flex: 0 0 250px;
    flex: 0 0 250px
}

.alpha .col_left .logo,
navigation a,
navigation a .label,
navigation a .label .icon {
    -webkit-align-content: center;
    -ms-flex-line-pack: center;
    align-content: center
}

.alpha .col_left .logo {
    -webkit-flex: 0 0 80px;
    -ms-flex: 0 0 80px;
    flex: 0 0 80px;
    background: #5f3eff;
    padding: 0
}

.alpha .col_left .logo img {
    width: 90%;
    max-width: 175px
}

.alpha .col_right {
    -webkit-flex: 3 0 auto;
    -ms-flex: 3 0 auto;
    flex: 3 0 auto;
    background: #f3f3f3
}

navigation {
    display: block;
    width: 100%
}

navigation a {
    padding: 0;
    text-decoration: none;
    height: 60px;
    transition: all .9s ease
}

navigation a .selected_stripe {
    -webkit-flex: 0 0 10px;
    -ms-flex: 0 0 10px;
    flex: 0 0 10px;
    background: #ff4329;
    min-height: 100%;
    opacity: 0
}

navigation a,
navigation a .label,
navigation a .label .icon {
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center
}

navigation a .label {
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    margin-left: 6%;
    -webkit-flex: 3 0 0;
    -ms-flex: 3 0 0px;
    flex: 3 0 0
}

navigation a .label .icon {
    height: 100%;
    -webkit-flex: 0 0 25px;
    -ms-flex: 0 0 25px;
    flex: 0 0 25px
}

navigation a .label .icon svg,
navigation a.selected .label .icon svg {
    width: 100%;
    height: auto;
    max-height: 35px
}

navigation a .label .icon svg path,
navigation a .label .icon svg polygon,
navigation a .label .icon svg rect {
    fill: #9a9a9a;
    transition: fill .7s ease
}

navigation a .label .name {
    -webkit-flex: 1 0 auto;
    -ms-flex: 1 0 auto;
    flex: 1 0 auto;
    color: #9a9a9a;
    padding-left: 20px;
    font-size: 1rem;
    transition: all .7s ease
}

navigation a:hover {
    background: #363a58;
    transition: all .8s ease
}

navigation a:hover .label .icon svg path,
navigation a:hover .label .icon svg polygon,
navigation a:hover .label .icon svg rect {
    fill: #53f7d2;
    transition: fill .7s ease
}

navigation a:hover .label .name {
    color: #53f7d2;
    transition: all .7s ease
}

navigation a.selected {
    background: #5f3eff;
    transition: all 2.8s ease
}

navigation a.selected .selected_stripe {
    -webkit-flex: 0 0 10px;
    -ms-flex: 0 0 10px;
    flex: 0 0 10px;
    background: #ff4329;
    min-height: 100%;
    opacity: 1
}

.content,
navigation a.selected .label {
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex
}

navigation a.selected .label,
navigation a.selected .label .icon {
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-align-content: center;
    -ms-flex-line-pack: center;
    align-content: center
}

navigation a.selected .label {
    margin-left: 6%;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-flex: 3 0 0;
    -ms-flex: 3 0 0px;
    flex: 3 0 0
}

navigation a.selected .label .icon {
    height: 100%;
    -webkit-flex: 0 0 25px;
    -ms-flex: 0 0 25px;
    flex: 0 0 25px;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center
}

navigation a.selected .label .icon svg path,
navigation a.selected .label .icon svg polygon,
navigation a.selected .label .icon svg rect {
    fill: #fff;
    transition: fill .7s ease
}

navigation a.selected .label .name {
    -webkit-flex: 1 0 auto;
    -ms-flex: 1 0 auto;
    flex: 1 0 auto;
    color: #fff;
    padding-left: 20px;
    font-size: 1rem;
    transition: all .7s ease
}

.content {
    width: 100%;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    max-width: 900px;
    margin: 0 auto;
    padding: 30px
}

.content .header_con,
.content a.button_large,
navigation a.selected .label {
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center
}

.content a.button_large {
    -webkit-align-content: center;
    -ms-flex-line-pack: center;
    align-content: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    background: #55acd1;
    border-radius: 15px;
    padding: 20px;
    width: 450px;
    color: #fff;
    transition: all .3s ease
}

.content a.button_large:hover {
    color: #fff;
    background: #2296c7;
    transition: all .9s ease
}

.content .header_con,
.content .header_con .col,
.content a.button_large {
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex
}

.content .header_con {
    margin: 30px 0 0;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row
}

.content .header_con .col {
    -webkit-flex: 0 0 80px;
    -ms-flex: 0 0 80px;
    flex: 0 0 80px;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column
}

.content .header_con .col svg {
    width: 100%;
    height: 60px
}

.content .header_con .col svg path,
.content .header_con .col svg stroke,
.login .content_con .card_con .card .cta_download:hover svg .cls-1 {
    fill: #5f3eff
}

.content .header_con .col:nth-child(2) {
    -webkit-flex: 2 0 0;
    -ms-flex: 2 0 0px;
    flex: 2 0 0;
    padding-left: 20px
}

.content .header_con .col h1 {
    padding: 0;
    margin: 0;
    font-weight: 400
}

.content .header_con .col p {
    margin: 0;
    padding: 0
}

.content .card,
.content .card .col .con {
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex
}

.content .card {
    background: #fff;
    border-radius: 10px;
    padding: 30px;
    box-shadow: 0 10px 5px -11px rgba(0, 0, 0, .6);
    width: 100%;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-flex: 1 1 1;
    -ms-flex: 1 1 1;
    flex: 1 1 1;
    margin: 30px 0 0
}

.content .card .col {
    -webkit-flex: 1 0 50%;
    -ms-flex: 1 0 50%;
    flex: 1 0 50%;
    padding: 0 30px 0 0
}

.content .card .col .con {
    margin: 10px 0;
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    -webkit-justify-content: flex-end;
    -ms-flex-pack: end;
    justify-content: flex-end;
    height: 30px
}

.content .card .col .con .pararen,
.content .card .col .con label {
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-align-content: center;
    -ms-flex-line-pack: center;
    align-content: center
}

.content .card .col .con label {
    display: inline-block;
    text-transform: uppercase;
    margin: 0 10px 0 0;
    padding: 0;
    font-size: 1rem
}

.content .card .col .con .bold {
    font-weight: 600
}

.content .card .col .con input {
    background: #efefef;
    padding: 5px
}

.content .card .col .con input.mapping {
    width: 80%
}

.content .card .col .con input.prefix,
.content .card .col .con input.services {
    width: 40%
}

.content .card .col .con .pararen {
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    font-size: 1.2rem;
    padding: 0 5px
}

.content .card .col,
.content .card .col .con label,
.content .card .col2,
.content .card .col2 a.cta .label {
    -webkit-align-self: center;
    -ms-flex-item-align: center;
    -ms-grid-row-align: center;
    align-self: center
}

.content .card .col2 a.cta {
    text-decoration: none;
    border: 2px #efefef solid;
    border-radius: 10px;
    width: 90px;
    padding: 6px 8px;
    -webkit-flex: auto;
    -ms-flex: auto;
    flex: auto;
    margin: 10px auto;
    color: #000;
    transition: all .2s ease
}

.content .card .col2 a.cta .label {
    text-transform: uppercase;
    font-size: .8rem;
    font-weight: 600;
    line-height: 1rem;
    padding: 0 0 0 10px;
    -webkit-flex: 1 0 auto;
    -ms-flex: 1 0 auto;
    flex: 1 0 auto
}

.content .card .col2 a.cta svg {
    width: 15px;
    height: auto
}

.content .card .col2 a.cta svg path,
.content .card .col2 a.cta svg polygon,
.content .card .col2 a.cta svg stroke {
    transition: fill .7s ease;
    fill: #000
}

.content .card .col2 a.cta:hover {
    color: #5f3eff;
    transition: all .2s ease;
    border: 2px #5f3eff solid
}

.content .card .col2 a.cta:hover svg path,
.content .card .col2 a.cta:hover svg polygon,
.content .card .col2 a.cta:hover svg stroke {
    transition: fill .2s ease;
    fill: #5f3eff
}

.content .card .col2 a.cta,
.content .card_small,
.content .row {
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row
}

.content .card_small {
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    background: #fff;
    border-radius: 10px;
    margin: 30px 0 0;
    box-shadow: 0 10px 15px -20px rgba(0, 0, 0, .8);
    padding: 20px;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    font-size: .9rem
}

.content .card_small .col {
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    padding: 10px 5px
}

.content .card_small .col:nth-child(1) {
    font-weight: 600
}

.content .card_small .col:nth-child(2) {
    -webkit-flex: 1.5;
    -ms-flex: 1.5;
    flex: 1.5
}

.content .card_small .row {
    -webkit-flex: 1 100%;
    -ms-flex: 1 100%;
    flex: 1 100%;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row
}

.content .card_small .row:nth-last-child(1) {
    border-bottom: none
}

.content .card_small .line {
    border-bottom: 1px solid rgba(0, 0, 0, .1)
}

.content .card_small .copy_button,
.content .card_small .image {
    width: 100%;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center
}

.content .card_small .image {
    -webkit-align-content: center;
    -ms-flex-line-pack: center;
    align-content: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center
}

.content .card_small .copy_button a,
.content .card_small .image a {
    display: block;
    width: 100%;
    text-align: center;
    font-size: 2rem
}

.content .card_small .copy_button a img,
.content .card_small .image a img {
    width: 50%;
    margin: auto
}

.content .card_small .copy_button {
    padding: 0 5px;
    height: 100px
}

.content .card_small .copy_button a {
    font-size: 4rem
}

.content .card_small .row_tall {
    -webkit-flex: 3;
    -ms-flex: 3;
    flex: 3
}

.content .margin-right {
    margin-right: 20px
}

.footer,
.login {
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column
}

.footer {
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    height: 100px
}

.login {
    height: 100%;
    max-width: 1440px
}

.login .header {
    width: 100%;
    height: 52px;
    text-align: right;
    background: #2e3147;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex
}

.login .header .logo,
.login .hero,
.login .hero .description .cta {
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-align-content: center;
    -ms-flex-line-pack: center;
    align-content: center
}

.login .header .logo {
    background: #5f3eff;
    padding: 0;
    -webkit-flex: 0 0 250px;
    -ms-flex: 0 0 250px;
    flex: 0 0 250px
}

.login .header .logo img {
    width: 85%;
    max-width: 165px
}

.login .hero,
.login .hero .description .cta {
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center
}

.login .hero {
    -webkit-flex: 1 auto;
    -ms-flex: 1 auto;
    flex: 1 auto;
    background: #fff url(../images/blackbird.svg) no-repeat
}

.login .hero .description {
    text-align: center
}

.login .hero .description h1 {
    color: #5f3eff;
    font-size: 2.5rem
}

.login .hero .description p {
    font-weight: 500
}

.login .content_con p span,
.login .hero .description p span {
    font-weight: 800
}

.login .hero .description .cta {
    padding: 20px;
    width: 80%;
    margin: auto
}

.login .hero .description .cta .copy {
    -webkit-flex: 2 0 0;
    -ms-flex: 2 0 0px;
    flex: 2 0 0;
    color: #6b46ff;
    border-radius: 10px;
    background: #e8e8e8;
    padding: 10px;
    margin-right: 10px
}

.login .content_con .card_con .card a.button,
.login .hero .description .cta a.button {
    -webkit-flex: 1 0 0;
    -ms-flex: 1 0 0px;
    flex: 1 0 0;
    border-radius: 5px;
    border: 2px solid #efefef;
    padding: 10px;
    text-transform: uppercase;
    font-size: .8rem;
    font-weight: 700;
    color: #6e6e6e;
    transition: all .3s ease
}

.login .content_con .card_con .card a.button svg,
.login .hero .description .cta a.button svg {
    margin-right: 3px
}

.login .hero .description .cta a.button svg path {
    fill: #333;
    transition: fill .3s ease
}

.login .content_con .card_con .card a.button:hover,
.login .hero .description .cta a.button:hover {
    border: 2px solid #5f3eff;
    color: #5f3eff;
    transition: all .4s ease
}

.login .content_con .card_con .card a.button:hover svg path,
.login .hero .description .cta a.button:hover svg path {
    fill: #5f3eff;
    transition: fill .4s ease
}

.login .content_con,
.login .content_con .card_con {
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    padding: 30px
}

.login .content_con {
    background: #f3f3f3;
    height: 345px;
    text-align: center;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-flex: auto;
    -ms-flex: auto;
    flex: auto
}

.login .content_con .card_con {
    -webkit-flex: 1 0 0;
    -ms-flex: 1 0 0px;
    flex: 1 0 0;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row
}

.login .content_con .card_con .card {
    padding: 20px;
    text-align: left;
    -webkit-flex: 1 1 200px;
    -ms-flex: 1 1 200px;
    flex: 1 1 200px
}

.login .content_con .card_con .card .subtitle {
    font-weight: 600;
    padding: 10px 0
}

.login .content_con .card_con .card .subtitle2 {
    font-weight: 600;
    margin-top: 30px;
    margin-bottom: 10px
}

.login .content_con .card_con .card .subtitle3 {
    margin-top: 10px;
    margin-bottom: 10px
}

.login .content_con .card_con .card .subtitle4 {
    margin-top: -12px;
    margin-bottom: 10px
}

.login .content_con .card_con .card .card_option1 {
    margin: 1px;
    padding: 3px 0px 10px 10px;
    border: 1px #ccc;
    border-style: none none none solid;
}

.login .content_con .card_con .card .card_option2 {
    margin: 1px;
    padding: 3px 0px 0px 10px;
    border: 1px #ccc;
    border-style: none none none solid;
}

.login .content_con .card_con .card .card_copy {
    -webkit-hyphens: auto;
    -ms-hyphens: auto;
    hyphens: auto;
    font-size: .8rem;
    background: #e9e9e9;
    border-radius: 10px;
    padding: 12px;
    width: 90%;
    margin-bottom: 20px
}

.login .content_con .card_con .card .title {
    font-weight: 800;
    font-size: 1.5rem
}

.login .content_con .card_con .card .cta_download {
    color: #37a4ff;
    font-weight: 600
}

.login .content_con .card_con .card .cta_download svg {
    height: 20px
}

.login .content_con .card_con .card .cta_download svg .cls-1 {
    fill: #37a4ff
}

.login .content_con .card_con .card a.button {
    width: 180px;
    border: 2px solid #ccc;
    padding: 8px;
    text-align: center
}

.login .content_con .card_con .card a.button svg path {
    fill: #6e6e6e;
    transition: fill .3s ease
}
`;
  }

  copyToKeyboard(theId) {
    const copyText = this.shadowRoot.getElementById(theId).innerText;
    const el = document.createElement('textarea');  // Create a <textarea> element
    el.value = copyText;                            // Set its value to the string that you want copied
    el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
    el.style.position = 'absolute';
    el.style.left = '-9999px';                      // Move outside the screen to make it invisible
    document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
    const selected =
      document.getSelection().rangeCount > 0        // Check if there is any content selected previously
        ? document.getSelection().getRangeAt(0)     // Store selection if found
        : false;                                    // Mark as false to know no selection existed before
    el.select();                                    // Select the <textarea> content
    document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
    document.body.removeChild(el);                  // Remove the <textarea> element
    if (selected) {                                 // If a selection existed before copying
      document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
      document.getSelection().addRange(selected);   // Restore the original selection
    }
  }

  copyLoginToKeyboard() {
    this.copyToKeyboard('login-cmd');
  }

  copyDarwinInstallToKeyboard() {
    this.copyToKeyboard('install-darwin');
  }

  copyLinuxInstallToKeyboard() {
    this.copyToKeyboard('install-linux');
  }

  copyWindowsInstallToKeyboard() {
    this.copyToKeyboard('install-windows');
  }



customElements.define('dw-login-page', LoginPage);

export class LoginGate extends LitElement {
  static get properties() {
    return {
      authenticated: Boolean,
      loading: Boolean,
      hasError: Boolean,
      os: String,
      namespace: String
    };
  }

  constructor() {
    super();

    this.hasError = false;
    this.loading = true;

    this.namespace = '';

    this.loadData();

    this.authenticated = useContext('auth-state', null)[0];
    registerContextChangeHandler('auth-state', this.onAuthChange.bind(this));
  }

  onAuthChange(auth) {
    if( this.authenticated !== auth ) {
      this.authenticated = auth;
      this.loading = false;

    }
  }

  loadData() {
    ApiFetch('/edge_stack/api/config/pod-namespace')
    //fetch('http://localhost:9000/edge_stack/api/config/pod-namespace', { mode:'no-cors'})
      .then(data => data.text()).then(body => {
        this.namespace = body;
        this.loading = false;
        this.hasError = false;
      })
      .catch((err) => {
        console.error(err);
        this.loading = false;
        this.hasError = true;
      });
  }

  renderError() {
    return html`
<dw-wholepage-error/>
    `;
  }

  renderLoading() {
    return html`
<p>Loading...</p>
    `;
  }

  updated(changedProperties) {
  }

  renderUnauthenticated() {
    return html`<dw-login-page namespace="${this.namespace}"></dw-login-page>`;
  }

  render() {
    if (this.hasError) {
      return this.renderError();
    } else if (this.loading) {
      return this.renderLoading();
    } else if (!this.authenticated) {
      return this.renderUnauthenticated();
    } else {
      return html`<slot></slot>`;
    }
  }
}

customElements.define('quick-start', QuickStart);
