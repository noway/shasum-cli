# sha384sum
CLI tool for computing sha384 sum of a file or stdin

Can be used to generate sha384 SRI from command line.

```

  Usage: index [options] <file ...>

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -b, --binary   read in binary mode
    -c, --check    read SHA384 sums from the FILEs and check them
    --tag          create a BSD-style checksum
    -t, --text     read in text mode (default)
    --base64       Output hash in base64
    -s, --sri      SRI output format for hash (sha384- prefix and base64)

```