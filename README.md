# shasum-cli
A CLI tool for computing sha256, sha384, sha512 sum or SRI of a file or stdin

```
npm install -g shasum-cli
```

You think that `sri-toolbox` is too much for your pet project and you want to just compute SRI of your local files? This little CLI tool should come in handy.

Supports all the options which you are might be familiar with from Linux's sha256sum, sha384sum and sha512sum. As well as `-s, --sri` option for printing copypastable output for `integrity` attribute .

Usage example for sha384sum command:

```

  Usage: sha384sum [options] <file ...>

  Options:

    -h, --help        output usage information
    -V, --version     output the version number
    -b, --binary      read in binary mode
    -c, --check       read SHA384 sums from the FILEs and check them
    --tag             create a BSD-style checksum
    -t, --text        read in text mode (default)
    --base64          Output hash in base64
    -s, --sri         SRI output format for hash (sha384- prefix and base64)
    --ignore-missing  don't fail or report status for missing files
    --quiet           don't print OK for each successfully verified file
    --status          don't output anything, status code shows success
    --strict          exit non-zero for improperly formatted checksum lines
    -w, --warn        warn about improperly formatted checksum lines
```

Example run:

```bash
$ sha384sum -s bootstrap.min.css
sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u  bootstrap.min.css
```
