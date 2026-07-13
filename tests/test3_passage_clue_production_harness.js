"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const CORE_PATH = path.join(ROOT, "academic/shared/reading-feature-shell-core.js");
const HTML_PATH = path.join(ROOT, "academic/cambridge-16/test-3/IELTS16 Test 3 - Academic Reading.html");

class ClassList {
  constructor(owner) { this.owner = owner; }
  values() { return String(this.owner.className || "").split(/\s+/).filter(Boolean); }
  contains(name) { return this.values().includes(name); }
  add(...names) { this.owner.className = Array.from(new Set(this.values().concat(names))).join(" "); }
  remove(...names) { this.owner.className = this.values().filter((name) => !names.includes(name)).join(" "); }
}

class BaseNode {
  constructor() { this.parentNode = null; }
  get parentElement() { return this.parentNode instanceof ElementNode ? this.parentNode : null; }
  replaceWith(node) {
    const parent = this.parentNode;
    if (!parent) return;
    const index = parent.childNodes.indexOf(this);
    if (index < 0) return;
    node.parentNode = parent;
    parent.childNodes.splice(index, 1, node);
    this.parentNode = null;
  }
  remove() {
    if (!this.parentNode) return;
    const index = this.parentNode.childNodes.indexOf(this);
    if (index >= 0) this.parentNode.childNodes.splice(index, 1);
    this.parentNode = null;
  }
}

class TextNode extends BaseNode {
  constructor(value) { super(); this.nodeValue = String(value); }
  get textContent() { return this.nodeValue; }
  set textContent(value) { this.nodeValue = String(value); }
}

function matchesSimple(node, selector) {
  if (!(node instanceof ElementNode)) return false;
  if (selector.includes(",")) return selector.split(",").some((part) => matchesSimple(node, part.trim()));
  const match = selector.match(/^(?:([a-zA-Z]+))?(?:\.([\w-]+))?(?:\[([\w-]+)(?:="([^"]*)")?\])?$/);
  if (!match) return false;
  if (match[1] && node.tagName !== match[1].toUpperCase()) return false;
  if (match[2] && !node.classList.contains(match[2])) return false;
  if (match[3] && node.getAttribute(match[3]) === null) return false;
  if (match[4] !== undefined && node.getAttribute(match[3]) !== match[4]) return false;
  return true;
}

function descendants(node) {
  const found = [];
  for (const child of node.childNodes || []) {
    if (child instanceof ElementNode) found.push(child);
    found.push(...descendants(child));
  }
  return found;
}

class ElementNode extends BaseNode {
  constructor(tagName) {
    super();
    this.tagName = String(tagName).toUpperCase();
    this.childNodes = [];
    this.attributes = new Map();
    this.className = "";
    this.classList = new ClassList(this);
    this.listeners = new Map();
    this.hidden = false;
    this.disabled = false;
  }
  append(...nodes) {
    for (let node of nodes) {
      if (typeof node === "string") node = new TextNode(node);
      if (node.parentNode) node.remove();
      node.parentNode = this;
      this.childNodes.push(node);
    }
  }
  get textContent() { return this.childNodes.map((child) => child.textContent).join(""); }
  set textContent(value) { this.childNodes = []; if (value !== "") this.append(new TextNode(value)); }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === "class") this.className = String(value);
    if (name === "id") this.id = String(value);
  }
  getAttribute(name) {
    if (name === "class") return this.className || null;
    if (name === "id" && this.id) return this.id;
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }
  removeAttribute(name) { this.attributes.delete(name); if (name === "id") delete this.id; }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }
  click() {
    const event = { stopPropagation() {} };
    for (const listener of this.listeners.get("click") || []) listener.call(this, event);
  }
  querySelectorAll(selector) {
    const parts = selector.trim().split(/\s+/);
    return descendants(this).filter((candidate) => {
      if (!matchesSimple(candidate, parts[parts.length - 1])) return false;
      let ancestor = candidate.parentElement;
      for (let index = parts.length - 2; index >= 0; index--) {
        while (ancestor && !matchesSimple(ancestor, parts[index])) ancestor = ancestor.parentElement;
        if (!ancestor) return false;
        ancestor = ancestor.parentElement;
      }
      return true;
    });
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) {
    let current = this;
    while (current) { if (matchesSimple(current, selector)) return current; current = current.parentElement; }
    return null;
  }
  normalize() {
    for (const child of this.childNodes.slice()) if (child instanceof ElementNode) child.normalize();
    for (let index = 1; index < this.childNodes.length;) {
      const previous = this.childNodes[index - 1];
      const current = this.childNodes[index];
      if (previous instanceof TextNode && current instanceof TextNode) {
        previous.nodeValue += current.nodeValue;
        current.parentNode = null;
        this.childNodes.splice(index, 1);
      } else index++;
    }
  }
  scrollIntoView() { this.scrolled = true; }
  focus() { this.focused = true; }
}

