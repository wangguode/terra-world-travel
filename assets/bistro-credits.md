# Bistro scene attribution

- Work: Amazon Lumberyard Bistro v5.2.
- Creator and copyright holder: Amazon.com, Inc. or its affiliates.
- Original source: https://developer.nvidia.com/orca/amazon-lumberyard-bistro
- Asset license: Creative Commons Attribution 4.0 International (CC BY 4.0), https://creativecommons.org/licenses/by/4.0/ .
- glTF conversion/distribution: https://github.com/neftaly/bistro-gltf/tree/41b6f6ca07da385b5be8f632f440b25a03a427f5 .
- Imported variant: `variants/web/Bistro.gltf`, its referenced `Bistro.bin` and 276 AVIF textures, stored locally in `public/models/bistro/`.
- Upstream modifications: conversion from FBX to glTF, processed PBR materials/textures, compressed geometry, and a lossy web distribution using Draco and AVIF.
- Local modifications: JSON whitespace compacted only; scene geometry, materials, texture data and resource URIs preserved. Runtime placement/scale/lighting are application choices. This derivative is not endorsed by Amazon or the conversion author.
- Original supplied attribution/license text is retained at `public/models/bistro/LICENSE.txt` and shipped with the assets.

This is a European streetscape used as a reusable realistic browser scene. It is not an authored Asian temple, a generated world model, or proof of cinematic rendering performance on every device.

## Import verification

Imported 2026-11-13 from the pinned commit above: 279 files including the glTF manifest and original supplied license; 76,504,830 bytes total. The binary is 25,565,000 bytes (24.38 MiB), below Cloudflare's 25 MiB per-asset ceiling. All 277 referenced resources exist locally, all 276 textures have AVIF container signatures, buffer length equals the manifest's declared length, and no downloaded resource is a Git LFS pointer. Largest texture: 1,095,355 bytes. glTF SHA-256: `b4b50c925861c7fa5c139fa94104a887de07045fb9bdf1ae0d36e9418897e3e1`.
