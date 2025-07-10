<div align="center">
<img src="https://raw.githubusercontent.com/garage44/expressio/refs/heads/main/packages/expressio/src/assets/img/logo.svg" width="120" alt="Expressio" />

## Expressio

*I18n for humans, through AI*

AI-Powered Translation & i18n Workflow Automation

**Transform your localization workflow with intelligent automation**

[![License](https://img.shields.io/badge/License-AGPLv3-blue.svg)](./packages/expressio/LICENSE.md)
[![Bun](https://img.shields.io/badge/Powered%20by-Bun-black.svg)](https://bun.sh/)
[![DeepL](https://img.shields.io/badge/Supports-DeepL-0F2B46.svg)](https://www.deepl.com/)
[![Claude](https://img.shields.io/badge/Supports-Claude-orange.svg)](https://www.anthropic.com/)
</div>

<div align="center">

**Built with** [Bun](https://bun.sh/) ⚡ **+** [I18Next](https://www.i18next.com/) 🌐 **+** [Preact](https://preactjs.com/) ⚛️

<table>
<tr>
<td width="25%" align="center">
<strong>🔧 <a href="./packages/bunchy/README.md">Bunchy</a></strong><br>
<em>Task Runner</em><br>
<a href="./packages/bunchy/LICENSE.md">MIT License</a>
</td>
<td width="25%" align="center">
<strong>🔗 <a href="./packages/common/README.md">Common</a></strong><br>
<em>Shared Components</em><br>
<a href="./packages/common/LICENSE.md">MIT License</a>
</td>
<td width="25%" align="center">
<strong>🌐 <a href="./packages/enola/README.md">Enola</a></strong><br>
<em>Translation Engine</em><br>
<a href="./packages/enola/LICENSE.md">MIT License</a>
</td>
<td width="25%" align="center">
<strong>🎯 <a href="./packages/expressio/">Expressio</a></strong><br>
<em>Main Application</em><br>
<a href="./packages/expressio/LICENSE.md">AGPLv3 License</a>
</td>
</tr>
</table>
</div>



## 🚀 Quick Start

**Get Started in 30 Seconds**

```bash
bunx @garage44/expressio start
# 🔑 Login: admin/admin (customize in ~/.expressiorc)
```


<br>

## ✨ Key Features

<div align="center">
<table>
<tr>
<td align="center" width="33%">
<img src="https://raw.githubusercontent.com/garage44/expressio/refs/heads/main/.github/screenshot-login.png" width="280" alt="Responsive Single Page Application"/>
<h3>⚡ Responsive SPA</h3>
<p>Lightning-fast single page application with thoughtful UX design and real-time updates</p>
</td>
<td align="center" width="33%">
<img src="https://raw.githubusercontent.com/garage44/expressio/refs/heads/main/.github/screenshot-config.png" width="280" alt="Intuitive Configuration"/>
<h3>⚙️ Intuitive Setup</h3>
<p>Zero-friction configuration with smart defaults and guided onboarding</p>
</td>
<td align="center" width="33%">
<img src="https://raw.githubusercontent.com/garage44/expressio/refs/heads/main/.github/screenshot-workspace.png" width="280" alt="Live Translation Workflow"/>
<h3>🔄 Live Workflow</h3>
<p>Real-time collaboration with instant previews and automatic synchronization</p>
</td>
</tr>
</table>
</div>

<br>

## 🔥 Why Choose Expressio?

**Revolutionize your i18n workflows** with cutting-edge AI translation and intelligent automation.
Built on [Enola](https://github.com/garage44/packages/enola), seamlessly connecting with [DeepL](https://www.deepl.com/) and [Anthropic Claude](https://www.anthropic.com/).


<img src="https://raw.githubusercontent.com/garage44/expressio/refs/heads/main/.github/screenshot-workspace-config.png" width="700" alt="Advanced Workspace Configuration" />

<br/>

**Complete i18n automation toolkit with enterprise-grade features**

* **Instant machine translation** - source-text oriented workflow
* **Zero-config startup** - works out of the box
* **Smart caching** - optimized for performance & low translation provider costs
* **Service-agnostic design** - switch between LLM providers like Deepl, Claude, etc.
* **Extensive language coverage** - ISO 639-2, including languages other tools are missing
* **Hot-reload workflow** - see changes when they happen
* **Modern SPA interface** - real-time collaboration using Websockets
* **API-first** - integrate with existing tools like [I18next](https://www.i18next.com/)


*Enterprise features? [Contact us](mailto:info@expressio.tech) for custom solutions.*

## 🛠️ Development

**Ready to contribute? Get started locally:**


```bash
# 📥 Clone the repository
git clone git@github.com:garage44/expressio.git
cd expressio

# 📦 Install dependencies
bun install

# 🚀 Start development server
cd packages/expressio
bun run dev

# 🚀 Or to skip memory session authorization between reloads:
GARAGE44_NO_SECURITY=1 bun run dev
```