class TestDocument {
  constructor() {
    this.root = new ElementNode("main");
    this.surroundCount = 0;
    this.failOnSurround = null;
  }
  createElement(tagName) { return new ElementNode(tagName); }
  createTextNode(value) { return new TextNode(value); }
  getElementById(id) { return descendants(this.root).find((node) => node.id === id) || null; }
  querySelectorAll(selector) { return this.root.querySelectorAll(selector); }
  querySelector(selector) { return this.root.querySelector(selector); }
  createTreeWalker(root, _show, filter) {
    const textNodes = [];
    (function visit(node) {
      for (const child of node.childNodes || []) {
        if (child instanceof TextNode) {
          if (filter.acceptNode(child) === 1) textNodes.push(child);
        } else visit(child);
      }
    })(root);
    let index = 0;
    return { nextNode() { return textNodes[index++] || null; } };
  }
  createRange() {
    const document = this;
    let node = null;
    let start = 0;
    let end = 0;
    return {
      setStart(target, offset) { node = target; start = offset; },
      setEnd(target, offset) { assert.strictEqual(target, node); end = offset; },
      surroundContents(mark) {
        document.surroundCount++;
        if (document.failOnSurround === document.surroundCount) throw new Error("forced late surround failure");
        assert(node instanceof TextNode && node.parentNode, "range must target a live text node");
        const parent = node.parentNode;
        const position = parent.childNodes.indexOf(node);
        const original = node.nodeValue;
        const before = original.slice(0, start);
        const selected = original.slice(start, end);
        const after = original.slice(end);
        node.nodeValue = before;
        mark.parentNode = parent;
        mark.append(new TextNode(selected));
        const replacements = [node, mark];
        if (after) { const tail = new TextNode(after); tail.parentNode = parent; replacements.push(tail); }
        parent.childNodes.splice(position, 1, ...replacements);
      }
    };
  }
}

function decodeHtml(value) {
  return value.replace(/<[^>]+>/g, "").replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code) => {
    if (code[0] === "#") return String.fromCodePoint(parseInt(code.slice(code[1].toLowerCase() === "x" ? 2 : 1), code[1].toLowerCase() === "x" ? 16 : 10));
    return ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " })[code.toLowerCase()] || entity;
  });
}

function buildPassages(document, html) {
  const starts = Array.from(html.matchAll(/<div class="passage-section" data-section="(\d)"[^>]*>/g));
  const divider = html.indexOf('<div class="divider" id="divider"></div>');
  for (let index = 0; index < starts.length; index++) {
    const start = starts[index];
    const end = index + 1 < starts.length ? starts[index + 1].index : divider;
    const section = new ElementNode("section");
    section.className = "passage-section";
    section.setAttribute("data-section", start[1]);
    const body = html.slice(start.index + start[0].length, end);
    for (const paragraphMatch of body.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g)) {
      const paragraph = new ElementNode("p");
      paragraph.append(new TextNode(decodeHtml(paragraphMatch[1])));
      section.append(paragraph);
    }
    document.root.append(section);
  }
}

function wording(node) {
  if (node instanceof TextNode) return node.nodeValue;
  if (node.tagName === "BUTTON") return "";
  return node.childNodes.map(wording).join("");
}

const document = new TestDocument();
buildPassages(document, fs.readFileSync(HTML_PATH, "utf8"));
const toolbar = new ElementNode("div"); toolbar.id = "passageClueToolbar";
const toggle = new ElementNode("button"); toggle.id = "passageClueToggle"; toggle.textContent = "Show all passage clues"; toggle.setAttribute("aria-pressed", "false");
toolbar.append(toggle); document.root.append(toolbar);

let activePart = 1;
let navigatedQuestion = null;
const targets = new Map();
const sandbox = {
  window: null,
  document,
  NodeFilter: { SHOW_TEXT: 4, FILTER_ACCEPT: 1, FILTER_REJECT: 2 },
  console,
  matchMedia: () => ({ matches: true }),
  requestAnimationFrame: (callback) => callback(),
  setTimeout: (callback) => { callback(); return 1; },
  clearTimeout() {},
  setInterval() { return 1; },
  clearInterval() {},
  switchSection(part) { activePart = part; }
};
sandbox.window = sandbox;

let source = fs.readFileSync(CORE_PATH, "utf8");
source = source.replace("\n})(window);", `\n  global.__passageClueTestHooks = {\n    configure: function (value) { config = value; },\n    renderFullPassageClueMap: renderFullPassageClueMap,\n    showAllPassageClues: showAllPassageClues,\n    hideAllPassageClues: hideAllPassageClues,\n    showEvidence: showEvidence,\n    syncPassageClueToolbar: syncPassageClueToolbar,\n    fullMapIsRendered: fullMapIsRendered\n  };\n})(window);`);
vm.runInNewContext(source, sandbox, { filename: CORE_PATH });

