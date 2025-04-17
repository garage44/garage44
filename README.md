# Expressio

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

- **Community Edition** (this package): Free and open-source core translation features
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

Checkout the [workspace repo](https://github.com/garage44/workspace) for the development setup.

## License
[AGPLv3](LICENSE.md)