# ∴ spræ [![tests](https://github.com/dy/sprae/actions/workflows/node.js.yml/badge.svg)](https://github.com/dy/sprae/actions/workflows/node.js.yml) [![size](https://img.shields.io/bundlephobia/minzip/sprae?label=size)](https://bundlephobia.com/result?p=sprae) [![npm](https://img.shields.io/npm/v/sprae?color=orange)](https://npmjs.org/sprae)

> DOM microhydration with `:` attributes


## Usage

Sprae defines attributes starting with `:` as directives:

```html
<div id="container" :if="user">
  Logged in as <span :text="user.displayName">Guest.</span>
</div>

<script type="module">
  import sprae from 'sprae';

  const state = sprae(container, { user: { displayName: 'Dmitry Ivanov' } });
  state.user.displayName = 'dy'; // automatically updates DOM
</script>
```

* `sprae` initializes subtree with data and immediately evaporates `:` attrs.
* `state` is object reflecting current values, changing any of its props rerenders subtree in a tick.

<!--
<details>
<summary><strong>Autoinit</strong></summary>

sprae can be used without build step or JS, autoinitializing document:

```html
<script src="./sprae.js" defer init="{ count: 0 }"></script>

<span :text="count">
<button :on="{ click: e => count++ }">inc</button>
```

* `:with` defines data for regions of the tree to autoinit sprae on.
* `init` attribute tells sprae to automatically initialize document.

</details>
-->

## Attributes

#### `:if="condition"`, `:else`

Control flow of elements.

```html
<span :if="foo">foo</span>
<span :else :if="bar">bar</span>
<span :else>baz</span>
```

#### `:each="item, index in items"`

Multiply element. `index` value starts from 1.

```html
<ul>
  <li :each="item in items" :text="item">Untitled</li>
</ul>

<!-- Cases -->
<li :each="item, idx in list" />
<li :each="val, key in obj" />
<li :each="idx, idx0 in number" />

<!-- Loop by condition -->
<li :if="items" :each="item in items" :text="item" />
<li :else>Empty list</li>

<!-- Key items to reuse elements -->
<li :each="item in items" :key="item.id" :text="item.value" />

<!-- To avoid FOUC -->
<style>[:each]{visibility: hidden}</style>
```

#### `:text="value"`

Set text content of an element. Default text can be used as fallback:

```html
Welcome, <span :text="user.name">Guest</span>.
```

#### `:class="value"`

Set class value from either string, array or object. Appends existing `class` attribute, if any.

```html
<div :class="`foo ${bar}`"></div>
<div :class="['foo', 'bar']"></div>
<div :class="{foo: true, bar: false}"></div>

<div class="a" :class="['b', 'c']"></div>
<!--
<div class="a b c"></div>
-->
```

#### `:style="value"`

Set style value from object or a string. Extends existing `style` attribute, if any.

```html
<div :style="foo: bar"></div>
<div :style="{foo: 'bar'}"></div>
<div :style="{'--baz': qux}"></div>
```

#### `:value="value"`

Set value of an input, textarea or select. Takes handle of `checked` and `selected` attributes.

```html
<input :value="text" />
<textarea :value="text" />

<select :value="selected">
  <option :each="i in 5" :value="i" :text="i"></option>
</select>
```

#### `:<prop>="value?"`, `:="props?"`

Set any attribute value or run effect.

```html
<!-- Single property -->
<label :for="name" :text="name" />

<!-- Multiple properties -->
<input :id:name="name" />

<!-- Bulk properties -->
<input :="{ id: name, name, type:'text', value }" />

<!-- Effects (trigger any time foo or bar changes) -->
<div :="if (foo) bar()" :fx="void bar()" ></div>
```

#### `:on<event>="handler"`, `:on="events"`, `:<in>..<out>="handler"`

Add event listeners.

```html
<!-- Single event -->
<input type="checkbox" :onchange="e => isChecked=e.target.value">

<!-- Multiple events -->
<input :value="text" :oninput:onchange="e => text=e.target.value">

<!-- Sequence of events -->
<button :onfocus..onblur="e => {
  // onfocus
  let id = setInterval(track,200)
  return e => {
    // onblur
    clearInterval(id)
  }
}">

<!-- Event modifiers -->
<button :onclick.throttle-500="handler">Not too often</button>

<!-- Bulk/custom events -->
<button :on="{ click: handler, touch: handler, special: handler }">Submit</button>
```

##### Event modifiers