const hooks = sandbox.__passageClueTestHooks;
hooks.configure({
  test: { partRanges: { 1: { from: 1, to: 13 }, 2: { from: 14, to: 26 }, 3: { from: 27, to: 40 } } },
  state: { getMode: () => "study", isTestSubmitted: () => false, getActivePart: () => activePart },
  navigation: { getQuestionTarget(question) {
    navigatedQuestion = question;
    if (!targets.has(question)) targets.set(question, new ElementNode("div"));
    return targets.get(question);
  } }
});

const passage = (part) => document.querySelector(`.passage-section[data-section="${part}"]`);
const marks = (part) => passage(part).querySelectorAll(".reading-shell-evidence-highlight");
const badges = (part) => passage(part).querySelectorAll(".reading-shell-clue-badge");
const nested = (part) => passage(part).querySelectorAll(".reading-shell-evidence-highlight .reading-shell-evidence-highlight");
const originals = new Map([1, 2, 3].map((part) => [part, wording(passage(part))]));
const metadataMark = (part, questions) => marks(part).find((mark) => mark.getAttribute("data-reading-shell-clue-questions") === questions);

activePart = 1;
hooks.showAllPassageClues(1); hooks.syncPassageClueToolbar(true);
assert.strictEqual(marks(1).length, 13);
assert.strictEqual(badges(1).length, 13);
assert.strictEqual(wording(passage(1)), originals.get(1));
hooks.showEvidence(1);
assert.strictEqual(marks(1).filter((mark) => mark.classList.contains("reading-shell-evidence-focus")).length, 1);
hooks.showEvidence(2);
assert(metadataMark(1, "2").classList.contains("reading-shell-evidence-focus"));
assert.strictEqual(marks(1).length, 13);
assert.strictEqual(badges(1).length, 13);
assert.strictEqual(toggle.textContent, "Hide all passage clues");
assert.strictEqual(toggle.getAttribute("aria-pressed"), "true");

activePart = 2;
hooks.showAllPassageClues(2); hooks.syncPassageClueToolbar(true);
assert(metadataMark(2, "21 22"));
assert(metadataMark(2, "18 25"));
assert.strictEqual(badges(2).length, 13);
const beforeBadgeNavigation = marks(2).length;
badges(2).find((badge) => badge.getAttribute("data-reading-shell-clue-question") === "21").click();
assert.strictEqual(navigatedQuestion, 21);
assert.strictEqual(marks(2).length, beforeBadgeNavigation);
assert(hooks.fullMapIsRendered(2));

activePart = 3;
hooks.showAllPassageClues(3); hooks.syncPassageClueToolbar(true);
assert(metadataMark(3, "30 34"));
assert.notStrictEqual(metadataMark(3, "36"), metadataMark(3, "38"));
assert.strictEqual(nested(3).length, 0);
assert.strictEqual(new Set(badges(3).map((badge) => badge.getAttribute("data-reading-shell-clue-question"))).size, 14);
assert.strictEqual(wording(passage(3)), originals.get(3));

activePart = 1;
hooks.hideAllPassageClues(1); hooks.syncPassageClueToolbar(true);
hooks.showEvidence(1);
assert.strictEqual(marks(1).length, 1);
assert.strictEqual(hooks.fullMapIsRendered(1), false);
assert.strictEqual(toggle.textContent, "Show all passage clues");
assert.strictEqual(toggle.getAttribute("aria-pressed"), "false");
hooks.hideAllPassageClues(1);
assert.strictEqual(wording(passage(1)), originals.get(1));

document.surroundCount = 0;
document.failOnSurround = 2;
hooks.showAllPassageClues(1); hooks.syncPassageClueToolbar(true);
assert(document.surroundCount >= 2);
assert.strictEqual(marks(1).length, 0);
assert.strictEqual(badges(1).length, 0);
assert.strictEqual(nested(1).length, 0);
assert.strictEqual(wording(passage(1)), originals.get(1));
assert.strictEqual(hooks.fullMapIsRendered(1), false);
assert.strictEqual(toggle.textContent, "Show all passage clues");
assert.strictEqual(toggle.getAttribute("aria-pressed"), "false");

document.surroundCount = 0;
document.failOnSurround = null;
hooks.showAllPassageClues(1); hooks.syncPassageClueToolbar(true);
assert.strictEqual(marks(1).length, 13);
assert.strictEqual(badges(1).length, 13);
assert.strictEqual(nested(1).length, 0);
assert.strictEqual(wording(passage(1)), originals.get(1));
assert.strictEqual(toggle.textContent, "Hide all passage clues");
assert.strictEqual(toggle.getAttribute("aria-pressed"), "true");

process.stdout.write(JSON.stringify({ productionCoreExecuted: true, forcedFailureRolledBack: true, assertions: 40 }));
