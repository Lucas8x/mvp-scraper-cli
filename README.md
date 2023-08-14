# MVP Scraper CLI

CLI for extracting information about ragnarok mvp monsters

## Features

- [x] Save mvp info data
- [x] Download mvp sprite
- [x] Download animated mvp sprite
- [x] Download respawn map image
- [x] Can ignore mvp with no respawn
- [x] Filter mvp stats
- [x] Easily change language of mvps names

## Requirements

- [Divine Pride API Key](https://www.divine-pride.net/account)
  - Create an account and your key will be available on the profile page

## Usage

### Interactive

```shell
npx mvp-scraper@latest
```

### Non-interactive

```shell
mvp-scrap [options]

Options:
  -v, --version
    output the version number

  -k, --key <key>
    Your divine pride api key

  -o, --output <output>
    Where to write output

  -s, --sprites
    Enable save sprites

  -as, --anim-sprites
    Enable save animated sprites

  -m, --map
    Enable save map images

  -i, --ignore
    Ignore mvp with no spawn locations

  -sv, --server
    Define data from which server
```
