# Flac to MP3

Convert .flac files to .mp3.

## Usage

First install ffmpeg.

On Mac, `brew install ffmpeg` is the easiest option. For others, visit [ffmpeg.org](https://www.ffmpeg.org/download.html).

To test whether ffmpeg is installed, simply run `ffmpeg` on the command line. You should see output like the following:

```
ffmpeg version 2.6 Copyright (c) 2000-2015 the FFmpeg developers
  built with Apple LLVM version 6.0 (clang-600.0.56) (based on LLVM 3.5svn)
  configuration: --prefix=/usr/local/Cellar/ffmpeg/2.6 --enable-shared --enable-pthreads --enable-gpl --enable-version3 --enable-hardcoded-tables --enable-avresample --cc=clang --host-cflags= --host-ldflags= --enable-libx264 --enable-libmp3lame --enable-libvo-aacenc --enable-libxvid --enable-vda
  libavutil      54. 20.100 / 54. 20.100
  libavcodec     56. 26.100 / 56. 26.100
  libavformat    56. 25.101 / 56. 25.101
  libavdevice    56.  4.100 / 56.  4.100
  libavfilter     5. 11.102 /  5. 11.102
  libavresample   2.  1.  0 /  2.  1.  0
  libswscale      3.  1.101 /  3.  1.101
  libswresample   1.  1.100 /  1.  1.100
  libpostproc    53.  3.100 / 53.  3.100
Hyper fast Audio and Video encoder
usage: ffmpeg [options] [[infile options] -i infile]... {[outfile options] outfile}...
```

### Install flac-to-mp3

```
npm install flac-to-mp3
```


### To use flac-to-mp3

```
var f2m = require("flac-to-mp3")

f2m.convert(
	"path/to/file.flac",
	function(data) {
		console.log(data.err.toString())
	}
)
```

## Todo

- Create a proper test suite
- Add a `convertDir()` method

## Tests

Soon to be suited up with Mocha and Chai.

Test files are available from [www.eclassical.com](http://www.eclassical.com/pages/24-bit-faq.html).

The tests use the following files:

- [BIS1536-001-flac_16.flac](http://www.eclassical.com/custom/eclassical/files/BIS1536-001-flac_16.flac)
- [BIS1536-001-flac_24.flac](http://www.eclassical.com/custom/eclassical/files/BIS1536-001-flac_24.flac)
- [BIS1447-002-flac_16.flac](http://www.eclassical.com/custom/eclassical/files/BIS1447-002-flac_16.flac)
- [BIS1447-002-flac_24.flac](http://www.eclassical.com/custom/eclassical/files/BIS1447-002-flac_24.flac)
