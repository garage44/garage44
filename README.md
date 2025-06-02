# Expressio
<p align="center">
    <img src="https://raw.githubusercontent.com/garage44/expressio/refs/heads/main/.github/screenshot-0.png" width="350" title="Screenshot 0" />
    <img src="https://raw.githubusercontent.com/garage44/expressio/refs/heads/main/.github/screenshot-1.png" width="350" title="Screenshot 1" />
    <img src="https://raw.githubusercontent.com/garage44/expressio/refs/heads/main/.github/screenshot-2.png" width="350" title="Screenshot 2" />
</p>

Expressio is a tool that combines AI translation with i18n workflow automation.
It leverages a translation service wrapper called [Enola](https://github.com/garage44/packages/enola)
to connect with various translation providers like [DeepL](https://www.deepl.com/) and
[Anthropic Claude](https://www.anthropic.com/), while adding crucial workflow automation,
synchronization, and development tools on top.

Built with [Bun](https://bun.sh/) and [I18Next](https://www.i18next.com/).

## Getting started

Getting started with Expressio is quick and easy:

```bash
bunx @garage44/expressio start
# login with admin/admin (change password in ~.expressiorc for now)
```

## Editions

- **Community Edition** (this project): Free and open-source core translation features
    - 🚀 Instant machine translation
    - 🔄 Automatic sync of all translations when source text changes
    - 🌍 Support for extensive language coverage (ISO 639-1 and ISO 639-2)
    - 🎯 Access to less common languages typically overlooked by traditional services
    - 🔌 Service-agnostic design with extensible translation backends

- **Professional Edition**: Additional features for teams and enterprises (coming later)
    - 🔧 Advanced workflow automation
    - 👥 Team collaboration tools
    - 🔌 Enterprise integrations
    - 🛠️ Priority support

## Development

```bash
git checkout git@github.com:garage44/expressio.git
cd expressio
bun i
cd packages/expressio
bun run dev
```

## License
The opensource community edition of Expressio exists of multiple packages.

* [Bunchy](./packages/bunchy/README.md) ([MIT](./packages/bunchy/LICENSE.md))
* [Common](./packages/common/README.md) ([MIT](./packages/bunchy/LICENSE.md))
* [Enola](./packages/enola/README.md) ([MIT](./LICENSE.md))
* Expressio ([AGPLv3](./packages/expressio/LICENSE.md))

Interested in the upcoming professional edition of Expressio or related services?
[Contact us!](mailto:info@expressio.tech)