# ∴ spræ [![tests](https://github.com/dy/sprae/actions/workflows/node.js.yml/badge.svg)](https://github.com/dy/sprae/actions/workflows/node.js.yml) [![size](https://img.shields.io/bundlephobia/minzip/sprae?label=size)](https://bundlephobia.com/result?p=sprae) [![npm](https://img.shields.io/npm/v/sprae?color=orange)](https://npmjs.org/sprae)

> DOM microhydration with `:` attributes

A lightweight essential alternative to [alpine](https://github.com/alpinejs/alpine), [petite-vue](https://github.com/vuejs/petite-vue), [templize](https://github.com/dy/templize) or JSX with better ergonomics[*](#justification).


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
* `state` is object reflecting current values, changing any of its props rerenders subtree.

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
<ul :with="{items: ['a','b','c']}">
  <li :each="item in items" :text="item">Untitled</li>
</ul>

<!-- Cases -->
<li :each="item, idx in list" />
<li :each="val, key in obj" />
<li :each="idx, idx0 in number" />

<!-- Loop by condition -->
<li :if="items" :each="item in items" :text="item" />
<li :else>Empty list</li>

<!-- To avoid FOUC -->
<style>[:each]{visibility: hidden}</style>
```

#### `:text="value"`

Set text content of an element. Default text can be used as fallback:

```html
Welcome, <span :text="user.name">Guest</span>.
```

#### `:class="value"`

Set class value from either string, array or object.

```html
<div :class="`foo ${bar}`"></div>
<div :class="['foo', 'bar']"></div>
<div :class="{foo: true, bar: false}"></div>
```

#### `:style="value"`

Set style value from object or a string.

```html
<div :style="foo: bar"></div>
<div :style="{foo: 'bar'}"></div>
```

<!--
#### `:value="value"`

Set value of an input, textarea or select.

```html
<input :with="{text: ''}" :value="text" />
<textarea :with="{text: ''}" :value="text" />

<select :with="{selected: 0}" :value="selected">
  <option :each="i in 5" :value="i" :text="i"></option>
</select>
```
-->

#### `:<prop>="value"`, `:="props"`

Set any prop value.

```html
<!-- Single property -->
<label :for="name" :text="name" />

<!-- Multiple properties -->
<input :id:name="name" />

<!-- Bulk properties -->
<input :="{ id: name, name, type:'text', value }" />
```

#### `:on<event>="handler"`, `:on="events"`

Add event listeners.

```html
<!-- Single event -->
<input type="checkbox" :onchange="e => isChecked=e.target.value">

<!-- Multiple events -->
<input :value="text" :oninput:onchange="e => text=e.target.value">

<!-- Sequence of events -->
<button :onfocus-onblur="e => { // onfocus
  let id = setInterval(track,200)
  return e => { // onblur
    clearInterval(id)
  }
}">

<!-- Bulk/custom events -->
<button :on="{ click: handler, touch: handler, special: handler }">Submit</button>
```

#### `:with="data"`

Set data for a subtree fragment scope.

```html
<!-- Inline data -->
<x :with="{ foo: 'bar' }" :text="foo"></x>

<!-- External data -->
<y :with="data"></y>

<!-- Inheritance -->
<x :with="{ foo: 'bar' }">
  <y :with="{ baz: 'qux' }" :text="foo + baz"></y>
</x>

<!-- Single property -->
<li :with="this as li">
  <input :onfocus-onblur="e => (li.classList.add('editing'), e => li.classList.remove('editing'))" />
</li>
```

#### `:data="values"`

Set [data-*](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/data-*) attributes. CamelCase is converted to dash-case.

```html
<input :data="{foo: 1, barBaz: true}" />
```

#### `:aria="values"`

Set [aria-role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) attributes. Boolean values are stringified.

```html
<input type="text" id="jokes" role="combobox" :aria="{
  controls: 'joketypes',
  autocomplete: 'list',
  expanded: false,
  activeOption: 'item1',
  activedescendant: ''
}" />
```

<!--
#### `:ref="id"`

Expose element to a subtree fragment with the `id`.

```html
<li :with="{ item: this }">
  <input
    :onfocus="e => item.classList.add('editing')"
    :onblur="e => item.classList.remove('editing')"
  />
