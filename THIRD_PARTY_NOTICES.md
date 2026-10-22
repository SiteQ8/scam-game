# Third party notices

This game is released under the MIT License, © 2026 Ali AlEnezi (see [LICENSE](LICENSE)). It includes the third party components below, each under its own license. The full texts of the SIL Open Font License, the MIT License and the ISC License follow the list.

## Fonts

The font files are used unchanged, as published in their Fontsource packages. They are redistributed in `app/src/assets/fonts/`, inside the iPhone and Android apps, and on the website in `docs/assets/fonts/` and `docs/play/assets/`.

### Alexandria

* Package: `@fontsource-variable/alexandria` 5.3.0
* License: SIL Open Font License, Version 1.1
* Copyright 2022 The Alexandria Project Authors (https://github.com/Gue3bara/Alexandria)

### IBM Plex Sans Arabic

* Package: `@fontsource/ibm-plex-sans-arabic` 5.3.0
* License: SIL Open Font License, Version 1.1
* Copyright 2019 IBM Corp. All rights reserved.

## Icons

### Lucide

* Package: `lucide-static` 1.58.0. `scripts/build-icons.mjs` copies the markup of the icons the app uses into `app/src/ui/icons.generated.ts`.
* License: ISC License
* Copyright (c) 2026 Lucide Icons and Contributors
* The icons that Lucide derives from Feather are under the MIT License, Copyright (c) 2013-present Cole Bemis. Of those, the app uses arrow-left, arrow-right, calendar, check, chevron-left, chevron-right, crosshair, download, info, link, lock, moon, music, search, shopping-bag, smartphone, target, type, x.

## Libraries

These are bundled into the app. The JavaScript parts are also in the browser version in `docs/play/`.

| Component | Version | License | Copyright |
|---|---|---|---|
| Preact | 10.29.8 | MIT | Copyright (c) 2015-present Jason Miller |
| @preact/signals | 2.11.3 | MIT | Copyright (c) 2022-present Preact Team |
| @preact/signals-core | 1.14.4 | MIT | Copyright (c) 2022-present Preact Team |
| Capacitor: @capacitor/core, @capacitor/android, @capacitor/ios | 8.5.3 | MIT | Copyright (c) 2017-present Drifty Co. |
| @capacitor/app | 8.1.2 | MIT | Copyright 2020-present Ionic (https://ionic.io) |
| @capacitor/haptics | 8.0.2 | MIT | Copyright 2020-present Ionic (https://ionic.io) |
| @capacitor/preferences | 8.0.1 | MIT | Copyright 2020-present Ionic (https://ionic.io) |
| @capacitor/share | 8.0.3 | MIT | Copyright 2020-present Ionic (https://ionic.io) |
| @capacitor/splash-screen | 8.0.2 | MIT | Copyright 2020-present Ionic (https://ionic.io) |
| @capacitor/status-bar | 8.0.4 | MIT | Copyright 2020-present Ionic (https://ionic.io) |
| Vite, for the small module preload helper it adds to the bundle | 7.3.7 | MIT | Copyright (c) 2019-present, VoidZero Inc. and Vite contributors |

## Native code under the Apache License 2.0

The iPhone and Android apps also contain code that comes with Capacitor under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).

* Apache Cordova. Capacitor's Cordova compatibility layer on iOS includes Apache Cordova code, and Capacitor for Android links the Apache Cordova Android framework 14.0.1. Copyright The Apache Software Foundation. This product includes software developed at The Apache Software Foundation (http://www.apache.org/).
* Two files of Capacitor for Android: `UriMatcher.java`, Copyright (C) 2006 The Android Open Source Project, and `WebViewLocalServer.java`, Copyright 2015 Google Inc. All rights reserved.
* The AndroidX libraries that Capacitor uses and their dependencies, such as the Kotlin standard library, Copyright The Android Open Source Project and their other authors.

## Audio

The call voices, music and sound effects were generated with ElevenLabs for this project.

## Build and test tools

Tools used only to build and test the project, such as esbuild, TypeScript, Vitest, jsdom, the Capacitor command line tools and the qrcode package that draws the training QR codes at build time, are not part of the shipped code. Their licenses are in their packages.

## SIL Open Font License 1.1

This text applies to Alexandria and IBM Plex Sans Arabic, with the copyright lines given above.

```text
-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
```

## MIT License

This text applies to every component marked MIT above and to the Feather icons, each with its own copyright line.

```text
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## ISC License

This text applies to Lucide, with the copyright line given above.

```text
ISC License

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```