* `.once`, `.passive`, `.capture` – listener [options](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#options).
* `.prevent`, `.stop` – prevent default or stop propagation.
* `.window`, `.document`, `.outside`, `.self` – specify event target.
* `.throttle-<ms>`, `.debounce-<ms>` – defer function call with one of the methods.
* `.toggle` – run function and its result in turn.
* `.ctrl`, `.shift`, `.alt`, `.meta`, `.arrow`, `.enter`, `.escape`, `.tab`, `.space`, `.backspace`, `.delete`, `.digit`, `.letter`, `.character` – filter by [`event.key`](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values).
* `.ctrl-<key>, .alt-<key>, .meta-<key>, .shift-<key>` – key combinations, eg. `.ctrl-alt-delete` or `.meta-x`.
* `.*` – any other modifier has no effect, but allows binding multiple handlers to same event (like jQuery event classes).

#### `:data="values"`

Set [data-*](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/data-*) attributes. CamelCase is converted to dash-case.

```html
<input :data="{foo: 1, barBaz: true}" />
<!--
<input data-foo="1" data-bar-baz="true" />
-->
```

#### `:aria="values"`

Set [aria-role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) attributes. Boolean values are stringified.

```html
<input role="combobox" :aria="{
  controls: 'joketypes',
  autocomplete: 'list',
  expanded: false,
  activeOption: 'item1',
  activedescendant: ''
}" />
<!--
<input role="combobox" aria-controls="joketypes" aria-autocomplete="list" aria-expanded="false" aria-active-option="item1" aria-activedescendant="">
-->
```

#### `:with="data"`

Define variables for a subtree fragment scope.

```html
<!-- Inline data -->
<x :with="{ foo: 'bar' }" :text="foo"></x>

<!-- External data -->
<y :with="data"></y>

<!-- Transparency -->
<x :with="{ foo: 'bar' }">
  <y :with="{ baz: 'qux' }" :text="foo + baz"></y>
</x>
```

#### `:ref="id"`

Expose element to data scope with the `id`:

```html
<!-- single item -->
<textarea :ref="text" placeholder="Enter text..."></textarea>

<!-- iterable items -->
<ul>
  <li :each="item in items" :ref="item">
    <input :onfocus..onblur="e => (item.classList.add('editing'), e => item.classList.remove('editing'))"/>
  </li>
</ul>

<script type="module">
  import sprae from 'sprae';
  let state = sprae(document, {items: ['a','b','c']})

  // element is in the state
  state.text // <textarea></textarea>
</script>
```

## Sandbox

Expressions are sandboxed, ie. have no access to global or window (since sprae can be run in server environment).

Default sandbox provides: _Array_, _Object_, _Number_, _String_, _Boolean_, _Date_, _console_.

Sandbox can be extended via `Object.assign(sprae.globals, { BigInt, window, document })` etc.

## Examples

* TODO MVC: [demo](https://dy.github.io/sprae/examples/todomvc), [code](https://github.com/dy/sprae/blob/main/examples/todomvc.html)
* Wavearea: [demo](https://dy.github.io/wavearea?src=//cdn.freesound.org/previews/586/586281_2332564-lq.mp3), [code](https://github.com/dy/wavearea)

## Justification

_Sprae_ is lightweight essential alternative to [alpine](https://github.com/alpinejs/alpine), [petite-vue](https://github.com/vuejs/petite-vue), [templize](https://github.com/dy/templize) or JSX with better ergonomics.

* [Template-parts](https://github.com/dy/template-parts) / [templize](https://github.com/dy/templize) is progressive, but is stuck with native HTML quirks ([parsing table](https://github.com/github/template-parts/issues/24), [svg attributes](https://github.com/github/template-parts/issues/25), [liquid syntax](https://shopify.github.io/liquid/tags/template/#raw) conflict etc). Also ergonomics of `attr="{{}}"` is inferior to `:attr=""` since it creates flash of uninitialized values.
* [Alpine](https://github.com/alpinejs/alpine) / [vue](https://github.com/vuejs/petite-vue) / [lit](https://github.com/lit/lit/tree/main/packages/lit-html) escapes native HTML quirks, but the syntax is a bit scattered: `:attr`, `v-*`,`x-*`, `@evt`, `{{}}` can be expressed with single convention. Besides, functionality is too broad and can be reduced to essence: perfection is when there's nothing to take away, not add. Also they tend to [self-encapsulate](https://github.com/alpinejs/alpine/discussions/3223), making interop hard.
* React/[preact](https://ghub.io/preact) does the job wiring up JS to HTML, but with an extreme of migrating HTML to JSX and enforcing SPA, which is not organic for HTML. Also it doesn't support reactive fields (needs render call).

_Sprae_ takes convention of _templize directives_ (_alpine_/_vue_ attrs) and builds upon [_@preact/signals_](https://ghub.io/@preact/signals).

* It doesn't break static html markup.
* It falls back to element content if uninitialized.
* It doesn't enforce SPA nor JSX.
* It enables island hydration.
* It reserves minimal syntax space as `:` convention (keeping tree neatly decorated, not scattered).
* Expressions are naturally reactive and incur minimal updates.
* Input data may contain [signals](https://ghub.io/@preact/signals) or [reactive values](https://ghub.io/sube).
* Elements / data API is open and enable easy interop.


It is reminiscent of [XSLT](https://www.w3schools.com/xml/xsl_intro.asp), considered a [buried treasure](https://github.com/bahrus/be-restated) by web-connoisseurs.


<p align="center"><a href="https://github.com/krsnzd/license/">🕉</a></p>