</li>
```
-->

<!--

### Reactivity

_sprae_ is built on top of [_@preact/signals_](https://ghub.io/@preact/signals). That gives:

* Expressions don't require explicit access to `.value` (see [signal-struct](https://github.com/dy/signal-struct))
* Expressions support any reactive values in data (see [sube](https://github.com/dy/sube))
* Updates happen minimally only when used values update
* Subscription is weak and get disposed when element is disposed.

Directive expressions are natively reactive, ie. data may contain any async/reactive values, such as:

* _Promise_ / _Thenable_
* _Observable_ / _Subject_ / _Subscribable_
* _AsyncIterable_
* _observ-*_
* etc., see [sube](https://github.com/dy/sube/blob/main/README.md) for the full list.

This way, for example, _@preact/signals_ or _rxjs_ can be connected directly bypassing subscription or reading value.
-->

## Hints

**1.** Attributes are initialized in order, so pay attention providing scope attributes:

```html
<li :each="item in items" :ref="li">
  <button :onclick="e => li.classList.add('loading')"></button>
</li>

<li :ref="li" :each="item in items">
  <!-- Invalid: li is undefined -->
  <button :onclick="e => li.classList.add('loading')"></button>
</li>
```

**2.** Data allows signals values, which can be an alternative way to control template state:

```html
<div id="done" :text="loading ? 'loading' : result">...</div>

<script type="module">
  import sprae from 'sprae';
  import { signals } from '@preact/signals';

  // <div id="done">...</div>

  const loading = signal(true), result = signal(false);
  sprae(done, { loading, result })
  setTimeout(() => (loading.value = true, result.value = 'done'), 1000)

  // <div id="done">loading</div>

  // ... 1s after
  // <div id="done">done</div>
</script>
```

**3.** Data recognizes reactive values as inputs as well: _Promise_ / _Thenable_, _Observable_ / _Subscribable_, _AsyncIterable_ (etc., see [sube](https://github.com/dy/sube/blob/main/README.md)). This way, for example, _rxjs_ can be connected to template directly.

```html
<div :text="clicks"></div>

<script type="module">
  import sprae from 'sprae';
  import { fromEvent, scan } from 'rxjs';
  sprae(document, {
    clicks: fromEvent(document, 'click').pipe(scan((count) => count + 1, 0))
  });
</script>
```

## Examples

* TODO MVC: [demo](https://dy.github.io/sprae/examples/todomvc), [code](https://github.com/dy/sprae/blob/main/examples/todomvc.html)

## Justification

* [Template-parts](https://github.com/dy/template-parts) / [templize](https://github.com/dy/templize) is progressive, but is stuck with native HTML quirks ([parsing table](https://github.com/github/template-parts/issues/24), [svg attributes](https://github.com/github/template-parts/issues/25), [liquid syntax](https://shopify.github.io/liquid/tags/template/#raw) conflict etc). Also ergonomics of `attr="{{}}"` is inferior to `:attr=""` since it creates flash of uninitialized values.
* [Alpine](https://github.com/alpinejs/alpine) / [vue](https://github.com/vuejs/petite-vue) / [lit](https://github.com/lit/lit/tree/main/packages/lit-html) escapes native HTML quirks, but the syntax is a bit scattered: `:attr`, `v-*`,`x-*`, `@evt`, `{{}}` can be expressed with single convention. Besides, functionality is too broad and can be reduced to essence. Also they tend to [self-encapsulate](https://github.com/alpinejs/alpine/discussions/3223), making interop hard.
* React/[preact](https://ghub.io/preact) does the job wiring up JS to HTML, but with an extreme of migrating HTML to JSX and enforcing SPA, which is not organic for HTML. Also it doesn't support reactive fields (needs render call).

_sprae_ takes convention of _templize directives_ (_alpine_/_vue_ attrs) and builds upon [_@preact/signals_](https://ghub.io/@preact/signals).

* It doesn't break static html markup.
* It falls back to element content if uninitialized.
* It doesn't enforce SPA nor JSX.
* It enables island hydration.
* It introduces minimal syntax space as `:` convention.
* Expressions are naturally reactive and incur minimal updates.
* Input data may contain [signals](https://ghub.io/@preact/signals) or [reactive values](https://ghub.io/sube).

<p align="center"><a href="https://github.com/krsnzd/license/">🕉</a></p>
